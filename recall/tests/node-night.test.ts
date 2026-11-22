import test from 'node:test';
import assert from 'node:assert/strict';
import {
  invitationNight, NIGHT_LIMIT, nightLessonGoal, reviewNightProgress, type NightRun, type NightStep,
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

test('a 60-minute session follows one lesson, with one lecture and two checked criteria', () => {
  const lecture: NightStep={id:'lesson/lecture',lessonId:'lesson',lesson:'A lesson',module:'Module',
    section:'lecture',minutes:10,title:'Lecture',criteriaDone:0,criteriaTotal:3,criteriaRequired:2,lessonsDone:0,lessonsTotal:2};
  const run: NightRun={id:'night',night:'2026-11-18',startedAt:0,deadline:NIGHT_LIMIT,steps:[lecture],passed:[]};
  assert.equal(run.deadline,60*60_000);
  const course={candidate:null,completed:[lecture.id,'lesson/practice/0','other/check','lesson/practice/2'],completedModules:0,totalModules:19,
    lessonCounts:{lesson:{criteriaDone:2,lessonsDone:0}}};
  assert.deepEqual(nightLessonGoal(run,course),{lectureRead:true,criteriaDone:2,criteriaRequired:2,lessonDone:false});
  reviewNightProgress(run,course);
  reviewNightProgress(run,course);
  assert.deepEqual(run.passed,[lecture.id,'lesson/practice/0','lesson/practice/2']);
  const finished={...course,completed:[...course.completed,'lesson/check']};
  reviewNightProgress(run,finished);
  assert.equal(nightLessonGoal(run,finished).lessonDone,true);
  assert.equal(run.passed.at(-1),'lesson/check');
});
