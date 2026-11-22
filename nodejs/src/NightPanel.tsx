import type {LunaOptions} from '../../shared/luna-chat';
import { useEffect, useState } from 'react';
import type { Step } from './lib/progress';

export interface NightStep {
  id: string;
  lessonId: string;
  lesson: string;
  module: string;
  section: Step;
  minutes: number;
  title: string;
  criteriaDone: number;
  criteriaTotal: number;
  lessonsDone: number;
  lessonsTotal: number;
}
export interface NightView {
  deadline: number;
  phase: 'loading' | 'learning' | 'editor' | 'wrap-up' | 'finished';
  step: NightStep;
  lectureRead: boolean;
  criteriaDone: number;
  criteriaRequired: number;
  lessonDone: boolean;
}
type Ask = { lesson: string; section: Step; question: string; code: string; btw?: boolean; luna?:LunaOptions };
declare global {
  interface Window {
    recallNode?: {
      ready(): Promise<NightView>;
      subscribe(render: (state: NightView) => void): () => void;
      act(action: 'editor' | 'exit'): Promise<void>;
      ask(request: Ask): Promise<string | { answer: string; provider?: string; model?: string }>;
    };
  }
}

export function useNightView() {
  const [view, setView] = useState<NightView | null>(null);
  useEffect(() => {
    if (!window.recallNode) return;
    let disposed = false;
    const remove = window.recallNode.subscribe(state => { if (!disposed) setView(state); });
    void window.recallNode.ready().then(state => { if (!disposed) setView(state); }).catch(() => {});
    return () => { disposed = true; remove(); };
  }, []);
  useEffect(() => {
    if (!view?.step.lessonId || view.phase === 'finished') return;
    const route = '#/lesson/' + view.step.lessonId;
    if (location.hash !== route) location.hash = route;
  }, [view?.step.id]);
  return view;
}

export function NightPanel({ view, save, lunaOpen, onToggleLuna }: {
  view: NightView; lesson?: string; section?: Step; save: () => Promise<void>;
  lunaOpen?: boolean; onToggleLuna?: () => void;
}) {
  const [now, setNow] = useState(Date.now);
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((view.deadline - now) / 1000));
  const elapsed = view.phase === 'wrap-up' || seconds === 0 && view.deadline !== 0;
  const canExit = elapsed || view.lessonDone;
  const time = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  async function act(action: 'editor' | 'exit') {
    try { setError(''); await save(); await window.recallNode!.act(action); }
    catch (e) { setError((e as Error).message); }
  }
  return <aside className="night-bar" aria-label="Нічна сесія Node.js">
    <div className="night-bar-content">
      <div>
        <strong>{view.lessonDone ? 'Урок завершено' : elapsed ? 'Час минув — можна закруглятись' : 'Node.js · ' + time}</strong>
        <p>{view.lessonDone ? view.step.lesson : elapsed ? 'Можна зберегти частковий результат.' : view.step.title}</p>
        <p className="night-counts">Лекція {view.lectureRead ? 1 : 0}/1 · Практика {Math.min(view.criteriaDone, view.criteriaRequired)}/{view.criteriaRequired}</p>
      </div>
      <div className="night-actions">
        {!canExit && view.lectureRead && <button className="button secondary" onClick={() => void act('editor')}>Практика в редакторі</button>}
        {canExit && <button className="button secondary" onClick={() => void act('exit')}>Зберегти й вийти</button>}
        {onToggleLuna && <button className="button secondary" aria-expanded={!!lunaOpen} aria-controls="node-chat-panel" onClick={onToggleLuna}>Luna</button>}
      </div>
    </div>
    {error && <p className="night-error" role="alert">{error}</p>}
  </aside>;
}
