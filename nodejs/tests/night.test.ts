import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lessons } from '../src/content/catalog';
import { freshProgress, updateLesson, completeLesson } from '../src/lib/progress';
import { mergeProgress, ProgressConflict } from '../src/lib/progress-merge';
import { nightPlan } from '../src/lib/night-plan';
import { createCourseBridge } from '../scripts/course-bridge';
import { readCodeAssessment } from '../../shared/node-code-review';

test('review deducts only grounded defects and scores independently of the number of notes', () => {
  const code = 'const x = 1;\r\nreturn x + x;';
  const findings = [
    { severity: 'minor', line: 1, fragment: 'const x', explanation: 'Точний недолік.' },
    { severity: 'error', line: 2, fragment: 'x', explanation: 'Два збіги.' },
    { severity: 'error', line: 2, fragment: 'return y', explanation: 'Відсутній фрагмент.' },
  ];
  const assessment = readCodeAssessment({ assessable: true, summary: 'Є коментарі.', findings }, code, []);
  assert.deepEqual(assessment.findings.map(item => item.location), [{ line: 1, start: 0, end: 7 }, undefined, undefined]);
  assert.deepEqual(assessment.findings.map(item => item.deduction), [4, 0, 0]);
  assert.equal(assessment.score, 96);
  const blocked = readCodeAssessment({ assessable: true, summary: 'Вимога.', findings: [
    { severity: 'blocking', line: 2, fragment: 'return x + x', explanation: 'Ключову вимогу порушено.' },
    { severity: 'error', line: 2, fragment: 'x + x', explanation: 'Дублікат.' },
  ] }, code, []);
  assert.equal(blocked.score, 65);
  assert.equal(readCodeAssessment({ assessable: false, summary: 'Потрібна функція.', findings: [] }, code, []).score, null);
  assert.throws(() => readCodeAssessment({ score: 100, summary: 'Стара рубрика.', findings }, code, []));
});

test('code review uses the starter and criteria, caches across bridge instances, and rejects credentials', async t => {
  const lesson = lessons[0];
  const code = '  const amount = 1;';
  let calls = 0;
  const dir = await mkdtemp(join(tmpdir(), 'backend-path-assessment-'));
  const newBridge = () => createCourseBridge(process.cwd(), dir, async prompt => {
    calls++;
    const input = JSON.parse(prompt.user);
    const context = JSON.parse(input.lesson);
    assert.deepEqual(context.criteria, lesson.criteria);
    assert.equal(context.task, lesson.task);
    assert.equal(context.starter, lesson.lab.starter);
    assert.equal(input.source, '1 | ' + code);
    assert.match(prompt.system, /Do not run code/);
    assert.match(prompt.system, /diagnostic calls/);
    return { assessment: { assessable: true, summary: 'Потрібне уточнення.', findings: [
      { severity: 'error', line: 1, fragment: 'amount = 1', explanation: 'Значення має приходити з аргументу.', replacement: 'amount = input' },
    ] } };
  });
  let bridge = newBridge();
  const server = createServer((req, res) => bridge(req, res, () => res.writeHead(404).end()));
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise<void>(resolve => server.close(() => resolve())));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const origin = 'http://127.0.0.1:' + address.port;
  const route = origin + '/api/backend-path/';
  const submit = (code: string, id = lesson.id, source = origin) => fetch(route + 'code-review', {
    method: 'POST', headers: { origin: source, 'Content-Type': 'application/json', 'X-Backend-Path': '1' },
    body: JSON.stringify({ lesson: id, code }),
  });
  const response = await submit(code);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.score, 88);
  assert.deepEqual(result.findings[0].location, { line: 1, start: 8, end: 18 });
  bridge = newBridge();
  const cached = await submit(code).then(response => response.json());
  assert.deepEqual(cached, { ...result, cached: true });
  assert.equal((await submit('const token = "sk-example_only_for_tests";')).status, 400);
  assert.equal((await submit(code, 'no-lesson')).status, 400);
  assert.equal((await submit(code, lesson.id, 'https://elsewhere.example')).status, 403);
  assert.equal((await fetch(route + 'progress').then(response => response.json())).revision, 0);
  assert.equal(calls, 1);
});

