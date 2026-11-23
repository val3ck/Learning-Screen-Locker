import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons, prerequisitesFor } from '../src/content/catalog';
import { buildSession } from '../src/lib/session';
import { canComplete, completeLesson, dueReviews, freshProgress, getLessonProgress, isComplete, isUnlocked, parseProgress, reviewLesson, updateLesson } from '../src/lib/progress';

test('a lecture, two practice checks and a passing code review complete the lesson', () => {
  const first = lessons[0], second = lessons[1];
  assert.equal(isUnlocked(freshProgress(), first), true);
  assert.deepEqual(prerequisitesFor(second), [first.id]);
  assert.equal(isUnlocked(freshProgress(), second), false);
  let progress = freshProgress();
  progress = updateLesson(progress, first.id, {checks: [0, first.criteria.length-1]});
  assert.equal(canComplete(progress, first), false);
  progress = updateLesson(progress, first.id, {read:true,checks:[0],quizPassed:true});
  assert.equal(canComplete(progress, first), false);
  progress = updateLesson(progress, first.id, {read:true,checks:[0,first.criteria.length-1],quizPassed:false});
  assert.equal(canComplete(progress, first), false);
  const checkedAt = '2026-11-11T11:00:00.000Z';
  progress = updateLesson(progress, first.id, {codeReview:{score:69,checkedAt}});
  assert.equal(canComplete(progress, first), false);
  progress = updateLesson(progress, first.id, {codeReview:{score:70,checkedAt}});
  assert.equal(canComplete(progress, first), true);
  progress = completeLesson(progress, first, new Date('2026-11-11T12:00:00Z'));
  assert.deepEqual(parseProgress(progress),progress);
  assert.equal(isComplete(progress, first.id), true);
  assert.equal(isUnlocked(progress, second), true);
  assert.equal(getLessonProgress(progress, first.id).nextReviewAt, '2026-11-12T12:00:00.000Z');
});
test('review increases interval and a forgotten lesson returns soon', () => {
  const lesson = lessons[0]; let p = updateLesson(freshProgress(), lesson.id, {
    read:true, checks:[0,1], codeReview:{score:80,checkedAt:'2026-11-10T23:00:00.000Z'},
  });
  p = completeLesson(p, lesson, new Date('2026-11-11T00:00:00Z'));
  assert.deepEqual(dueReviews(p, new Date('2026-11-12T00:00:00Z')).map(x => x.id), [lesson.id]);
  p = reviewLesson(p, lesson.id, true, new Date('2026-11-12T00:00:00Z'));
  assert.equal(getLessonProgress(p, lesson.id).nextReviewAt, '2026-11-15T00:00:00.000Z');
  p = reviewLesson(p, lesson.id, false, new Date('2026-11-12T01:00:00Z'));
  assert.equal(getLessonProgress(p, lesson.id).nextReviewAt, '2026-11-12T05:00:00.000Z');
});
test('progress import validates evidence and round-trips notes', () => {
  const l = lessons[0]; let p = updateLesson(freshProgress(), l.id, { notes: 'Моє пояснення', checks: [0], step: 'practice' });
  assert.deepEqual(parseProgress(JSON.parse(JSON.stringify(p))), p);
  p = updateLesson(p, l.id, { completedAt: '2026-11-11T00:00:00Z' });
  assert.throws(() => parseProgress(p), /неповну перевірку/);
  const unknown = { ...freshProgress(), lessons: { ghost: getLessonProgress(p, l.id) } };
  assert.throws(() => parseProgress(unknown), /Невідомий урок/);
  const legacy = updateLesson(p,l.id,{read:false,quizPassed:true,checks:l.criteria.map((_,i)=>i)});
  assert.deepEqual(parseProgress(legacy),legacy);
});
test('session fits requested duration and points to available lesson', () => {
  for (const minutes of [60, 90, 120] as const) {
    const plan = buildSession(freshProgress(), minutes);
    assert.equal(plan.reduce((sum, item) => sum + item.minutes, 0), minutes);
    assert.equal(plan[0].lessonId, lessons[0].id);
    assert.ok(plan.some(item => item.kind === 'practice'));
  }
});
