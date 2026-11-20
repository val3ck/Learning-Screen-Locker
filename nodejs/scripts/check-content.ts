import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { lessons, modules, prerequisitesFor } from '../src/content/catalog';
import { labFiles } from '../src/lib/labs';

const root = process.cwd();
const errors: string[] = [];
const ids = new Set<string>();
const moduleIds = new Set(modules.map(m => m.id));
const names = new Set(readdirSync(resolve(root, 'src/content/lessons')).filter(x => x.endsWith('.mdx')).map(x => x.replace('.mdx', '')));
for (const lesson of lessons) {
  if (ids.has(lesson.id)) errors.push(`Duplicate lesson: ${lesson.id}`);
  ids.add(lesson.id);
  if (!moduleIds.has(lesson.moduleId)) errors.push(`${lesson.id}: unknown module ${lesson.moduleId}`);
  if (!names.has(lesson.id)) errors.push(`${lesson.id}: MDX body missing`);
  if (lesson.goals.length < 2 || lesson.steps.length < 2 || lesson.criteria.length < 2 || lesson.hints.length < 2 || lesson.mistakes.length < 1 || lesson.reviewQuestions.length < 2 || lesson.extensions.length < 2) errors.push(`${lesson.id}: incomplete pedagogy`);
  if (!lesson.task.trim() || !lesson.lab.starter.trim() || !lesson.lab.solution.trim() || !lesson.lab.tests.includes('assert.')) errors.push(`${lesson.id}: incomplete lab`);
  if (lesson.lab.starter === lesson.lab.solution) errors.push(`${lesson.id}: starter equals reference`);
  try {
    const manifest = JSON.parse(labFiles(lesson)['package.json']) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const versions = Object.values({ ...manifest.dependencies, ...manifest.devDependencies });
    if (versions.some(version => !/^\d+\.\d+\.\d+$/.test(version))) errors.push(`${lesson.id}: unpinned lab dependency`);
  } catch (error) { errors.push(`${lesson.id}: lab package error: ${error}`); }
  if (lesson.sources.length === 0 || lesson.sources.some(s => !s.url.startsWith('https://'))) errors.push(`${lesson.id}: missing HTTPS source`);
  if (lesson.quiz.kind === 'choice' && (lesson.quiz.options.length < 2 || lesson.quiz.answer < 0 || lesson.quiz.answer >= lesson.quiz.options.length)) errors.push(`${lesson.id}: invalid choice`);
  if (lesson.quiz.kind === 'order' && (lesson.quiz.answer.length !== lesson.quiz.items.length || new Set(lesson.quiz.answer).size !== lesson.quiz.items.length)) errors.push(`${lesson.id}: invalid order`);
  if (lesson.quiz.kind === 'input' && lesson.quiz.accepted.length < 1) errors.push(`${lesson.id}: no accepted answer`);
  const body = readFileSync(resolve(root, 'src/content/lessons', `${lesson.id}.mdx`), 'utf8');
  const prose = body.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');
  const words = prose.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  if (words < 150) errors.push(`${lesson.id}: lecture has only ${words} prose words`);
  try { await compile(body); } catch (e) { errors.push(`${lesson.id}: MDX error: ${e}`); }
  for (const id of prerequisitesFor(lesson)) if (id === lesson.id || !lessons.some(l => l.id === id)) errors.push(`${lesson.id}: bad prerequisite ${id}`);
}
for (const name of names) if (!ids.has(name)) errors.push(`Orphan MDX: ${name}`);
for (const module of modules) {
  if (!lessons.some(l => l.moduleId === module.id)) errors.push(`Empty module: ${module.id}`);
  if (module.project.deliverables.length < 2) errors.push(`Incomplete project: ${module.id}`);
  for (const p of module.prerequisites) if (!moduleIds.has(p)) errors.push(`${module.id}: unknown module prerequisite ${p}`);
}
const state = new Map<string, 'visiting' | 'visited'>();
function visit(id: string) {
  if (state.get(id) === 'visiting') { errors.push(`Prerequisite cycle: ${id}`); return; }
  if (state.get(id) === 'visited') return;
  state.set(id, 'visiting');
  const lesson = lessons.find(l => l.id === id);
  if (lesson) for (const p of prerequisitesFor(lesson)) visit(p);
  state.set(id, 'visited');
}
for (const lesson of lessons) visit(lesson.id);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Content valid: ${modules.length} modules, ${lessons.length} lessons, ${names.size} MDX lectures.`);
