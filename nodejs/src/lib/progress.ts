import { lessons, lessonById, modules, prerequisitesFor } from '../content/catalog';
import type { Lesson } from '../content/schema';

export const STORAGE_KEY = 'backend-path.strong-junior.v1';
export type Step = 'lecture' | 'practice' | 'check';
export interface LessonProgress {
  read: boolean; checks: number[]; quizPassed: boolean; notes: string;
  step: Step; completedAt: string | null; nextReviewAt: string | null; reviewCount: number;
}
export interface Progress {
  version: 1;
  lessons: Record<string, LessonProgress>;
  projects: Record<string, number[]>;
  lastLessonId: string | null;
  duration: 60 | 90 | 120;
  activity: { date: string; lessonId: string; kind: 'complete' | 'review' }[];
}
export const emptyLesson = (): LessonProgress => ({ read: false, checks: [], quizPassed: false, notes: '', step: 'lecture', completedAt: null, nextReviewAt: null, reviewCount: 0 });
export const freshProgress = (): Progress => ({ version: 1, lessons: {}, projects: {}, lastLessonId: null, duration: 60, activity: [] });
export const getLessonProgress = (progress: Progress, id: string) => progress.lessons[id] ?? emptyLesson();
export const isComplete = (progress: Progress, id: string) => !!progress.lessons[id]?.completedAt;
export const isUnlocked = (progress: Progress, lesson: Lesson) => prerequisitesFor(lesson).every(id => isComplete(progress, id));
export const dueReviews = (progress: Progress, now = new Date()) => lessons.filter(l => {
  const p = progress.lessons[l.id];
  return p?.completedAt && p.nextReviewAt && Date.parse(p.nextReviewAt) <= now.getTime();
});
export function nextLesson(progress: Progress): Lesson | undefined {
  const current = progress.lastLessonId ? lessonById.get(progress.lastLessonId) : undefined;
  if (current && !isComplete(progress, current.id) && isUnlocked(progress, current)) return current;
  return lessons.find(l => !isComplete(progress, l.id) && isUnlocked(progress, l));
}
export function updateLesson(progress: Progress, id: string, update: Partial<LessonProgress>): Progress {
  if (!lessonById.has(id)) return progress;
  return { ...progress, lessons: { ...progress.lessons, [id]: { ...getLessonProgress(progress, id), ...update } }, lastLessonId: id };
}
export const requiredPracticeChecks = (lesson: Lesson) => Math.min(2, lesson.criteria.length);
export function canComplete(progress: Progress, lesson: Lesson) {
  const p = getLessonProgress(progress, lesson.id);
  return isUnlocked(progress, lesson) && p.read && p.checks.length >= requiredPracticeChecks(lesson);
}
export function completeLesson(progress: Progress, lesson: Lesson, now = new Date()): Progress {
  if (!canComplete(progress, lesson) || isComplete(progress, lesson.id)) return progress;
  const next = updateLesson(progress, lesson.id, { completedAt: now.toISOString(), nextReviewAt: new Date(now.getTime() + 86400000).toISOString() });
  return { ...next, activity: [...next.activity, { date: now.toISOString(), lessonId: lesson.id, kind: 'complete' as const }].slice(-2000) };
}
export function reviewLesson(progress: Progress, id: string, remembered: boolean, now = new Date()): Progress {
  if (!isComplete(progress, id)) return progress;
  const p = getLessonProgress(progress, id);
  const count = remembered ? Math.min(p.reviewCount + 1, 30) : 0;
  const days = [1, 3, 7, 14, 30][Math.min(count, 4)];
  const next = updateLesson(progress, id, { reviewCount: count, nextReviewAt: new Date(now.getTime() + (remembered ? days * 86400000 : 4 * 3600000)).toISOString() });
  return { ...next, activity: [...next.activity, { date: now.toISOString(), lessonId: id, kind: 'review' as const }].slice(-2000) };
}

