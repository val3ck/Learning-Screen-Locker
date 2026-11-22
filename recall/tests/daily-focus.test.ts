import test from 'node:test';
import assert from 'node:assert/strict';
import {FocusGuard} from '../electron/focus-guard';
import {newSchedule,tickSchedule,snoozeSchedule,needsWarning,WARNING_MS,automaticDayAllowed,hasFinishedToday,completeScheduleForDay} from '../src/core/scheduler';
import type {SessionRecord} from '../src/core/contracts';

test('Після 16:00 сесія стартує без попередження, до 16:00 спершу запрошує',()=>{
  for(const [hour,minute,action] of [[15,59,'warn'],[16,0,'start'],[17,30,'start']] as const){
    const now=new Date(2026,10,14,hour,minute);const schedule={...newSchedule(now,()=>0),eligible:true,activeMs:3600000};
    assert.equal(tickSchedule(schedule,{now,active:true,returned:false,hasProgress:true,warningVisible:false,warnAfter16:false}).action,action);
    assert.equal(needsWarning(now,'activity',false),hour<16);
  }
  const now=new Date(2026,10,14,16);const waiting={...newSchedule(now,()=>0),eligible:true,activeMs:1000};
  assert.equal(tickSchedule(waiting,{now,active:true,returned:false,hasProgress:true}).action,'none');
});
test('SQL за активністю попереджає після 16:00 і чекає показаного зворотного відліку',()=>{
  const now=new Date('2026-11-14T17:30:00+02:00');
  const pending={...newSchedule(now,()=>0),eligible:true,activeMs:3600000-WARNING_MS-1000};
  const input={now,active:true,returned:false,hasProgress:true,warningVisible:false,start:'activity' as const};
  assert.equal(tickSchedule(pending,input).action,'none');
  const ready={...pending,lastTick:now.getTime()-1000};
  const warned=tickSchedule(ready,input);
  assert.equal(warned.action,'warn');
  assert.equal(warned.state.warningRemainingMs,WARNING_MS);
  const later=new Date(now.getTime()+1000);
  assert.equal(tickSchedule(warned.state,{...input,now:later}).state.warningRemainingMs,WARNING_MS);
  assert.equal(tickSchedule(warned.state,{...input,now:later,warningVisible:true}).state.warningRemainingMs,WARNING_MS-1000);
});
test('Показане запрошення має повний відлік навіть при вимкненні попереджень після 16:00',()=>{
  const now=new Date('2026-11-14T16:00:00+02:00');
  const previous={...newSchedule(now,()=>0),eligible:true,activeMs:3600000,warned:true,warningRemainingMs:60000,lastTick:now.getTime()-1000};
  const result=tickSchedule(previous,{now,active:true,returned:false,hasProgress:true,warningVisible:true,warnAfter16:false});
  assert.equal(result.action,'none');
  assert.equal(result.state.warningRemainingMs,59000);
});
test('Відкладене запрошення після 16:00 стартує одразу, якщо вимкнено попередження',()=>{
  const at=new Date(2026,10,14,15,50),schedule=snoozeSchedule(newSchedule(at,()=>0),at);
  assert.equal(tickSchedule(schedule,{now:new Date(2026,10,14,16,19),active:true,returned:false,hasProgress:true}).action,'none');
  assert.equal(tickSchedule(schedule,{now:new Date(2026,10,14,16,20),active:true,returned:false,hasProgress:true,warningVisible:false,warnAfter16:false}).action,'start');
});
test('Автоматичний старт з наступного навчального дня, після ручної практики повтору сьогодні немає',()=>{
  assert.equal(automaticDayAllowed(new Date(2026,10,13,18),'2026-11-13'),false);
  assert.equal(automaticDayAllowed(new Date(2026,10,14,4,59),'2026-11-13'),false);
  assert.equal(automaticDayAllowed(new Date(2026,10,14,5),'2026-11-13'),true);
  const session={mode:'practice',dayKey:'2026-11-13',outcome:'completed',endedAt:new Date(2026,10,13,12).toISOString()} as SessionRecord;
  assert.equal(hasFinishedToday([session],new Date(2026,10,13,18)),true);
  assert.equal(hasFinishedToday([session],new Date(2026,10,14,9)),false);
  assert.equal(hasFinishedToday([{...session,mode:'demo'}],new Date(2026,10,13,18)),false);
  const schedule=completeScheduleForDay(newSchedule(new Date(2026,10,12,10)),new Date(2026,10,13,18));assert.equal(schedule.dayKey,'2026-11-13');assert.equal(schedule.finished,true);
});
test('Повноекранний захист блокує звичайні виходи і відновлює нормальні віконні властивості',()=>{
  const calls:Record<string,unknown[]>={};const win=new Proxy({isDestroyed:()=>false},{get:(target,key)=>key in target?target[key as keyof typeof target]:(...args:unknown[])=>{calls[String(key)]=args;}});
  const guard=new FocusGuard();guard.enter(win as never);
  assert.equal(guard.active,true);assert.deepEqual(calls.setKiosk,[true]);assert.deepEqual(calls.setClosable,[false]);assert.deepEqual(calls.setMinimizable,[false]);
  let prevented=0;const event={preventDefault(){prevented++;}};
  assert.equal(guard.preventClose(event),true);
  for(const input of [{key:'F11',alt:false,control:false,meta:false},{key:'F4',alt:true,control:false,meta:false},{key:'w',alt:false,control:true,meta:false},{key:'Escape',alt:false,control:false,meta:false}])assert.equal(guard.preventExitKey(event,input),true);
  assert.equal(prevented,5);
  assert.equal(guard.preventExitKey(event,{key:'Enter',alt:false,control:true,meta:false}),false);
  assert.equal(guard.preventExitKey(event,{key:'Escape',alt:false,control:true,meta:false}),false);
  assert.equal(guard.preventExitKey(event,{key:'r',alt:false,control:false,meta:true}),false);
  assert.equal(guard.preventClose(event,true),false);
  guard.leave(win as never);assert.equal(guard.active,false);assert.deepEqual(calls.setKiosk,[false]);assert.deepEqual(calls.setClosable,[true]);assert.deepEqual(calls.setMinimizable,[true]);assert.equal(guard.preventClose(event),false);
});
