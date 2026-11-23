import { Fragment, useId, useState, type FormEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { FileCode2 } from 'lucide-react';
import {
  isCodeAssessment, NODE_REVIEW_LIMIT, NODE_REVIEW_PASS, reviewLines,
  type CodeAssessment as Assessment, type CodeFinding,
} from '../../shared/node-code-review';
import './code-assessment.css';

async function assessCode(lesson: string, code: string): Promise<Assessment> {
  if (window.recallNode) {
    if (!window.recallNode.review) throw Error('Перезапусти Recall, щоб відкрити оцінювання коду.');
    return window.recallNode.review({ lesson, code });
  }
  const response = await fetch('/api/backend-path/code-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Backend-Path': '1' },
    body: JSON.stringify({ lesson, code }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw Error(error?.message || 'Luna зараз недоступна. Спробуй ще раз.');
  }
  return response.json();
}

function FindingDetail({ finding }: { finding: CodeFinding }) {
  const labels = { blocking: 'Основна вимога', error: 'Помилка', minor: 'Невеликий недолік', suggestion: 'Покращення' };
  return <>
    <p><strong>{labels[finding.severity]}</strong>{finding.deduction > 0 && <> (−{finding.deduction})</>} · {finding.explanation}</p>
    {finding.replacement && <><span>Запропонована заміна</span><pre>{finding.replacement}</pre></>}
  </>;
}

type ActiveNote = {
  issue: CodeFinding;
  anchor: HTMLButtonElement;
  pinned: boolean;
};

function AnnotatedCode({ code, findings }: { code: string; findings: CodeFinding[] }) {
  const tooltipId = useId();
  const [active, setActive] = useState<ActiveNote | null>(null);
  const byLine = new Map<number, CodeFinding[]>();
  for (const issue of findings) {
    if (!issue.location) continue;
    const line = issue.location.line;
    const items = byLine.get(line) ?? [];
    items.push(issue);
    byLine.set(line, items);
  }

  function toggle(event: MouseEvent<HTMLButtonElement>, issue: CodeFinding) {
    const anchor = event.currentTarget;
    setActive(current => current?.issue === issue && current.pinned ? null : { issue, anchor, pinned: true });
  }

  const clearPreview = (issue: CodeFinding) => {
    setActive(current => current?.issue === issue && !current.pinned ? null : current);
  };

  const anchor = active?.anchor.getBoundingClientRect();
  const tipWidth = Math.min(340, window.innerWidth - 24);
  const below = anchor && anchor.top < window.innerHeight / 2;

  return <>
    <p className="code-review-instruction">Наведи на підкреслення або натисни його, щоб побачити пояснення.</p>
    <div className="code-review-source" aria-label="Код із зауваженнями"
      onScroll={() => setActive(null)}
      onKeyDown={event => { if (event.key === 'Escape') setActive(null); }}>
      {reviewLines(code).map((line, index) => {
        let offset = 0;
        const issues = (byLine.get(index + 1) ?? []).sort((a, b) => a.location!.start - b.location!.start);
        return <div className="code-review-line" key={index}>
          <span aria-hidden="true">{index + 1}</span>
          <code>{issues.map(issue => {
            const { start, end } = issue.location!;
            const prefix = line.slice(offset, start);
            const isActive = active?.issue === issue;
            offset = end;
            return <Fragment key={start}>
              {prefix}<button type="button" className={`code-review-mark is-${issue.severity === 'blocking' || issue.severity === 'error' ? 'error' : 'suggestion'}`}
                aria-describedby={isActive ? tooltipId : undefined}
                onMouseEnter={event => {
                  const anchor = event.currentTarget;
                  setActive(current => current?.pinned ? current : { issue, anchor, pinned: false });
                }}
                onMouseLeave={event => { if (!event.currentTarget.matches(':focus-visible')) clearPreview(issue); }}
                onFocus={event => setActive({ issue, anchor: event.currentTarget, pinned: false })}
                onBlur={() => setActive(current => current?.issue === issue ? null : current)}
                onClick={event => toggle(event, issue)}>{line.slice(start, end)}</button>
            </Fragment>;
          })}{line.slice(offset) || (line.length ? '' : '\u00a0')}</code>
        </div>;
      })}
    </div>
    {active && anchor && createPortal(
      <div id={tooltipId} role="tooltip" className="code-review-tooltip"
        style={{
          width: tipWidth,
          left: Math.max(12, Math.min(anchor.left, window.innerWidth - tipWidth - 12)),
          top: below ? anchor.bottom + 8 : anchor.top - 8,
          transform: below ? undefined : 'translateY(-100%)',
        }}>
        <FindingDetail finding={active.issue} />
      </div>, document.body)}
  </>;
}

export function CodeReview({ lesson, onAssessment }: { lesson: string; onAssessment: (score: number | null) => void }) {
  const headingId = useId();
  const inputId = useId();
  const [code, setCode] = useState('');
  const [review, setReview] = useState<{ code: string; result: Assessment } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const current = review?.code === code ? review.result : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || current || !code.trim() || code.length > NODE_REVIEW_LIMIT) return;
    setError('');
    setPending(true);
    try {
      const result = await assessCode(lesson, code);
      if (!isCodeAssessment(result)) throw Error('Для нової рубрики потрібен перезапуск Recall або локального сервера Backend Path.');
      setReview({ code, result });
      onAssessment(result.score);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Luna зараз недоступна.';
      setError(message.replace(/^Error invoking remote method '[^']+': (?:Error: )?/, ''));
    } finally {
      setPending(false);
    }
  }

  return <section className="code-review" aria-labelledby={headingId}>
    <h3 id={headingId}><FileCode2 size={19} aria-hidden="true" /> Оцінка коду від Luna</h3>
    <p>Встав реалізацію для перевірки. Для завершення уроку потрібно щонайменше {NODE_REVIEW_PASS}/100.</p>
    <form onSubmit={submit}>
      <label htmlFor={inputId}>Твій код</label>
      <textarea id={inputId} rows={8} spellCheck={false} autoCapitalize="off"
        aria-describedby={inputId + '-hint'} value={code} onChange={event => setCode(event.target.value)} />
      <div className="code-review-actions">
        <button className="button primary" type="submit" disabled={pending || !!current || !code.trim() || code.length > NODE_REVIEW_LIMIT}>
          {pending ? 'Оцінюємо…' : current ? 'Цю версію оцінено' : 'Оцінити код'}
        </button>
        <small id={inputId + '-hint'} data-over-limit={code.length > NODE_REVIEW_LIMIT}>
          {code.length.toLocaleString('uk-UA')} / {NODE_REVIEW_LIMIT.toLocaleString('uk-UA')} символів
        </small>
      </div>
    </form>
    {error && <p role="alert" className="code-review-error">{error} Код залишився в полі.</p>}
    <div aria-live="polite">
      {pending && <p className="code-review-status">Luna читає код і критерії вправи.</p>}
      {!pending && review && !current && <p className="code-review-status">Ти змінив код. Оціни нову версію, щоб оновити коментарі.</p>}
      {!pending && current && <div className="code-review-result">
        <div className="code-review-summary">
          {current.score !== null && <div className="code-review-score"><strong>{current.score}</strong><span> / 100</span></div>}
          <div>
            <h4>{current.score === null ? 'Потрібен код реалізації' :
              current.score >= NODE_REVIEW_PASS ? 'Прохідний бал' : 'Потрібне доопрацювання'}</h4>
            <p>{current.summary}</p>
          </div>
        </div>
        <small className="code-review-method">Статичний аналіз · пропозиції без штрафу{current.cached && ' · збережене рев’ю'}</small>
        {current.findings.some(issue => issue.location) && <AnnotatedCode code={code} findings={current.findings} />}
        {current.findings.length > 0 && <details className="code-review-notes" open={current.findings.some(issue => !issue.location)}>
          <summary>Усі зауваження ({current.findings.length})</summary>
          <ul>{current.findings.map((finding, index) => <li key={index}>
            {finding.location && <small>Рядок {finding.location.line}</small>}
            <FindingDetail finding={finding} />
          </li>)}</ul>
        </details>}
      </div>}
    </div>
  </section>;
}
