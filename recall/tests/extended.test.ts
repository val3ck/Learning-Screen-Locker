import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {catalog,topicIds} from '../src/modules/postgresql/catalog';
import {makeTask,combineTask,type SQLPayload,generateTasks,VARIANTS_PER_TOPIC} from '../src/modules/postgresql/templates';
import {executeSQL} from '../src/modules/postgresql/engine';
import {statements} from '../src/modules/postgresql/statements';
import type {SessionRecord} from '../src/core/contracts';
test('SQL lexer ignores strings, comments, and dollar-quoted bodies',()=>{
  assert.deepEqual(statements("-- BEGIN;\nSELECT 'COMMIT;'; /* /* nest; */ ROLLBACK; */ DO $$BEGIN RAISE NOTICE 'x;'; END$$;").map(s=>s.words[0]),['SELECT','DO']);
  assert.deepEqual(statements("BEGIN; UPDATE x SET v='a;''b'; ROLLBACK;").map(s=>s.words[0]),['BEGIN','UPDATE','ROLLBACK']);
});
test('Комбіновані вправи використовують відомі навички та проходять три набори даних',{timeout:180000},async()=>{
  const db=new PGlite();await db.waitReady;
  try{
    let combined=0;
    for(let i=0;i<catalog.length;i++)for(let variant=0;variant<VARIANTS_PER_TOPIC;variant++){
      const task=makeTask(i,variant,743);const original=task.templateId;combineTask(task,new Set(topicIds));
      if(task.templateId===original)continue;combined++;
      assert.ok(task.topicIds.every(id=>topicIds.includes(id)));
      const result=await executeSQL(db,task,(task.payload as SQLPayload).solution,true);assert.equal(result.status,'correct',`${task.templateId}: ${result.message}`);
    }
    assert.ok(combined>=25);
    const task=makeTask(33,1,17);const payload=task.payload as SQLPayload;const table=payload.transaction!.table;
    for(const wrong of ['SELECT 999;',`BEGIN;SELECT 1;ROLLBACK;`,`SELECT 'BEGIN;UPDATE ${table} SET stock=stock+5;ROLLBACK;';`,`BEGIN;UPDATE ${table} SET stock=stock+5 WHERE false;ROLLBACK;`])assert.notEqual((await executeSQL(db,task,wrong,true)).status,'correct');
    assert.equal((await executeSQL(db,task,payload.solution.replace('BEGIN;','START TRANSACTION;').replace('ROLLBACK;','ABORT;'),true)).status,'correct');
  }finally{await db.close();}
});
test('Відомі шаблони не повторюються сім днів за наявності альтернатив',()=>{
  const context={confirmedTopicIds:topicIds,history:{},sessions:[] as SessionRecord[],now:'2026-11-12T10:00:00Z',seed:21};
  const first=generateTasks(context);
  const recent={startedAt:context.now,tasks:first} as SessionRecord;
  const next=generateTasks({...context,sessions:[recent],seed:33});
  const family=(id:string)=>id.split(':').slice(0,2).join(':');
  assert.ok(next.every(t=>!first.some(old=>family(old.templateId)===family(t.templateId))));
  assert.ok([...first,...next].every(task=>task.hints.length===0));
});
