import { useEffect, useRef, useState } from 'react';
import { freshProgress, parseProgress, STORAGE_KEY, type Progress } from './progress';
import { mergeProgress, ProgressConflict } from './progress-merge';

const baseKey = STORAGE_KEY + '.shared-base';
const backupKey = STORAGE_KEY + '.before-shared';
type Snapshot = { version: 1; revision: number; progress: Progress | null };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function rememberedBase(): {progress: Progress; revision: number} | null {
  try {
    const raw = localStorage.getItem(baseKey);
    if (!raw) return null;
    const value = JSON.parse(raw);
    return { progress: parseProgress(value.progress), revision: value.revision };
  } catch { return null; }
}

export function useProgressSync(
  current: React.RefObject<Progress>,
  accept: (value: Progress) => void,
  initialError: string,
) {
  const base = useRef(rememberedBase());
  const busy = useRef<Promise<void> | null>(null);
  const [status, setStatus] = useState('Перевіряємо спільне збереження…');
  const [error, setError] = useState(initialError);
  const conflict = useRef(false);

  const sync = (): Promise<void> => {
    if (busy.current) return busy.current;
    if (initialError || conflict.current) return Promise.resolve();
    busy.current = (async () => {
      const endpoint = '/api/backend-path/progress';
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(4000) });
      if (!response.ok) throw Error('Спільне збереження недоступне. Робота лишилась у браузері.');
      let remote: Snapshot = await response.json();
      if (remote.version !== 1 || !Number.isInteger(remote.revision)) throw Error('Відкрий сайт через start.bat, щоб увімкнути синхронізацію.');
      const original = base.current?.progress ?? freshProgress();
      const local = current.current;
      if (!remote.progress && window.recallNode) throw Error('Спочатку відкрий курс у звичному браузері.');
      if (!remote.progress || !same(original, local)) {
        if (!base.current) {
          try {
            const old = localStorage.getItem(STORAGE_KEY);
            if (old && !localStorage.getItem(backupKey)) localStorage.setItem(backupKey, old);
          } catch { /* The existing JSON export remains available. */ }
        }
        const saved = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Backend-Path': '1' },
          body: JSON.stringify({ base: original, baseRevision: base.current?.revision ?? 0, progress: local, initialize: !window.recallNode }),
          signal: AbortSignal.timeout(5000),
        });
        remote = await saved.json();
        if (saved.status === 409) throw new ProgressConflict((remote as unknown as {message: string}).message);
        if (!saved.ok) throw Error('Не вдалося синхронізувати прогрес. Зміни залишилися у браузері.');
      }
      if (remote.progress) {
        const saved = parseProgress(remote.progress);
        const latest = current.current;
        const combined = same(latest, local) ? saved : mergeProgress(local, saved, latest);
        base.current = {progress: saved, revision: remote.revision};
        try { localStorage.setItem(baseKey, JSON.stringify(base.current)); } catch {}
        if (!same(latest, combined)) accept(combined);
      }
      setError(''); setStatus('Прогрес синхронізовано');
    })().catch(reason => {
      if (reason instanceof ProgressConflict) conflict.current = true;
      setError(reason.message || 'Спільне збереження недоступне. Робота лишилась у браузері.');
      setStatus('Збережено в цьому вікні');
    }).finally(() => { busy.current = null; });
    return busy.current;
  };
  useEffect(() => {
    void sync();
    const refresh = () => { if (!document.hidden) void sync(); };
    const interval = setInterval(refresh, 4000);
    addEventListener('focus', refresh);
    return () => { removeEventListener('focus', refresh); clearInterval(interval); };
  }, []);
  return {sync, status, error};
}
