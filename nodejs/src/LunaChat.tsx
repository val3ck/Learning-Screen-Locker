import { useEffect, useRef, useState } from 'react';
import type { Step } from './lib/progress';
import {chatMarkup} from './chat-markup';

export const NODE_CHAT_LIMIT = 5;
export const NODE_CHAT_QUESTION_LIMIT = 1100;

export type NodeChatEntry =
  | { role: 'user'; question: string }
  | { role: 'assistant'; answer: string; provider?: string; model?: string };

export type BtwExchange = {
  question: string;
  answer: string;
  provider?: string;
  model?: string;
};

type ConversationState = {
  draft: string;
  code: string;
  btwMode: boolean;
  messages: NodeChatEntry[];
  btwCard: BtwExchange | null;
};

const emptyConversation = (): ConversationState => ({
  draft: '',
  code: '',
  btwMode: false,
  messages: [],
  btwCard: null,
});

function detectBtwPrefix(text: string): { hasPrefix: boolean; cleanText: string } {
  const match = /^\/(?:btw|бтв)(?:\s+|$)(.*)$/i.exec(text.trim());
  if (!match) return { hasPrefix: false, cleanText: text };
  return { hasPrefix: true, cleanText: match[1] };
}

export function LunaChat({
  lessonId,
  lessonTitle,
  section,
  externalOpen,
  onToggleOpen,
}: {
  lessonId: string;
  lessonTitle: string;
  section: Step;
  externalOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onToggleOpen?.(next);
  };

  const conversationsRef = useRef<Record<string, ConversationState>>({});
  const [, forceRender] = useState(0);
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [pendingBtw, setPendingBtw] = useState(false);
  const [error, setError] = useState('');

  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const scope = lessonId || 'roadmap';
  if (!conversationsRef.current[scope]) {
    conversationsRef.current[scope] = emptyConversation();
  }
  const current = conversationsRef.current[scope];
  const updateCurrent = (patch: Partial<ConversationState>) => {
    conversationsRef.current[scope] = { ...conversationsRef.current[scope], ...patch };
    forceRender(n => n + 1);
  };

  const prefixInfo = detectBtwPrefix(current.draft);
  const isBtwActive = current.btwMode || prefixInfo.hasPrefix;

  useEffect(() => {
    setError('');
  }, [scope]);

  useEffect(() => {
    if (open && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [open, current.messages.length, current.btwCard, pendingQuestion]);

  function handleToggleBtw() {
    if (pendingQuestion) return;
    if (prefixInfo.hasPrefix) {
      updateCurrent({ btwMode: false, draft: prefixInfo.cleanText });
    } else {
      updateCurrent({ btwMode: !current.btwMode });
    }
    setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 0);
  }

  async function submitQuestion(overrideQuestion?: string, forceBtw?: boolean) {
    if (pendingQuestion) return;
    const raw = (overrideQuestion ?? current.draft).trim();
    const parsedPrefix = detectBtwPrefix(raw);
    const btw = forceBtw ?? (current.btwMode || parsedPrefix.hasPrefix);
    const effectiveQuestion = parsedPrefix.hasPrefix
      ? parsedPrefix.cleanText.trim() || 'Розкажи короткий інженерний інсайт «до речі» (/бтв): як ця тема працює під капотом у Node.js / V8 і на чому часто ловляться розробники?'
      : raw || (btw ? 'Розкажи короткий інженерний інсайт «до речі» (/бтв): як ця тема працює під капотом у Node.js / V8 і на чому часто ловляться розробники?' : '');

    if (!effectiveQuestion) return;

    setError('');
    setPendingQuestion(effectiveQuestion);
    setPendingBtw(btw);

    try {
      let answer = '';
      let provider = 'openai';
      let model = 'Luna';

      const payloadQuestion = btw && !/^\/(?:btw|бтв)\b/i.test(raw)
        ? `/бтв ${effectiveQuestion}`
        : raw || `/бтв ${effectiveQuestion}`;

      if (window.recallNode) {
        const res = await window.recallNode.ask({
          lesson: scope,
          section,
          question: payloadQuestion,
          code: current.code,
          btw,
        });
        if (typeof res === 'string') {
          answer = res;
        } else if (res && typeof (res as any).answer === 'string') {
          answer = (res as any).answer;
          provider = (res as any).provider || provider;
          model = (res as any).model || model;
        }
      } else {
        const response = await fetch('/api/backend-path/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Backend-Path': '1',
          },
          body: JSON.stringify({
            lesson: scope,
            section,
            question: payloadQuestion,
            code: current.code,
            btw,
          }),
        });
        const data = (await response.json().catch(() => ({}))) as {
          answer?: string;
          provider?: string;
          model?: string;
          message?: string;
        };
        if (!response.ok || !data.answer) {
          throw new Error(data.message || 'Luna зараз недоступна.');
        }
        answer = data.answer;
        provider = data.provider || provider;
        model = data.model || model;
      }

      if (btw) {
        // /btw side question does NOT overwrite or evict the 5-message main lesson history!
        updateCurrent({
          draft: '',
          btwMode: false,
          btwCard: { question: effectiveQuestion, answer, provider, model },
        });
      } else {
        const nextMessages: NodeChatEntry[] = [
          ...current.messages,
          { role: 'user' as const, question: effectiveQuestion },
          { role: 'assistant' as const, answer, provider, model },
        ].slice(-NODE_CHAT_LIMIT);
        updateCurrent({
          draft: '',
          messages: nextMessages,
        });
      }
    } catch (err) {
      const msg = err instanceof Error
        ? err.message.replace(/^Error invoking remote method .*?: Error: /, '')
        : 'Чат тимчасово недоступний.';
      setError(msg);
    } finally {
      setPendingQuestion('');
      setPendingBtw(false);
    }
  }

  const displayedMessages: NodeChatEntry[] =
    pendingQuestion && !pendingBtw
      ? [...current.messages, { role: 'user' as const, question: pendingQuestion }].slice(-NODE_CHAT_LIMIT)
      : current.messages;

  const sectionLabel =
    section === 'practice' ? 'Практика' : section === 'check' ? 'Перевірка' : 'Лекція';

  return (
    <div
      className="node-chat-widget"
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          launcherRef.current?.focus({ preventScroll: true });
        }
      }}
    >
      <button
        ref={launcherRef}
        className="node-chat-launcher"
        type="button"
        aria-expanded={open}
        aria-controls="node-chat-panel"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 0);
        }}
      >
        <span>Luna</span>
        {current.messages.length > 0 && (
          <small className="node-chat-count" aria-label={`Історія: ${current.messages.length} з ${NODE_CHAT_LIMIT}`}>
            {current.messages.length}/{NODE_CHAT_LIMIT}
          </small>
        )}
      </button>

      {open && (
        <section className="node-chat" id="node-chat-panel" aria-labelledby="node-chat-title">
          <header className="node-chat-header">
            <h2 id="node-chat-title">
              Luna <span>{lessonTitle} · {sectionLabel}</span>
            </h2>
            <div className="node-chat-header-actions">
              <button
                type="button"
                className={`node-chat-btw-btn ${isBtwActive ? 'active' : ''}`}
                aria-pressed={isBtwActive}
                title="Побічне питання (/бтв) — не засмічує історію 5 повідомлень"
                onClick={handleToggleBtw}
              >
                /бтв
              </button>
              <button
                className="node-chat-close"
                type="button"
                aria-label="Згорнути чат Luna"
                onClick={() => {
                  setOpen(false);
                  launcherRef.current?.focus({ preventScroll: true });
                }}
              >
                ×
              </button>
            </div>
          </header>

          <div className="node-chat-content">
            <p className="node-chat-note">
              Історія тримає останні <b>{NODE_CHAT_LIMIT} повідомлень</b> цього уроку. Натисни{' '}
              <button type="button" className="node-chat-inline-btw" onClick={handleToggleBtw}>
                /бтв
              </button>{' '}
              для побічного питання поза контекстом основної гілки.
            </p>

            { displayedMessages.length > 0 && (
              <div ref={logRef} className="node-chat-messages" role="log" aria-label="Діалог з Luna">
                {displayedMessages.map((message, index) => (
                  <div
                    key={index}
                    className={message.role === 'user' ? 'node-chat-user' : 'node-chat-assistant'}
                  >
                    <strong>
                      {message.role === 'user'
                        ? 'Ти'
                        : message.provider === 'demo'
                          ? 'Luna · демо'
                          : 'Luna'}
                    </strong>
                    {message.role === 'user' ? <p>{message.question}</p> : <div className="node-chat-answer" dangerouslySetInnerHTML={{__html:chatMarkup(message.answer)}} />}
                  </div>
                ))}
              </div>
            )}

            {(current.btwCard || (pendingQuestion && pendingBtw)) && (
              <aside className="node-chat-btw-card" aria-label="Відповідь /бтв поза основною історією">
                <div className="node-chat-btw-top">
                  <span className="node-chat-btw-badge">/бтв · До речі (поза історією 5 соо)</span>
                  {current.btwCard && !pendingQuestion && (
                    <button
                      type="button"
                      className="node-chat-btw-dismiss"
                      aria-label="Закрити підказку /бтв"
                      onClick={() => updateCurrent({ btwCard: null })}
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className="node-chat-btw-q">
                  <b>Ти:</b> {pendingQuestion && pendingBtw ? pendingQuestion : current.btwCard?.question}
                </p>
                {pendingQuestion && pendingBtw ? (
                  <p className="node-chat-btw-a muted">Luna формулює /бтв-відповідь…</p>
                ) : (
                  <div className="node-chat-btw-a node-chat-answer" dangerouslySetInnerHTML={{__html:chatMarkup(current.btwCard?.answer || '')}} />
                )}
              </aside>
            )}

            <form
              onSubmit={event => {
                event.preventDefault();
                void submitQuestion();
              }}
            >
              <div className="node-chat-label-row">
                <label htmlFor="node-chat-question">
                  {isBtwActive ? 'Побічне запитання (/бтв)' : 'Твоє запитання'}
                </label>
                <div className="node-chat-quick-chips">
                  <button
                    type="button"
                    className={`node-chat-chip ${isBtwActive ? 'active' : ''}`}
                    onClick={handleToggleBtw}
                  >
                    {isBtwActive ? '✓ /бтв увімкнено' : '+ /бтв'}
                  </button>
                  <button
                    type="button"
                    className="node-chat-chip"
                    disabled={!!pendingQuestion}
                    title="Миттєвий інженерний факт /бтв по темі уроку без зміни історії"
                    onClick={() => void submitQuestion('', true)}
                  >
                    ⚡ /бтв інсайт
                  </button>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                id="node-chat-question"
                rows={2}
                maxLength={NODE_CHAT_QUESTION_LIMIT}
                readOnly={!!pendingQuestion}
                value={current.draft}
                onChange={e => updateCurrent({ draft: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void submitQuestion();
                  }
                }}
                placeholder={
                  isBtwActive
                    ? 'Побічне питання (/бтв) або залиш порожнім і натисни Запитати для інсайту…'
                    : 'Наприклад: чому тут проміс блокує чергу або як почати практику?'
                }
              />

              <details className="node-chat-code-details">
                <summary>Додати фрагмент коду або помилку</summary>
                <textarea
                  id="node-chat-code"
                  rows={3}
                  maxLength={2600}
                  readOnly={!!pendingQuestion}
                  value={current.code}
                  onChange={e => updateCurrent({ code: e.target.value })}
                  placeholder="Встав код або стек помилки (за бажанням)…"
                />
              </details>

              <div className="node-chat-actions">
                <p className="node-chat-status" role="status">
                  {pendingQuestion ? 'Чекаємо на відповідь…' : error}
                </p>
                <button
                  className="button primary"
                  type="submit"
                  disabled={!!pendingQuestion || (!current.draft.trim() && !isBtwActive)}
                >
                  {isBtwActive ? 'Запитати /бтв' : 'Запитати'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
