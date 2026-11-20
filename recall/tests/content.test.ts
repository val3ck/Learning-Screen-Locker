import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {makeTask,VARIANTS_PER_TOPIC,type SQLPayload} from '../src/modules/postgresql/templates';
import {catalog} from '../src/modules/postgresql/catalog';
import {domains,fixture} from '../src/modules/postgresql/fixtures';
import {executeSQL,normalize} from '../src/modules/postgresql/engine';
test('148 шаблонів: еталони на кількох seeds та відхилення неправильної відповіді', {timeout:600000},async()=>{
  const db=new PGlite();await db.waitReady;
  try{
    for(let i=0;i<catalog.length;i++)for(let variant=0;variant<VARIANTS_PER_TOPIC;variant++){
      for(const seed of [17,893]){
        const task=makeTask(i,variant,seed);const payload=task.payload as SQLPayload;
        const result=await executeSQL(db,task,payload.solution,true);assert.equal(result.status,'correct',`${task.templateId} seed ${seed}: ${result.message}`);
      }
      const task=makeTask(i,variant,17);const wrong=await executeSQL(db,task,'SELECT 999 AS wrong;',true);
      assert.notEqual(wrong.status,'correct',`${task.templateId}: wrong answer passed`);
      console.log(`PASS ${task.templateId}`);
    }
  }finally{await db.close();}
});
test('Шість предметних областей, еквівалентні запити, скидання та SQL-помилки',{timeout:120000},async()=>{
  const db=new PGlite();await db.waitReady;
  try{
    for(const domain of domains)for(let variant=0;variant<3;variant++){await db.exec('DROP SCHEMA public CASCADE;CREATE SCHEMA public;');await db.exec(fixture(domain,32,variant).sql);assert.ok((await db.query(`SELECT * FROM ${domain.items}`)).rows.length>=8);}
    const task=makeTask(1,0,17);const payload=task.payload as SQLPayload;
    const equivalent=payload.solution.replace('SELECT name, price','SELECT x.name,x.price').replace(/FROM (\w+);/,'FROM $1 AS x;');assert.equal((await executeSQL(db,task,equivalent,true)).status,'correct');
    assert.equal((await executeSQL(db,task,'not valid SQL',true)).status,'incorrect');
    const hardcoded=await executeSQL(db,task,"SELECT 'Клавіатура' AS name, 80 AS price;",true);assert.notEqual(hardcoded.status,'correct');
    const first=await executeSQL(db,task,payload.solution,false);const second=await executeSQL(db,task,payload.solution,false);assert.deepEqual(first.tables,second.tables);
    const numeric=(value:string)=>({fields:[{name:'n',dataTypeID:1700}],rows:[{n:value}],affectedRows:0});assert.equal(normalize(numeric('1.20')),normalize(numeric('1.2000')));
    assert.notEqual(normalize({...numeric('1.2'),rows:[{n:'1.2'},{n:'1.2'}]}),normalize(numeric('1.2')));
  }finally{await db.close();}
});
