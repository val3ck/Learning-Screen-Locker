import test from 'node:test';
import assert from 'node:assert/strict';
import {
  invitationNight, NIGHT_LIMIT, nextNightStep, reviewNightProgress, type NightRun, type NightStep,
} from '../src/core/node-night';

test('22:59 in Kyiv starts one night key through midnight and ends at 00:40', () => {
  for (const [utc,key] of [
    ['2026-11-18T20:58:59Z',null], ['2026-11-18T20:59:00Z','2026-11-18'],
    ['2026-11-18T22:00:00Z','2026-11-18'], ['2026-11-18T22:39:59Z','2026-11-18'],
    ['2026-11-18T22:40:00Z',null], ['2026-07-01T19:59:00Z','2026-07-01'],
    ['2027-01-01T22:05:00Z','2027-01-01'],
  ] as const) assert.equal(invitationNight(new Date(utc)),key,utc);
  assert.equal(invitationNight(new Date('2026-12-31T22:35:00Z')),'2026-12-31');
});

test('night steps wait for original site progress, respect the 40-minute budget and stop at three', () => {
  const lecture: NightStep={id:'lesson/lecture',lessonId:'lesson',lesson:'A lesson',module:'Module',
    section:'lecture',minutes:10,title:'Lecture',criteriaDone:0,criteriaTotal:2,lessonsDone:0,lessonsTotal:2};
  const practice: NightStep={...lecture,id:'lesson/practice/0',section:'practice',minutes:20,title:'First criterion'};
  const check: NightStep={...lecture,id:'lesson/check',section:'check',minutes:5,title:'Check'};
  const run: NightRun={id:'night',night:'2026-11-18',startedAt:0,deadline:NIGHT_LIMIT,steps:[lecture],passed:[]};
  const course={candidate:practice,completed:[lecture.id],completedModules:0,totalModules:19};
  assert.equal(nextNightStep(run,course,1),null);
  reviewNightProgress(run,course);
  reviewNightProgress(run,course);
  assert.deepEqual(run.passed,[lecture.id]);
  assert.equal(nextNightStep(run,course,15*60_000)?.id,practice.id);
  assert.equal(nextNightStep(run,course,15*60_000+1),null);
  run.steps.push(practice);
  reviewNightProgress(run,{...course,completed:[lecture.id,practice.id]});
  assert.equal(nextNightStep(run,{...course,candidate:check},30*60_000)?.id,check.id);
  run.steps.push(check);
  reviewNightProgress(run,{...course,completed:[lecture.id,practice.id,check.id]});
  assert.equal(nextNightStep(run,{...course,candidate:{...check,id:'another'}},30*60_000),null);
});
