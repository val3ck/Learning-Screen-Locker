import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,readdir,stat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {dayKey} from '../src/core/calendar';
import {newSchedule,tickSchedule} from '../src/core/scheduler';
import {canSurrender,createSession,recordAttempt,surrenderMessage,updateHistory} from '../src/core/session';
import type {LearningModule,ModuleState,Task} from '../src/core/contracts';
import {Store} from '../electron/store';
const now=new Date(2026,10,12,9);
const fakeTask:Task={moduleId:'fake',contentVersion:'1',id:'first',templateId:'test',topicIds:['one'],seed:1,difficulty:1,title:'Тестова вправа',brief:'Поясни щось',hints:['Думай'],starter:'',tables:[],payload:{expected:'yes'}};
const fakeModule:LearningModule={manifest:{id:'fake',version:'1',title:'Fake',capabilities:['text']},catalog:[{id:'one',title:'One',chapter:1,prerequisites:[]}],progressAdapter:{parse:()=>({version:1,moduleId:'fake',catalogVersion:'1',confirmedTopicIds:['one'],practiceTopicIds:[],completedSourceIds:[],syncedAt:now.toISOString()})},taskProvider:{generate:()=>[0,1,2].map(n=>({...fakeTask,id:String(n)})),solution:()=> 'yes'},runner:{create:()=>({prepare:async()=>{},run:async(_task,answer)=>({status:answer==='yes'?'correct':'incorrect',message:'checked'}),dispose(){}})},presentation:{language:'text',answerLabel:'Answer',contextLabel:'Context'}};
test('Навчальний день не змінюється опівночі, але змінюється о 05:00',()=>{
  assert.equal(dayKey(new Date(2026,10,12,0)), '2026-11-11');assert.equal(dayKey(new Date(2026,10,12,4,59)), '2026-11-11');assert.equal(dayKey(new Date(2026,10,12,5)), '2026-11-12');assert.equal(dayKey(new Date(2027,0,1,2)), '2026-12-31');
});
test('Розклад рахує активність, попереджає й запускає тільки один раз',()=>{
  let state=newSchedule(now,()=>0);state.activeMs=state.delayMs-65000;state.eligible=true;
  let result=tickSchedule(state,{now:new Date(+now+10000),active:false,returned:false,hasProgress:true});assert.equal(result.state.activeMs,state.activeMs);
  result=tickSchedule(result.state,{now:new Date(+now+20000),active:true,returned:false,hasProgress:true});assert.equal(result.action,'warn');
  let time=+now+20000;while(result.action!=='start'){time+=10000;result=tickSchedule(result.state,{now:new Date(time),active:true,returned:false,hasProgress:true});}
  assert.equal(tickSchedule(result.state,{now:new Date(time+10000),active:true,returned:true,hasProgress:true}).action,'none');
});
test('О 05:00 нічна робота чекає нового повернення; сон не додає години',()=>{
  const before=new Date(2026,10,12,4,59,59);let s=newSchedule(before,()=>0);s.eligible=true;
  let r=tickSchedule(s,{now:new Date(2026,10,12,5,0,1),active:true,returned:false,hasProgress:true},()=>0);assert.equal(r.state.eligible,false);assert.equal(r.state.activeMs,0);
  r=tickSchedule(r.state,{now:new Date(2026,10,12,10),active:true,returned:true,hasProgress:true});assert.equal(r.state.eligible,true);assert.ok(r.state.activeMs<=15000);
  const persisted=JSON.parse(JSON.stringify(r.state));assert.equal(tickSchedule(persisted,{now:new Date(2026,10,12,10,0,10),active:false,returned:false,hasProgress:true}).state.delayMs,persisted.delayMs);
});
test('Без прогресу та після завершення примусового запуску немає',()=>{
  const s=newSchedule(now,()=>0);s.eligible=true;s.activeMs=s.delayMs;
  assert.equal(tickSchedule(s,{now,active:true,returned:true,hasProgress:false}).action,'none');s.finished=true;
  assert.equal(tickSchedule(s,{now,active:true,returned:true,hasProgress:true}).action,'none');
});
test('Інший навчальний модуль проходить ядро без PostgreSQL-рушія',async()=>{
  let state:ModuleState={version:1,moduleId:'fake',progress:fakeModule.progressAdapter.parse({}),history:{}};
  const session=createSession(fakeModule,state,[],dayKey(now),'practice',now,1);
  assert.equal(canSurrender(session),false);session.activeMs=900000;assert.ok(surrenderMessage(session));session.currentIndex=2;assert.equal(surrenderMessage(session),null);
  const runner=fakeModule.runner.create();await runner.prepare();
  for(let i=0;i<3;i++){session.currentIndex=i;session.answers[i]='yes';recordAttempt(session,await runner.run(session.tasks[i],'yes',true),true,now);}
  session.outcome='completed';session.endedAt=now.toISOString();state=updateHistory(state,session);assert.equal(state.history.one.independent,1);assert.equal(state.history.one.intervalIndex,0);
  const second=structuredClone(session);second.id='second';second.hintLevels=[1,1,1];state=updateHistory(state,second);assert.equal(state.history.one.assisted,1);assert.equal(state.history.one.intervalIndex,0);runner.dispose();
});
test('Незавершена після здачі тема повертається завтра, технічний збій не карає',()=>{
  const state:ModuleState={version:1,moduleId:'fake',progress:fakeModule.progressAdapter.parse({}),history:{}};
  const s=createSession(fakeModule,state,[],'2026-11-12','practice',now,1);s.endedAt=now.toISOString();s.outcome='technical';assert.deepEqual(updateHistory(state,s).history,{});
  s.outcome='surrendered';assert.equal(updateHistory(state,s).history.one.missed,1);
});
test('Статистика відновлює резервну копію та витримує конкурентне збереження',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'recall-тест '));const store=new Store(dir);
  try{await store.write('test.json',{version:1,n:1});await store.write('test.json',{version:1,n:2});
    const mtime=(await stat(path.join(dir,'test.json'))).mtimeMs;const bakMtime=(await stat(path.join(dir,'test.json.bak'))).mtimeMs;
    await store.write('test.json',{version:1,n:2});
    assert.equal((await stat(path.join(dir,'test.json'))).mtimeMs,mtime);assert.equal((await stat(path.join(dir,'test.json.bak'))).mtimeMs,bakMtime);
    assert.ok(!(await readdir(dir)).some(name=>name.endsWith('.tmp')));
    await writeFile(path.join(dir,'test.json'),'broken');
    const recovered=await store.read('test.json',{version:1,n:0},v=>(v as {version:number})?.version===1);assert.equal(recovered.n,1);assert.ok(store.messages.length);
    await assert.rejects(()=>store.write('../outside.json',{}));
    await store.write('test.json',{version:1,n:3});assert.equal(JSON.parse(await readFile(path.join(dir,'test.json.bak'),'utf8')).n,1);
    await Promise.all(Array.from({length:10},(_,n)=>store.write('test.json',{version:1,n})));assert.equal(JSON.parse(await readFile(path.join(dir,'test.json'),'utf8')).n,9);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('Здача не стирає вже продемонстровану навичку й не рахує невідкриту тему повтореною',()=>{
  const state:ModuleState={version:1,moduleId:'fake',progress:fakeModule.progressAdapter.parse({}),history:{}};
  const session=createSession(fakeModule,state,[],dayKey(now),'practice',now,1);session.answers[0]='yes';recordAttempt(session,{status:'correct',message:'ok'},true,now);session.currentIndex=1;
  session.tasks[2].topicIds=['unseen'];session.outcome='surrendered';session.endedAt=now.toISOString();
  const updated=updateHistory(state,session);assert.equal(updated.history.one.independent,1);assert.equal(updated.history.unseen.lastReviewedAt,'');assert.equal(updated.history.unseen.missed,1);
});
