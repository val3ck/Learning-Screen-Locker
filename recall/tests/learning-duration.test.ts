import assert from 'node:assert/strict';
import test from 'node:test';
import {LEARNING_TRACKS,minuteMs,trackDuration,validDurations} from '../src/core/tracks';
import {canSurrender} from '../src/core/session';
import type {SessionRecord} from '../src/core/contracts';
import {EnglishController,newEnglishDocument,validateEnglishDocument} from '../src/modules/english/controller';

test('Learning tracks have independent defaults and validate whole-minute settings',()=>{
  assert.deepEqual(LEARNING_TRACKS.map(({id})=>trackDuration(id)),[15,55,60,20,20]);
  const configured={postgresql:12,english:75,nodejs:25};
  assert.equal(validDurations(configured),true);
  assert.deepEqual(LEARNING_TRACKS.map(({id})=>trackDuration(id,configured)),[12,75,25,20,20]);
  assert.equal(trackDuration('postgresql',{english:75}),15);
  for(const invalid of [{postgresql:0},{nodejs:121},{english:'55'},{english:30.5},{unknown:40},[]]){
    assert.equal(validDurations(invalid),false);
  }
});

test('SQL saving and exit use the duration recorded for that session',()=>{
  const session={activeMs:12*minuteMs-1,durationMinutes:12} as SessionRecord;
  assert.equal(canSurrender(session),false);
  session.activeMs++;
  assert.equal(canSurrender(session),true);
  delete session.durationMinutes;
  assert.equal(canSurrender(session),false);
  session.activeMs=15*minuteMs;
  assert.equal(canSurrender(session),true);
});

test('English applies the setting to new sessions and preserves the ongoing budget across restart',()=>{
  let now=new Date('2026-11-21T17:30:00Z'),configured=75;
  const first=new EnglishController(newEnglishDocument(now),()=>now,()=>configured);
  first.start();
  assert.equal(first.view().targetMs,75*minuteMs);
  first.day().activeMs=60*minuteMs;
  first.dispatch({type:'answer',key:'review-0',value:'My saved answer.'});
  first.pause();
  configured=35;
  const resumed=new EnglishController(validateEnglishDocument(first.document),()=>now,()=>configured);
  resumed.start();
  assert.equal(resumed.view().targetMs,75*minuteMs);
  assert.equal(resumed.snapshot()?.payload.overtimeBlock,undefined);
  resumed.day().activeMs=75*minuteMs-1000;
  resumed.tick(1000,{active:true});
  assert.equal(resumed.snapshot()?.payload.overtimeBlock,0);
  resumed.dispatch({type:'save-and-exit'});
  now=new Date(now.getTime()+24*60*minuteMs);
  resumed.start();
  assert.equal(resumed.view().targetMs,35*minuteMs);
  assert.equal(resumed.view().attempt?.answers['review-0'],'My saved answer.');
});