function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function date(value: unknown): value is string { return typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value)); }
function indices(value: unknown, max: number): number[] {
  if (!Array.isArray(value) || value.some(x => !Number.isInteger(x) || x < 0 || x >= max)) throw new Error('Некоректні позначки виконання.');
  return [...new Set(value)] as number[];
}
export function parseProgress(input: unknown): Progress {
  if (!object(input) || input.version !== 1 || !object(input.lessons) || !object(input.projects) || !Array.isArray(input.activity)) throw new Error('Це не файл прогресу Backend Path версії 1.');
  const clean = freshProgress();
  for (const [id, raw] of Object.entries(input.lessons)) {
    const lesson = lessonById.get(id);
    if (!lesson) throw new Error(`Невідомий урок у файлі: ${id.slice(0, 80)}.`);
    if (!object(raw) || typeof raw.read !== 'boolean' || typeof raw.quizPassed !== 'boolean' || typeof raw.notes !== 'string' || raw.notes.length > 20000 || !['lecture', 'practice', 'check'].includes(String(raw.step)) || !Number.isInteger(raw.reviewCount) || Number(raw.reviewCount) < 0 || Number(raw.reviewCount) > 30 || (raw.completedAt !== null && !date(raw.completedAt)) || (raw.nextReviewAt !== null && !date(raw.nextReviewAt))) throw new Error(`Пошкоджені дані уроку ${id}.`);
    const checks = indices(raw.checks, lesson.criteria.length);
    const lessonDone = raw.read && checks.length >= requiredPracticeChecks(lesson);
    const legacyDone = raw.quizPassed && checks.length === lesson.criteria.length;
    if (raw.completedAt && !lessonDone && !legacyDone) throw new Error(`Завершений урок ${id} має неповну перевірку.`);
    clean.lessons[id] = { read: raw.read, quizPassed: raw.quizPassed, notes: raw.notes, step: raw.step as Step, checks, reviewCount: Number(raw.reviewCount), completedAt: raw.completedAt as string | null, nextReviewAt: raw.nextReviewAt as string | null };
  }
  for (const [id, checks] of Object.entries(input.projects)) {
    const module = modules.find(m => m.id === id);
    if (!module) throw new Error('Невідомий модуль у файлі.');
    clean.projects[id] = indices(checks, module.project.deliverables.length);
  }
  if (input.lastLessonId !== null && (typeof input.lastLessonId !== 'string' || !lessonById.has(input.lastLessonId))) throw new Error('Некоректне місце зупинки.');
  if (![60, 90, 120].includes(Number(input.duration)) || typeof input.duration !== 'number') throw new Error('Некоректна тривалість сесії.');
  clean.lastLessonId = input.lastLessonId as string | null;
  clean.duration = input.duration as 60 | 90 | 120;
  if (input.activity.length > 2000) throw new Error('Завелика історія активності.');
  clean.activity = input.activity.map(raw => {
    if (!object(raw) || !date(raw.date) || typeof raw.lessonId !== 'string' || !lessonById.has(raw.lessonId) || !['complete', 'review'].includes(String(raw.kind))) throw new Error('Некоректна історія активності.');
    return { date: raw.date, lessonId: raw.lessonId, kind: raw.kind as 'complete' | 'review' };
  });
  return clean;
}

export function readProgress(storage: Pick<Storage, 'getItem'>): { progress: Progress; error?: string } {
  try { const raw = storage.getItem(STORAGE_KEY); return { progress: raw ? parseProgress(JSON.parse(raw)) : freshProgress() }; }
  catch { return { progress: freshProgress(), error: 'Не вдалося прочитати збереження. Експортуй новий прогрес перед закриттям; попередній файл у браузері не перезаписується до твоєї зміни.' }; }
}
export function progressSummary(progress: Progress) {
  const core = lessons.filter(l => modules.find(m => m.id === l.moduleId)?.track === 'core');
  const done = core.filter(l => isComplete(progress, l.id)).length;
  return { done, total: core.length, percent: core.length ? Math.round(done / core.length * 100) : 0,
    projects: modules.filter(m => (progress.projects[m.id]?.length ?? 0) === m.project.deliverables.length).length,
    started: lessons.filter(l => !!progress.lessons[l.id]).length };
}