test('night stages use read, actual practice criteria, and the regular lesson completion', () => {
  const first = lessons[0];
  let state = freshProgress();
  assert.equal(nightPlan(state).candidate?.id, first.id + '/lecture');
  state = updateLesson(state, first.id, {read:true});
  assert.equal(nightPlan(state).candidate?.id, first.id + '/practice');
  assert.equal(nightPlan(state).candidate?.criteriaRequired,2);
  state = updateLesson(state, first.id, {checks:[0,1]});
  assert.equal(nightPlan(state).candidate?.section,'check');
  assert.equal(nightPlan(state).completed.includes(first.id + '/check'),false);
  assert.equal(completeLesson(state, first), state);
  state = updateLesson(state, first.id, {codeReview:{score:70,checkedAt:'2026-11-24T10:00:00.000Z'}});
  state = completeLesson(state, first);
  assert.equal(nightPlan(state).candidate?.lessonId, lessons[1].id);
  assert.equal(nightPlan(state).completed.includes(first.id + '/check'),true);
});

test('other windows can save independent fields and a conflicting note is not overwritten', () => {
  const id = lessons[0].id;
  const base = freshProgress();
  const browser = updateLesson(base,id,{notes:'Browser note',checks:[0],codeReview:{score:92,checkedAt:'2026-11-24T16:00:00.000Z'}});
  const recall = updateLesson(base,id,{read:true,checks:[1],codeReview:{score:64,checkedAt:'2026-11-24T15:00:00.000Z'}});
  const merged = mergeProgress(base,browser,recall);
  assert.equal(merged.lessons[id].notes,'Browser note');
  assert.equal(merged.lessons[id].read,true);
  assert.deepEqual(merged.lessons[id].checks,[0,1]);
  assert.equal(merged.lessons[id].codeReview?.score,92);
  assert.throws(()=>mergeProgress(base,browser,updateLesson(base,id,{notes:'Recall note'})),ProgressConflict);
});

test('loopback bridge imports only once, merges stale updates, and recovers a damaged file', async t => {
  const dir = await mkdtemp(join(tmpdir(),'backend-path-night-'));
  const bridge = createCourseBridge(process.cwd(),dir);
  const server = createServer((req,res)=>bridge(req,res,()=>res.writeHead(404).end()));
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise<void>(resolve=>server.close(()=>resolve())));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const url = 'http://127.0.0.1:' + address.port;
  const endpoint = url + '/api/backend-path/';
  const base = freshProgress(), id = lessons[0].id;
  const post = (progress: typeof base, baseRevision = 0, initialize = false, origin = url) => fetch(endpoint+'progress',{
    method:'POST',headers:{origin,'Content-Type':'application/json','X-Backend-Path':'1'},
    body:JSON.stringify({base,baseRevision,progress,initialize}),
  });
  assert.equal((await fetch(endpoint+'health').then(r=>r.json())).ready,false);
  assert.equal((await post(base)).status,409);
  assert.equal((await post(base,0,true,'https://elsewhere.example')).status,403);
  assert.equal((await post(updateLesson(base,id,{read:true}),0,true)).status,200);
  assert.equal((await post(updateLesson(base,id,{checks:[0]}))).status,200);
  const p = await fetch(endpoint+'progress').then(r=>r.json());
  assert.equal(p.revision,2);
  assert.equal(p.progress.lessons[id].read,true);
  assert.deepEqual(p.progress.lessons[id].checks,[0]);
  const file = join(dir,'progress-v1.json');
  assert.ok((await readFile(file+'.bak','utf8')).includes('"revision":1'));
  await writeFile(file,'broken');
  assert.equal((await fetch(endpoint+'progress').then(r=>r.json())).revision,1);
});
