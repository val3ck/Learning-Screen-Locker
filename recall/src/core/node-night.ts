import {defaultDuration,defaultStart,minuteMs} from './tracks';
import {clockDue,kyivDayKey,kyivParts,type ClockTime} from './calendar';

export const NIGHT_LIMIT = defaultDuration('nodejs') * minuteMs;
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

export function invitationNight(now: Date): string | null {
  const parts=kyivParts(now),minute=parts.hour*60+parts.minute;
  return minute>=22*60+59||minute<40?kyivDayKey(now):null;
}

export function nodeInvitationDay(now:Date,start:ClockTime|null):string|null {
  if(start===null)return null;
  if(start===defaultStart('nodejs'))return invitationNight(now);
  return clockDue(now,start)?kyivDayKey(now):null;
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
