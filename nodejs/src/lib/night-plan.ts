import { lessonById, lessons, moduleById, modules, prerequisitesFor } from '../content/catalog';
import { getLessonProgress, isComplete, nextLesson, type Progress, type Step } from './progress';

export function nightPlan(progress: Progress) {
  const lesson = nextLesson(progress);
  const completed: string[] = [];
  const lessonCounts: Record<string, { criteriaDone: number; lessonsDone: number }> = {};
  const byModule = new Map(modules.map(module => [module.id, lessons.filter(item => item.moduleId === module.id)]));
  const completedByModule = new Map([...byModule].map(([id, peers]) =>
    [id, peers.filter(item => isComplete(progress, item.id)).length]));
  for (const item of lessons) {
    const saved = getLessonProgress(progress, item.id);
    lessonCounts[item.id] = {criteriaDone: saved.checks.length, lessonsDone: completedByModule.get(item.moduleId) ?? 0};
    if (!progress.lessons[item.id]) continue;
    if (saved.read) completed.push(item.id + '/lecture');
    for (const criterion of saved.checks) completed.push(item.id + '/practice/' + criterion);
    if (isComplete(progress, item.id)) completed.push(item.id + '/check');
  }
  const completedModules = modules.filter(module => completedByModule.get(module.id) === byModule.get(module.id)!.length).length;
  if (!lesson) return { candidate: null, completed, completedModules, totalModules: modules.length, lessonCounts };
  const saved = getLessonProgress(progress, lesson.id);
  const criterion = lesson.criteria.findIndex((_, index) => !saved.checks.includes(index));
  const section: Step = !saved.read ? 'lecture' : criterion >= 0 ? 'practice' : 'check';
  const minutes = section === 'lecture' ? 10 : section === 'practice' ? 20 : 5;
  const module = moduleById.get(lesson.moduleId)!;
  const peers = byModule.get(module.id)!;
  return {
    candidate: {
      id: lesson.id + '/' + section + (section === 'practice' ? '/' + criterion : ''),
      lessonId: lesson.id, lesson: lesson.title, module: module.title, section, minutes,
      title: section === 'lecture' ? 'Прочитай концепт' : section === 'practice' ? lesson.criteria[criterion] : 'Пройди квіз і заверши урок',
      criteriaDone: saved.checks.length, criteriaTotal: lesson.criteria.length,
      lessonsDone: peers.filter(item => isComplete(progress, item.id)).length, lessonsTotal: peers.length,
    },
    completed, completedModules, totalModules: modules.length, lessonCounts,
  };
}

export function relevantTopics(lessonId: string, progress: Progress) {
  const lesson = lessonById.get(lessonId);
  if (!lesson) return [];
  const visited = new Set<string>();
  const queue = prerequisitesFor(lesson);
  const relevant: { title: string; summary: string }[] = [];
  while (queue.length && relevant.length < 4) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const prerequisite = lessonById.get(id);
    if (!prerequisite) continue;
    if (isComplete(progress, id)) relevant.push({ title: prerequisite.title, summary: prerequisite.summary });
    queue.push(...prerequisitesFor(prerequisite));
  }
  return relevant;
}
