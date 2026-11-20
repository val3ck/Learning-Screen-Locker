import type { Lesson } from './schema';
import { foundationLessons } from './foundation';
import { platformLessons } from './platform';
import { productionLessons } from './production';
import { branchLessons } from './branches';
import { modules } from './modules';

export { modules };
export const lessons: Lesson[] = [...foundationLessons, ...platformLessons, ...productionLessons, ...branchLessons]
  .sort((a, b) => modules.findIndex(m => m.id === a.moduleId) - modules.findIndex(m => m.id === b.moduleId));
export const lessonById = new Map(lessons.map(l => [l.id, l]));
export const moduleById = new Map(modules.map(m => [m.id, m]));
export function prerequisitesFor(lesson: Lesson): string[] {
  const peers = lessons.filter(l => l.moduleId === lesson.moduleId);
  const index = peers.findIndex(l => l.id === lesson.id);
  if (index > 0) return [peers[index - 1].id];
  return (moduleById.get(lesson.moduleId)?.prerequisites ?? []).flatMap(id => lessons.filter(l => l.moduleId === id).map(l => l.id));
}
