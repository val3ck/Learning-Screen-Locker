import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {EnglishHost} from '../electron/english-host';
import {englishPauseMinutes,minuteMs,validEnglishPauseMinutes} from '../src/core/tracks';

test('An in-place break keeps the same open session, saves its work and freezes active time',async t=>{
  const home=await mkdtemp(path.join(os.tmpdir(),'recall-english-break-'));
  t.after(()=>rm(home,{recursive:true,force:true}));
  let now=new Date('2026-11-23T18:00:00Z');
  const host=new EnglishHost(home,()=>now);
  host.start();
  const run=host.controller.snapshot()!;
  host.action({type:'answer',key:'vocab-0',value:'My saved draft.'});
  host.tick(2500,true);
  const until=now.getTime()+minuteMs;
  host.setInPlaceBreak(until);
  host.tick(5000,true);
  assert.equal(host.running(),true);
  assert.equal(host.controller.snapshot()?.activeMs,2500);
  assert.equal(host.repository.read().course.activeSession.answers['vocab-0'],'My saved draft.');
  assert.equal(host.setInPlaceBreak(until+minuteMs).run?.payload.pauseUntil,until);
  host.setInPlaceBreak();
  assert.equal(host.controller.snapshot()?.payload.pauseUntil,undefined);
  host.setInPlaceBreak(until);

  now=new Date(until);
  host.tick(5000,true);
  assert.equal(host.controller.snapshot()?.payload.pauseUntil,undefined);
  assert.equal(host.controller.snapshot()?.id,run.id);
  assert.equal(host.controller.snapshot()?.activeMs,2500);
  host.tick(1000,true);
  assert.equal(host.controller.snapshot()?.activeMs,3500);
  host.release();
});

test('English timed pause is durable and resumes the same draft and clock',async t=>{
  const home=await mkdtemp(path.join(os.tmpdir(),'recall-english-pause-'));
  t.after(()=>rm(home,{recursive:true,force:true}));
  let now=new Date('2026-11-22T18:00:00Z');
  let host=new EnglishHost(home,()=>now);
  host.start();
  const original=host.controller.snapshot()!;
  host.action({type:'answer',key:'vocab-0',value:'The queue waits for the worker.'});
  host.tick(2000,true);
  const until=now.getTime()+englishPauseMinutes(undefined)*minuteMs;
  host.pause(until);
  host.tick(5000,true);
  assert.equal(host.running(),false);
  assert.equal(host.view().timedPauseUntil,until);

  now=new Date(until+1000);
  host=new EnglishHost(home,()=>now);
  host.recover();
  assert.deepEqual(host.controller.timedPause(),{runId:original.id,until});
  host.start('practice',false,undefined,'other-run');
  assert.equal(host.running(),false);
  host.start('practice',false,undefined,original.id);
  assert.equal(host.controller.snapshot()?.id,original.id);
  assert.equal(host.view().attempt?.answers['vocab-0'],'The queue waits for the worker.');
  assert.equal(host.controller.snapshot()?.activeMs,2000);
  assert.equal(host.view().timedPauseUntil,undefined);
  host.release();
});

test('English does not auto-resume yesterday’s pause into a new learning day',async t=>{
  const home=await mkdtemp(path.join(os.tmpdir(),'recall-english-pause-day-'));
  t.after(()=>rm(home,{recursive:true,force:true}));
  let now=new Date('2026-11-23T02:57:00Z');
  const host=new EnglishHost(home,()=>now);
  host.start();
  const original=host.controller.snapshot()!.id;
  host.pause(now.getTime()+10*minuteMs);
  now=new Date('2026-11-23T03:01:00Z');
  assert.equal(host.controller.timedPause(),null);
  host.start('practice',false,undefined,original);
  assert.equal(host.running(),false);
  assert.equal(host.view().run?.status,'paused');
  assert.equal(englishPauseMinutes(undefined),10);
  assert.equal(englishPauseMinutes(25),25);
  for(const value of [0,61,2.5,'10',null])assert.equal(validEnglishPauseMinutes(value),false);
});
