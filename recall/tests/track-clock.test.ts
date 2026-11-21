import assert from 'node:assert/strict';
import test from 'node:test';
import {clockDue,kyivDayKey} from '../src/core/calendar';
import {defaultStart,validStarts} from '../src/core/tracks';
import {newSchedule,tickSchedule,WARNING_MS} from '../src/core/scheduler';
import {eveningSchedule,tickEvening} from '../src/core/evening';
import {nodeInvitationDay} from '../src/core/node-night';

const at=(hour:number,minute=0)=>new Date(Date.UTC(2026,10,22,hour-2,minute));

test('Track schedules accept any Kyiv minute and explicitly support manual mode',()=>{
  assert.equal(defaultStart('postgresql'),'activity');
  assert.equal(defaultStart('english'),'19:00');
  assert.equal(defaultStart('nodejs'),'22:59');
  assert.equal(validStarts({postgresql:'00:07',english:'23:59',nodejs:null}),true);
  assert.equal(validStarts({postgresql:'activity'}),true);
  for(const value of [{nodejs:'activity'},{english:'24:00'},{postgresql:'3:45'},{english:false},{nodejs:'15:62'},{other:'10:00'}]){
    assert.equal(validStarts(value),false);
  }
  assert.equal(clockDue(at(23,59),'01:13'),false);
  assert.equal(clockDue(at(1,12),'01:13'),false);
  assert.equal(clockDue(at(1,13),'01:13'),true);
  assert.equal(clockDue(at(4,59),'01:13'),true);
  assert.equal(clockDue(at(5),'01:13'),false);
});

test('A fixed SQL schedule warns after reaching its minute even after 16:00',()=>{
  const input={start:'17:37' as const,active:true,returned:false,hasProgress:true,warningVisible:false};
  let state=newSchedule(at(17,36),()=>0);
  assert.equal(tickSchedule(state,{...input,now:at(17,36)}).action,'none');
  assert.equal(tickSchedule(state,{...input,start:null,now:at(17,38)}).action,'none');
  assert.equal(tickSchedule(state,{...input,active:false,now:at(17,38)}).action,'none');
  const first=tickSchedule(state,{...input,now:at(17,39)});
  assert.equal(first.action,'warn');state=first.state;
  for(let delta=5000;delta<=WARNING_MS;delta+=5000){
    const result=tickSchedule(state,{...input,warningVisible:true,now:new Date(at(17,39).getTime()+delta)});
    state=result.state;
    assert.equal(result.action,delta===WARNING_MS?'start':'none');
  }
  assert.equal(tickSchedule(state,{...input,now:at(19)}).action,'none');
});

test('English can run at a morning or explicitly late hour, or be manual',()=>{
  const input={active:true,busy:false,enabledAfterDay:'2026-11-20',done:false,warningVisible:false};
  const check=(hour:number,minute:number,start:'08:17'|'01:13'|'19:00'|null)=>{
    const now=at(hour,minute);
    return tickEvening(eveningSchedule(now),{...input,now,start});
  };
  assert.equal(check(8,16,'08:17').action,'none');
  assert.equal(check(8,17,'08:17').action,'warn');
  assert.equal(check(1,13,'01:13').action,'warn');
  assert.equal(check(1,13,'01:13').optional,true);
  assert.equal(check(23,30,'19:00').optional,true);
  assert.equal(check(20,0,null).action,'none');
  assert.equal(tickEvening(eveningSchedule(at(8,17)),{...input,busy:true,now:at(8,17),start:'08:17'}).action,'none');
});

test('Node daily offer uses the learning day and retains the late-night default window',()=>{
  assert.equal(nodeInvitationDay(at(10,24),'10:25'),null);
  assert.equal(nodeInvitationDay(at(10,25),'10:25'),kyivDayKey(at(10,25)));
  assert.equal(nodeInvitationDay(at(0,9),'00:09'),kyivDayKey(at(0,9)));
  assert.equal(nodeInvitationDay(at(0,40),'22:59'),null);
  assert.equal(nodeInvitationDay(at(23,10),null),null);
});
