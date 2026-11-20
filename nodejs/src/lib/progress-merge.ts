import { emptyLesson, parseProgress, type Progress } from './progress';

const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export class ProgressConflict extends Error {}

function mergeField<T>(base: T, current: T, edited: T): T {
  if (equal(base, edited) || equal(current, edited)) return current;
  if (equal(base, current)) return edited;
  throw new ProgressConflict('Це поле вже змінилося в іншому вікні. Твоя версія збережена в браузері.');
}

function mergeChecks(base: number[], current: number[], edited: number[]) {
  const removed = new Set(base.filter(n => !edited.includes(n)));
  return [...new Set([...current.filter(n => !removed.has(n)), ...edited.filter(n => !base.includes(n))])].sort((a,b) => a-b);
}

export function mergeProgress(base: Progress, current: Progress, edited: Progress): Progress {
  const next = structuredClone(current);
  for (const [id, local] of Object.entries(edited.lessons)) {
    const original = base.lessons[id] ?? emptyLesson();
    const remote = current.lessons[id] ?? emptyLesson();
    if (equal(original, local)) continue;
    const completion = remote.completedAt || local.completedAt;
    next.lessons[id] = {
      read: remote.read || local.read,
      quizPassed: remote.quizPassed || local.quizPassed,
      notes: mergeField(original.notes, remote.notes, local.notes),
      checks: completion ? [...(remote.completedAt ? remote.checks : local.checks)] : mergeChecks(original.checks, remote.checks, local.checks),
      step: original.step !== local.step ? local.step : remote.step,
      completedAt: completion,
      nextReviewAt: original.nextReviewAt !== local.nextReviewAt && local.nextReviewAt ? local.nextReviewAt : remote.nextReviewAt,
      reviewCount: original.reviewCount !== local.reviewCount ? local.reviewCount : remote.reviewCount,
    };
  }
  for (const [id, checks] of Object.entries(edited.projects)) {
    next.projects[id] = mergeChecks(base.projects[id] ?? [], current.projects[id] ?? [], checks);
  }
  if (edited.lastLessonId !== base.lastLessonId) next.lastLessonId = edited.lastLessonId;
  if (edited.duration !== base.duration) next.duration = edited.duration;
  const activity = new Map(current.activity.map(entry => [JSON.stringify(entry), entry]));
  for (const entry of edited.activity) activity.set(JSON.stringify(entry), entry);
  next.activity = [...activity.values()].sort((a,b) => a.date.localeCompare(b.date)).slice(-2000);
  return parseProgress(next);
}
