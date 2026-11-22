import {defaultDuration,defaultStart,minuteMs} from './tracks';
import {clockDue,kyivDayKey,kyivParts,type ClockTime} from './calendar';

export const NIGHT_LIMIT = defaultDuration('nodejs') * minuteMs;
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
  criteriaRequired?: number;
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

export function nightLessonGoal(run: NightRun, course: CourseNight) {
  const step = run.steps[0];
  const counts = course.lessonCounts?.[step.lessonId];
  return {
    lectureRead: course.completed.includes(step.lessonId + '/lecture'),
    criteriaDone: counts?.criteriaDone ?? step.criteriaDone,
    criteriaRequired: step.criteriaRequired ?? Math.min(2, step.criteriaTotal),
    lessonDone: course.completed.includes(step.lessonId + '/check'),
  };
}

export function reviewNightProgress(run: NightRun, course: CourseNight) {
  const prefix = run.steps[0].lessonId + '/';
  const criteria = course.completed.filter(id => id.startsWith(prefix + 'practice/'))
    .slice(0, nightLessonGoal(run, course).criteriaRequired);
  for (const id of [prefix + 'lecture', ...criteria, prefix + 'check']) {
    if (course.completed.includes(id) && !run.passed.includes(id)) run.passed.push(id);
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
