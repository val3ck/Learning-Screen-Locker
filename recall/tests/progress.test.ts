import test from 'node:test';
import assert from 'node:assert/strict';
import {parseProgress,SOURCE_VERSION} from '../src/modules/postgresql/progress';
import {generateTasks} from '../src/modules/postgresql/templates';
const parse=(completed:number[],extra={})=>parseProgress({completed,index:14,drafts:{},...extra});
test('Відкритий JOIN і freeExplore не підтверджують JOIN',()=>{
  const p=parse([0,1,2,3,4,10,11,12],{index:14,freeExplore:true,unlockedThrough:50});assert.ok(!p.confirmedTopicIds.includes('joins'));assert.ok(p.confirmedTopicIds.includes('having'));
});
test('Проєкти підтверджують конкретні навички, не весь розділ',()=>{
  const p=parse([37]);assert.ok(p.confirmedTopicIds.includes('nulls'));assert.ok(p.practiceTopicIds.includes('ordering'));assert.ok(!p.confirmedTopicIds.includes('patterns'));assert.ok(!p.confirmedTopicIds.includes('joins'));
  const checkpoint=parse([52]);assert.ok(checkpoint.confirmedTopicIds.includes('having'));assert.ok(!checkpoint.confirmedTopicIds.includes('joins'));
  assert.deepEqual(parse([45,46,51]).confirmedTopicIds,[]);
});
test('Пошкоджений або несумісний прогрес відхиляється',()=>{
  for(const value of [null,{}, {completed:[-1],index:0,drafts:{}},{version:2,completed:[]},{version:1,catalogVersion:'bad',completed:[0]}])assert.throws(()=>parseProgress(value));
  assert.ok(parseProgress({version:1,catalogVersion:SOURCE_VERSION,completed:[0]}).confirmedTopicIds.includes('select'));
});
test('Кожна згенерована вправа використовує лише підтверджені навички',()=>{
  for(const completed of [[0],[0,1,2,3],[37],[0,1,2,3,4,10,11,12]]){
    const p=parse(completed);const context={confirmedTopicIds:p.confirmedTopicIds,history:{},sessions:[],now:new Date().toISOString(),seed:42};
    const tasks=generateTasks(context);assert.equal(tasks.length,3);for(const t of tasks)assert.ok(t.topicIds.every(id=>p.confirmedTopicIds.includes(id)),t.templateId);
    assert.deepEqual(generateTasks(context),tasks);
  }
});
