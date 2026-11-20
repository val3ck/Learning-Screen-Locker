import { lessonById, lessons, modules, prerequisitesFor } from '../content/catalog';
import { dueReviews, isComplete, nextLesson, type Progress } from './progress';

export interface SessionItem { kind: 'review' | 'lecture' | 'practice' | 'check' | 'extension'; title: string; minutes: number; lessonId?: string; }
export function buildSession(progress: Progress, duration: 60 | 90 | 120, now = new Date()): SessionItem[] {
  const result: SessionItem[] = [];
  const due = dueReviews(progress, now).slice(0, 2);
  const first = nextLesson(progress);
  if (!first) {
    if (due.length) result.push(...due.map(l => ({ kind: 'review' as const, title: `Пригадай: ${l.title}`, minutes: 10, lessonId: l.id })));
    const last = [...lessons].reverse().find(l => isComplete(progress, l.id));
    result.push({ kind: 'extension', title: 'Самостійна лабораторна та технічний розбір', minutes: duration - result.reduce((n, x) => n + x.minutes, 0), lessonId: last?.id });
    return result;
  }
  let remaining = duration;
  if (due.length) {
    const budget = duration === 60 ? 5 : 10;
    result.push({ kind: 'review', title: `Пригадай: ${due[0].title}`, minutes: budget, lessonId: due[0].id }); remaining -= budget;
  }
  const virtual = new Set(lessons.filter(l => isComplete(progress, l.id)).map(l => l.id));
  let current = first;
  while (remaining >= 45) {
    const read = progress.lessons[current.id]?.read;
    const lecture = read ? 5 : Math.min(current.lectureMinutes, 15);
    const practice = Math.min(current.practiceMinutes, remaining - lecture - 5, 40);
    result.push({ kind: 'lecture', title: read ? `Віднови контекст: ${current.title}` : current.title, minutes: lecture, lessonId: current.id });
    result.push({ kind: 'practice', title: 'Самостійна практика', minutes: practice, lessonId: current.id });
    result.push({ kind: 'check', title: 'Перевір результат і поясни рішення', minutes: 5, lessonId: current.id });
    remaining -= lecture + practice + 5;
    virtual.add(current.id);
    const next = lessons.find(l => !virtual.has(l.id) && prerequisitesFor(l).every(id => virtual.has(id)) && modules.find(m => m.id === l.moduleId)?.track === modules.find(m => m.id === first.moduleId)?.track);
    if (!next) break;
    current = next;
  }
  if (remaining > 0) result.push({ kind: 'extension', title: 'Поглиблення: додаткова задача або розбір помилок', minutes: remaining, lessonId: [...result].reverse().find(i => i.lessonId)?.lessonId ?? first.id });
  return result;
}
export const sessionLesson = (id?: string) => id ? lessonById.get(id) : undefined;
