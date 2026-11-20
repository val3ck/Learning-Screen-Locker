export const NIGHT_LIMIT = 40 * 60_000;
const SAVE_BUFFER = 5 * 60_000;
export type NightSection = 'lecture' | 'practice' | 'check';
export interface NightStep {
  id: string;
  lessonId: string;
  lesson: string;
  module: string;
  section: NightSection;
  minutes: number;
  title: string;
  criteriaDone: number;
  criteriaTotal: number;
  lessonsDone: number;
  lessonsTotal: number;
}
export interface CourseNight {
  candidate: NightStep | null;
  completed: string[];
  completedModules: number;
  totalModules: number;
  lessonCounts?: Record<string, {criteriaDone: number; lessonsDone: number}>;
}
export interface NightRun {
  id: string;
  night: string;
  startedAt: number;
  deadline: number;
  steps: NightStep[];
  passed: string[];
  endedAt?: number;
  outcome?: 'finished' | 'partial' | 'interrupted' | 'technical';
}
export interface NightDocument {
  version: 1;
  enabled: boolean;
  offeredNight?: string;
  choice?: 'learn' | 'sleep' | 'dismiss';
  runs: NightRun[];
}

const kyiv = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function invitationNight(now: Date): string | null {
  const parts = Object.fromEntries(kyiv.formatToParts(now).map(part => [part.type, part.value]));
  const minute = Number(parts.hour) * 60 + Number(parts.minute);
  if (minute >= 22 * 60 + 59) return parts.year + '-' + parts.month + '-' + parts.day;
  if (minute >= 40) return null;
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) - 1)).toISOString().slice(0, 10);
}

export function nextNightStep(run: NightRun, course: CourseNight, now: number): NightStep | null {
  const candidate = course.candidate;
  const latest = run.steps.at(-1);
  if (run.endedAt || !latest || !run.passed.includes(latest.id) || !candidate ||
      run.steps.length >= 3 || run.steps.some(step => step.id === candidate.id) ||
      now + candidate.minutes * 60_000 + SAVE_BUFFER > run.deadline) return null;
  return candidate;
}

export function reviewNightProgress(run: NightRun, course: CourseNight) {
  const known = new Set(course.completed);
  for (const step of run.steps) {
    if (known.has(step.id) && !run.passed.includes(step.id)) run.passed.push(step.id);
  }
}

export function validNightDocument(value: unknown): value is NightDocument {
  const d = value as NightDocument;
  return !!d && d.version === 1 && typeof d.enabled === 'boolean' &&
    (d.offeredNight === undefined || /^\d{4}-\d{2}-\d{2}$/.test(d.offeredNight)) &&
    Array.isArray(d.runs) && d.runs.length <= 366 && d.runs.every(run =>
      typeof run.id === 'string' && Number.isFinite(run.startedAt) && Number.isFinite(run.deadline) &&
      Array.isArray(run.steps) && run.steps.length > 0 && run.steps.length <= 3 && Array.isArray(run.passed) &&
      run.steps.every(step => typeof step?.id === 'string' && typeof step.lessonId === 'string'));
}
