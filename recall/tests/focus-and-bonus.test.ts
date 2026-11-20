import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {newSchedule,tickSchedule,snoozeSchedule,WARNING_MS,SNOOZE_MS} from '../src/core/scheduler';
import {createSession,addSpeedBonus,recordAttempt} from '../src/core/session';
import {Store,validSession} from '../electron/store';
import {postgresql} from '../src/modules/postgresql';
import {catalog,topicIds} from '../src/modules/postgresql/catalog';
import {executeSQL} from '../src/modules/postgresql/engine';
import type {ModuleState} from '../src/core/contracts';
const now=new Date(2026,10,13,10);
const state=():ModuleState=>({version:1,moduleId:'postgresql',progress:postgresql.progressAdapter.parse({completed:Array.from({length:14},(_,i)=>i),index:14,drafts:{}}),history:{}});
test('Видиме попередження має повні дві хвилини; невидиме не запускає сесію',()=>{
  let schedule=newSchedule(now,()=>0);schedule.eligible=true;schedule.activeMs=schedule.delayMs;
  let result=tickSchedule(schedule,{now,active:true,returned:false,hasProgress:true,warningVisible:false});assert.equal(result.action,'warn');assert.equal(result.state.warningRemainingMs,WARNING_MS);
  let clock=+now;
  for(let i=0;i<30;i++){clock+=10000;result=tickSchedule(result.state,{now:new Date(clock),active:true,returned:false,hasProgress:true,warningVisible:false});assert.notEqual(result.action,'start');}
  for(let i=0;i<11;i++){clock+=10000;result=tickSchedule(result.state,{now:new Date(clock),active:true,returned:false,hasProgress:true,warningVisible:true});assert.equal(result.action,'none');}
  clock+=10000;result=tickSchedule(result.state,{now:new Date(clock),active:true,returned:false,hasProgress:true,warningVisible:true});assert.equal(result.action,'start');
});
test('Відкладення на 30 хв зберігається і потім дає нове попередження',()=>{
  let schedule=newSchedule(now,()=>0);schedule.warned=true;schedule.triggered=true;
  schedule=snoozeSchedule(schedule,now);assert.equal(schedule.snoozedUntil,+now+SNOOZE_MS);assert.equal(schedule.triggered,false);
  let result=tickSchedule(JSON.parse(JSON.stringify(schedule)),{now:new Date(+now+SNOOZE_MS-1),active:true,returned:false,hasProgress:true,warningVisible:false});assert.equal(result.action,'none');
  result=tickSchedule(result.state,{now:new Date(+now+SNOOZE_MS),active:true,returned:false,hasProgress:true,warningVisible:false});assert.equal(result.action,'warn');assert.equal(result.state.warningRemainingMs,WARNING_MS);
  result=tickSchedule(result.state,{now:new Date(+now+SNOOZE_MS+60000),active:false,returned:false,hasProgress:true,warningVisible:false});assert.equal(result.state.warningRemainingMs,WARNING_MS);
});
test('Повернення після блокування починає попередження заново',()=>{
  const schedule={...newSchedule(now,()=>0),eligible:true,warned:true,warningRemainingMs:1000};
  const result=tickSchedule(schedule,{now:new Date(+now+1000),active:true,returned:true,hasProgress:true,warningVisible:true});assert.equal(result.action,'none');assert.equal(result.state.warningRemainingMs,WARNING_MS);
});
test('Швидка сесія додає максимум дві вправи на слабкі відомі теми',()=>{
  const moduleState=state();const session=createSession(postgresql,moduleState,[],'2026-11-13','practice',now,52);
  const weak=session.tasks[0].topicIds[0];recordAttempt(session,{status:'incorrect',message:'wrong'},true,now);session.solved=[true,true,true];session.activeMs=120000;
  const progress=JSON.stringify(moduleState.progress);
  assert.equal(addSpeedBonus(postgresql,moduleState,[],session,5,now,61),true);assert.equal(session.tasks.length,4);assert.equal(session.tasks[3].topicIds[0],weak);assert.ok(session.tasks[3].selectionReason?.includes('помилки'));
  assert.equal(addSpeedBonus(postgresql,moduleState,[],session,5,now,62),false);session.solved[3]=true;
  assert.equal(addSpeedBonus(postgresql,moduleState,[],session,5,now,62),true);session.solved[4]=true;
  assert.equal(addSpeedBonus(postgresql,moduleState,[],session,5,now,63),false);assert.equal(session.tasks.length,5);assert.ok(validSession(session));
  assert.equal(new Set(session.tasks.map(t=>t.id)).size,5);assert.ok(session.tasks.every(t=>t.topicIds.every(id=>moduleState.progress!.confirmedTopicIds.includes(id))));assert.equal(JSON.stringify(moduleState.progress),progress);
});
test('На межі мінімального часу немає бонусу; новий урок не підтверджує навичку',()=>{
  const moduleState=state();const session=createSession(postgresql,moduleState,[],'2026-11-13','practice',now,52);session.solved=[true,true,true];session.activeMs=300000;
  assert.equal(addSpeedBonus(postgresql,moduleState,[],session,5,now),false);
  const progress=JSON.stringify(moduleState.progress),lesson=postgresql.taskProvider.nextLesson!(moduleState.progress!.confirmedTopicIds)!;
  assert.equal(lesson.topicId,'joins');assert.ok(lesson.explanation.includes('ON'));assert.ok(lesson.tables.length>=2);assert.equal(JSON.stringify(moduleState.progress),progress);
  assert.equal(postgresql.taskProvider.nextLesson!(topicIds),null);
});
test('Пауза і п’ять вправ переживають збереження; старі налаштування отримують 5 хв',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'recall-focus-'));const store=new Store(dir);
  try{
    await writeFile(path.join(dir,'settings.json'),JSON.stringify({version:1,setupComplete:true,autoStart:true,statisticsPath:dir,coursePath:'course',activeModuleId:'postgresql'}));
    assert.equal((await store.settings('course')).minPracticeMinutes,5);
    const moduleState=state(),session=createSession(postgresql,moduleState,[],'2026-11-13','daily',now,88);session.solved.fill(true);addSpeedBonus(postgresql,moduleState,[],session,5,now,91);session.paused=true;session.answers[3]='SELECT 123;';
    await store.saveSession(session);await store.write('schedule.json',snoozeSchedule(newSchedule(now),now));
    const reloaded=(await store.sessions())[0];assert.equal(reloaded.paused,true);assert.equal(reloaded.answers[3],'SELECT 123;');assert.equal(reloaded.tasks.length,4);assert.equal(reloaded.endedAt,undefined);assert.equal((await store.schedule()).snoozedUntil,+now+SNOOZE_MS);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('Приклади нових уроків і додаткові вправи виконуються в PostgreSQL',{timeout:180000},async()=>{
  const db=new PGlite();await db.waitReady;
  try{
    for(let i=0;i<catalog.length;i++){
      const known=topicIds.slice(0,i),lesson=postgresql.taskProvider.nextLesson!(known);if(!lesson)continue;
      const {makeTask}=await import('../src/modules/postgresql/templates');const task=makeTask(i,0,713);
      assert.equal((await executeSQL(db,task,lesson.example,true)).status,'correct',lesson.title);
    }
    const moduleState=state(),session=createSession(postgresql,moduleState,[],'2026-11-13','practice',now,88);session.solved.fill(true);addSpeedBonus(postgresql,moduleState,[],session,5,now,91);
    const task=session.tasks.at(-1)!;assert.equal((await executeSQL(db,task,postgresql.taskProvider.solution(task),true)).status,'correct');
  }finally{await db.close();}
});
