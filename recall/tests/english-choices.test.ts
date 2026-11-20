import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as Course from '../src/modules/english/vendor/course';
import examples from '../src/modules/english/vendor/examples';
import * as Learning from '../src/modules/english/vendor/learning';
import {EnglishController,newEnglishDocument} from '../src/modules/english/controller';
import type {EnglishLesson} from '../src/modules/english/types';
const C=Course as any,lessons=C.lessons as EnglishLesson[];
const questions=(l:EnglishLesson)=>[...l.reading.questions,...l.listening.questions,...l.grammar.exercises];
test('All 84 lessons have contextual choices and gradual A2 → B1 → B2 practice',()=>{
  assert.equal(lessons.length,84);const banned=/holiday destination|impressive name|ignore the symptoms|remove all checks|spelling of the project|every possible condition/i;
  let longest=0,total=0;
  for(const lesson of lessons){
    assert.equal(lesson.level,C.PROGRESSION[Math.floor((lesson.week-1)/3)].label);
    for(const q of questions(lesson)){assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.options[q.correct]);assert.ok(q.options.every(o=>!banned.test(o)));total++;longest+=Number(q.options[q.correct].length>Math.max(...q.options.filter((_,i)=>i!==q.correct).map(o=>o.length)));}
  }
  assert.ok(longest/total<0.7,'the longest answer must not reveal the key');
  assert.equal(lessons[0].writing.targetWords,'35–60');assert.equal(lessons[83].writing.targetWords,'150–200');assert.ok(lessons[70].reading.text.split(/\s+/).length>lessons[0].reading.text.split(/\s+/).length+100);assert.equal(lessons[0].reading.questions.length,3);assert.equal(lessons[70].reading.questions.length,4);
});
test('Order varies by attempt, has no run of three identical keys and remains reproducible',()=>{
  const patterns=new Set<string>(),counts=[0,0,0];
  for(let seed=0;seed<100;seed++)for(const source of lessons){const one=C.presentLesson(structuredClone(source),'attempt-'+seed),two=C.presentLesson(structuredClone(source),'attempt-'+seed);assert.deepEqual(one,two);const keys=questions(one).map(q=>q.correct);for(let i=2;i<keys.length;i++)assert.ok(!(keys[i]===keys[i-1]&&keys[i]===keys[i-2]));if(source.id==='daily-001')patterns.add(keys.join(','));for(const key of keys)counts[key]++;}
  assert.ok(patterns.size>70);const total=counts.reduce((n,v)=>n+v,0);for(const count of counts)assert.ok(count/total>0.28&&count/total<0.39);
});
test('Every distractor is rejected after the attempt has been shuffled',()=>{
  for(const lesson of lessons){const c=new EnglishController(newEnglishDocument(new Date('2026-11-14T17:00:00Z')),()=>new Date('2026-11-14T17:00:00Z'));c.start();c.document.course.activeSession!.lesson=C.presentLesson(structuredClone(lesson),lesson.id+'-verification');const current=c.document.course.activeSession!;
    for(const area of ['reading','listening','grammar'] as const)for(const [i,q]of(area==='grammar'?current.lesson.grammar.exercises:current.lesson[area].questions).entries())for(let option=0;option<q.options.length;option++){const key=area+'-'+i;c.dispatch({type:'answer',key,value:String(option)});c.dispatch({type:'check',key});assert.equal(current.results[key].correct,option===q.correct);}
  }
});
test('Updating an old frozen lesson preserves selected meanings, checks, text and time',()=>{
  const old=new EnglishController(newEnglishDocument(new Date('2026-11-14T17:00:00Z')),()=>new Date('2026-11-14T17:00:00Z'));old.start();const s=old.document.course.activeSession!;delete s.choicePresentationVersion;
  for(const area of ['reading','listening','grammar'] as const)for(const [i,q]of(area==='grammar'?s.lesson.grammar.exercises:s.lesson[area].questions).entries()){const answer=q.options[q.correct];q.options=[...q.options.filter((_,j)=>j!==q.correct),answer];q.correct=q.options.length-1;s.answers[area+'-'+i]=String(q.correct);s.results[area+'-'+i]={correct:true,assisted:false,at:'2026-11-14T17:00:00Z'};}
  s.lesson.reading.questions[0].options[0]='The team only needs a more impressive name for the tool.';s.answers.monologue='Keep my own answer.';s.answers['grammar-3']='';delete s.results['grammar-3'];
  for(let i=0;i<2;i++){const q=s.lesson.grammar.exercises[i],options=[...q.options.slice(1),q.options[0]];s.answers['exit-'+(i+3)]=String(options.indexOf(q.options[q.correct]));s.results['exit-'+(i+3)]={correct:true,assisted:false,at:'2026-11-14T17:00:00Z'};}
  old.document.days['2026-11-14'].activeMs=123456;const expected=new Map(questions(s.lesson).map(q=>[q.prompt,q.options[q.correct]])),beforeResults=structuredClone(s.results);
  const migrated=new EnglishController(old.document),current=migrated.document.course.activeSession!;assert.equal(current.choicePresentationVersion,2);assert.equal(current.answers.monologue,'Keep my own answer.');assert.equal(migrated.document.days['2026-11-14'].activeMs,123456);assert.equal(current.answers['grammar-3'],'');assert.deepEqual(current.results,beforeResults);
  for(const area of ['reading','listening','grammar'] as const)for(const [i,q]of(area==='grammar'?current.lesson.grammar.exercises:current.lesson[area].questions).entries()){if(current.answers[area+'-'+i]!=='')assert.equal(q.options[Number(current.answers[area+'-'+i])],expected.get(q.prompt));}
  for(let i=0;i<2;i++){const q=current.lesson.grammar.exercises[i],options=[...q.options.slice(1),q.options[0]];assert.equal(options[Number(current.answers['exit-'+(i+3)])],q.options[q.correct]);}
  assert.deepEqual(new EnglishController(migrated.document).document.course.activeSession,current);
});
test('Browser and desktop use exactly the same authored curriculum',async()=>{
  const context={module:{exports:{}},require:(name:string)=>{if(name==='./learning.js')return Learning;assert.equal(name,'./examples.js');return examples;}};vm.runInNewContext(await readFile(new URL('../integration/english-course.cjs',import.meta.url),'utf8'),context);assert.equal(JSON.stringify((context.module.exports as any).lessons),JSON.stringify(lessons));
});
