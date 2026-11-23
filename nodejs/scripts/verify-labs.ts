import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join, sep, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { lessons } from '../src/content/catalog';
import { labFiles, learnerWritesTests } from '../src/lib/labs';

const root = process.cwd();
const cache = resolve(root, '.lab-check');
mkdirSync(cache, { recursive: true });
const temp = mkdtempSync(join(cache, 'run-'));
if (!temp.startsWith(cache + sep)) throw new Error('Unsafe lab check path');
const failures: string[] = [];
let passed = 0; let intendedFailures = 0;
const tsc = resolve(root, 'node_modules/typescript/bin/tsc');
function verify(id: string, useSolution: boolean) {
  const lesson = lessons.find(l => l.id === id)!;
  const folder = join(temp, id, useSolution ? 'reference' : 'starter');
  mkdirSync(folder, { recursive: true });
  for (const [file, body] of Object.entries(labFiles(lesson, useSolution ? 'check-reference' : 'check-starter'))) {
    const path = resolve(folder, file);
    if (!path.startsWith(folder + sep)) throw new Error('Unsafe lab filename');
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }
  try {
    if (lesson.lab.language !== 'js') execFileSync(process.execPath, [tsc, '--project', join(folder, 'tsconfig.json')], { cwd: folder, stdio: 'pipe', timeout: 20000 });
    const testFile = lesson.lab.language === 'js' ? (learnerWritesTests(lesson) ? 'exercise.test.js' : 'exercise.test.mjs') : 'build/exercise.test.js';
    execFileSync(process.execPath, ['--test', testFile], { cwd: folder, stdio: 'pipe', timeout: 20000 });
    return { ok: true, error: '' };
  } catch (e) { const error = e as { stdout?: Buffer; stderr?: Buffer; message?: string }; return { ok: false, error: (String(error.stdout ?? '') + String(error.stderr ?? '')) || error.message || '' }; }
}
try {
  for (const lesson of lessons) {
    const reference = verify(lesson.id, true);
    if (!reference.ok) { failures.push(`${lesson.id}: reference failed\n${reference.error.slice(0, 2200)}`); continue; }
    passed++;
    const starter = verify(lesson.id, false);
    if (starter.ok) failures.push(`${lesson.id}: starter unexpectedly passed`);
    else intendedFailures++;
    if (passed % 10 === 0) console.log(`Verified ${passed}/${lessons.length} reference labs`);
  }
} finally { if (temp.startsWith(cache + sep)) rmSync(temp, { recursive: true, force: true }); }
if (failures.length) { console.error(failures.join('\n\n')); process.exitCode = 1; }
else console.log(`Labs valid: ${passed} references pass; ${intendedFailures} starters fail as intended.`);
