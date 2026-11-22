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

test('night stages use read, actual practice criteria, and the regular lesson completion', () => {
  const first = lessons[0];
  let state = freshProgress();
  assert.equal(nightPlan(state).candidate?.id, first.id + '/lecture');
  state = updateLesson(state, first.id, {read:true});
  assert.equal(nightPlan(state).candidate?.id, first.id + '/practice');
  assert.equal(nightPlan(state).candidate?.criteriaRequired,2);
  state = updateLesson(state, first.id, {checks:[0,1]});
  assert.equal(nightPlan(state).candidate?.section,'practice');
  assert.equal(nightPlan(state).completed.includes(first.id + '/check'),false);
  state = completeLesson(state, first);
  assert.equal(nightPlan(state).candidate?.lessonId, lessons[1].id);
  assert.equal(nightPlan(state).completed.includes(first.id + '/check'),true);
});

test('other windows can save independent fields and a conflicting note is not overwritten', () => {
  const id = lessons[0].id;
  const base = freshProgress();
  const browser = updateLesson(base,id,{notes:'Browser note',checks:[0]});
  const recall = updateLesson(base,id,{read:true,checks:[1]});
  const merged = mergeProgress(base,browser,recall);
  assert.equal(merged.lessons[id].notes,'Browser note');
  assert.equal(merged.lessons[id].read,true);
  assert.deepEqual(merged.lessons[id].checks,[0,1]);
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
