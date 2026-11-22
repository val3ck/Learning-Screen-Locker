import assert from 'node:assert/strict';
import test from 'node:test';
import * as Course from '../src/modules/english/vendor/course';
import * as Learning from '../src/modules/english/vendor/learning';
import {EnglishController,newEnglishDocument} from '../src/modules/english/controller';
import {renderAIBlock} from '../src/modules/english/ai-view';
import type {EnglishLesson} from '../src/modules/english/types';

const lessons:EnglishLesson[]=Course.lessons;

test('All 84 English lessons give one answer format, a form and a separate example for every grammar card',()=>{
  assert.equal(lessons.length,84);
  for(const lesson of lessons){
    assert.equal(lesson.grammar.exercises.length,4,lesson.id);
    assert.ok(lesson.grammar.context,lesson.id);
    for(const task of lesson.grammar.exercises){
      assert.ok(task.instruction&&task.openPrompt&&task.targetForm&&task.example,lesson.id);
      assert.match(task.instruction,/^Write one complete (question|sentence)\./,lesson.id);
      assert.equal(task.responseKind,/\bask\b/i.test(task.openPrompt)?'question':'sentence',lesson.id);
      assert.doesNotMatch(task.openPrompt,/Reference pattern|___|Task \d+/);
      assert.equal(task.example.endsWith('?'),task.responseKind==='question',lesson.id);
    }
  }
  const [past,current]=lessons[14].grammar.exercises;
  assert.match(past.targetForm||'',/Past Simple/);
  assert.match(current.targetForm||'',/Have or has/);
});

test('Refreshing an old grammar card keeps its answer, score and gap choices, and Luna gets the same task',()=>{
  const controller=new EnglishController(newEnglishDocument());
  controller.start();
  const attempt=controller.document.course.activeSession!;
  attempt.blockIndex=4;
  assert.equal(attempt.lesson.blocks[4].id,'grammar');
  attempt.answers['grammar-0']='The scheduler starts every morning.';
  attempt.results['grammar-0']={correct:true,assisted:false,at:'2026-11-18T19:00:00Z'};
  const old=attempt.lesson.grammar.exercises[0];
  const options=[...old.options],correct=old.correct;
  delete (attempt.lesson.grammar as any).productionVersion;
  old.openPrompt='Old conflicting task';
  const refreshed=new EnglishController(structuredClone(controller.document));
  const view=refreshed.view(),saved=view.attempt!;
  const task=saved.lesson.grammar.exercises[0];
  assert.equal(saved.answers['grammar-0'],attempt.answers['grammar-0']);
  assert.deepEqual(saved.results['grammar-0'],attempt.results['grammar-0']);
  assert.deepEqual(task.options,options);
  assert.equal(task.correct,correct);
  const request=(Learning as any).areaItems(saved,'grammar')[0];
  assert.ok(task.openPrompt&&task.targetForm);
  assert.ok(request.task.includes(task.openPrompt));
  assert.ok(request.task.includes(task.targetForm));
  assert.equal(request.options,undefined);
  const html=renderAIBlock(view,'');
  assert.ok(html.includes(task.openPrompt!));
  assert.ok(html.includes('Use this form'));
  assert.ok(html.includes('1 question'));
  assert.ok(!html.includes('Old conflicting task'));
});
