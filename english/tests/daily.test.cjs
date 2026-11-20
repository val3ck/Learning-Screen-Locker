'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../js/daily/course'),E=require('../js/daily/engine');
function fixture(legacy={}){const data={'linguo_app_state_v3':JSON.stringify(legacy)};let now=new Date(2026,10,14,19);const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v};const engine=new E.Engine(storage,()=>now);return{engine,storage,data,nextDay:()=>{now=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,19);}};}
function complete(engine){
  const s=engine.current()||engine.start();
  s.reviews.forEach((_,i)=>{engine.setAnswer(`review-${i}`,'My recalled answer.');engine.grade(`review-${i}`,true,{selfReported:true});});
  s.lesson.vocabulary.forEach((v,i)=>{engine.setAnswer(`vocab-${i}`,v.en);engine.checkText(`vocab-${i}`,v.en);});
  for(const key of ['vocab-example','retell']){engine.setAnswer(key,'Our team checks the project and asks for feedback.');engine.grade(key,true,{assisted:true});}
  for(const area of ['reading','listening','grammar']){const questions=area==='grammar'?s.lesson.grammar.exercises:s.lesson[area].questions;questions.forEach((q,i)=>{engine.setAnswer(`${area}-${i}`,String(q.correct));engine.checkChoice(`${area}-${i}`,q);});}
  s.listens=2;
  for(const key of ['monologue','turn-0','turn-1','turn-2','retry','writing'])engine.setAnswer(key,'We use this to solve a clear problem. One limitation still needs checking.');
  s.feedback={speaking:{source:'self',summary:'Checked',corrections:[]},writing:{source:'self',summary:'Checked',corrections:[]}};
  engine.grade('speaking-reflection',true,{assisted:true});s.lesson.writing.checklist.forEach((_,i)=>engine.grade(`writing-check-${i}`,true,{assisted:true}));
  if(s.lesson.guidedTasks)for(const area of ['vocabulary','reading','speaking','writing'])for(const task of s.lesson.guidedTasks[area]){engine.setAnswer(task.key,task.answer);engine.checkGuided(task.key);}
  // Synthetic AI assessments test controller transitions without external requests.
  if(s.lesson.productionMode==='ai-opinion-v1')for(const area of ['review','vocabulary','reading','speaking','writing']){const bundle=C.learning.assessmentBundle(s,area);engine.acceptAI({version:1,source:'ai',provider:'mock',model:'test',area,score:75,passed:true,checkedAt:new Date().toISOString(),snapshot:JSON.stringify(bundle.answers.map(a=>[a.key,a.text])),answers:bundle.answers.map(a=>({key:a.key,relevance:'on_task',scores:{task:3,grammar:3,vocabulary:3,clarity:3,coherence:3},score:75,passed:true,summary:'Controller fixture.',strengths:[],corrections:[],nextStep:'Keep practising.'}))});}
  for(const b of C.BLOCKS)assert.ok(engine.requirements(b.id),'missing '+b.id);
  s.blockIndex=7;return engine.finish();
}
test('84 complete, distinct lessons form twelve five-plus-two weeks',()=>{
  assert.equal(C.lessons.length,84);assert.equal(new Set(C.lessons.map(l=>l.id)).size,84);assert.equal(new Set(C.lessons.map(l=>l.reading.text)).size,84);
  for(let week=1;week<=12;week++){const group=C.lessons.filter(l=>l.week===week);assert.deepEqual(group.map(l=>l.type),['lesson','lesson','lesson','lesson','lesson','simulation','checkpoint']);assert.equal(group[5].newVocabulary,false);assert.equal(group[6].newVocabulary,false);const known=new Set(group.slice(0,5).flatMap(l=>l.vocabulary.map(v=>v.en)));for(const l of group.slice(5))for(const v of l.vocabulary)assert.ok(known.has(v.en));}
  for(const l of C.lessons){assert.equal(l.blocks.reduce((n,b)=>n+b.minutes,0),55);assert.equal(l.vocabulary.length,6);assert.ok(l.vocabulary.every(v=>v.en&&v.uk&&v.example.toLowerCase().includes(v.en.toLowerCase())));assert.ok(l.reading.text.split(/\s+/).length>=30);for(const q of l.reading.questions.slice(0,3))assert.ok(l.reading.text.toLowerCase().includes(q.options[q.correct].toLowerCase()));assert.equal(l.listening.dialogue.length,6);assert.equal(l.grammar.exercises.length,4);assert.equal(l.speaking.questions.length,3);assert.ok(l.writing.model);for(const q of [...l.reading.questions,...l.listening.questions,...l.grammar.exercises]){assert.ok(q.options[q.correct]);assert.ok(q.explanation);assert.equal(new Set(q.options).size,q.options.length);}for(const p of l.prerequisites)assert.ok(C.getLesson(p));}
});
test('migration preserves legacy progress but starts a completion-based streak',()=>{
  const {engine}=fixture({xp:300,streak:99,learnedWords:{old:{mastery:5}},completedMilestones:{m_1_1:true},apiKey:'must-not-export'});
  assert.equal(engine.state.legacy.xp,300);assert.equal(engine.streak(),0);assert.equal(engine.state.familiarWords[0].verified,false);assert.ok(!engine.exportProgress().includes('must-not-export'));assert.ok(engine.state.legacy.completedMilestones.m_1_1);
});
test('unfinished session and frozen material survive reload; idle and waiting do not count',()=>{
  const {engine,storage}=fixture(),s=engine.start();engine.setAnswer('monologue','A short valid answer.','voice');engine.tick(1000);engine.tick(1000,{waiting:true});engine.tick(1000,{visible:false});engine.pause(true);engine.tick(1000);engine.pause(false);engine.save();
  const restored=new E.Engine(storage);assert.equal(restored.start().id,s.id);assert.equal(restored.current().answers.monologue,'A short valid answer.');assert.equal(restored.current().sources.monologue,'voice');assert.deepEqual(restored.current().lesson,s.lesson);assert.equal(restored.current().activeMs,1000);
});
test('completion is idempotent; next course lesson opens on next local day',()=>{
  const f=fixture(),s=complete(f.engine);assert.equal(s.lessonId,'daily-001');assert.equal(f.engine.state.xp,100);assert.equal(f.engine.finish(),null);assert.equal(f.engine.start(),null);assert.equal(f.engine.streak(),1);f.nextDay();assert.equal(f.engine.start().lessonId,'daily-002');assert.ok(f.engine.current().reviews.length<=8);complete(f.engine);assert.equal(f.engine.streak(),2);assert.equal(f.engine.state.xp,200);
});
test('wrong or hinted answers remain assisted after correction and return tomorrow',()=>{
  const f=fixture(),s=f.engine.start();const v=s.lesson.vocabulary[0];f.engine.setAnswer('vocab-0','wrong');f.engine.checkText('vocab-0',v.en);f.engine.setAnswer('vocab-0',v.en);const result=f.engine.checkText('vocab-0',v.en);assert.equal(result.assisted,true);complete(f.engine);const item=f.engine.state.reviews['word-'+E.normal(v.en)+'--'+E.normal(v.uk)];assert.equal(item.unresolved,true);assert.equal(item.intervalIndex,0);assert.equal(item.dueDay,'2026-11-15');
});
test('review queue prioritises unresolved errors and remains capped after long absence',()=>{
  const state=E.defaultState();for(let i=0;i<40;i++)state.reviews['r'+i]={id:'r'+i,dueDay:'2026-01-01',unresolved:i===39};const selected=E.selectReviews(state,'2026-11-14');assert.equal(selected.length,8);assert.equal(selected[0].id,'r39');
});
test('guarded transitions require actual work; a short response is allowed',()=>{
  const {engine}=fixture();engine.start();assert.throws(()=>engine.advance());complete(engine);const last=engine.state.sessions[0];assert.ok(last.answers['turn-0'].split(' ').length<45);assert.equal(last.status,'completed');
});
test('export/import roundtrip retains drafts and does not mutate on invalid input',()=>{
  const f=fixture();f.engine.start();f.engine.setAnswer('writing','A draft');const snapshot=f.engine.exportProgress();const g=fixture();g.engine.importProgress(snapshot);assert.equal(g.engine.current().answers.writing,'A draft');const before=g.engine.exportProgress();assert.throws(()=>g.engine.importProgress('{"format":"other"}'));assert.equal(g.engine.exportProgress(),before);const bad=JSON.parse(snapshot);bad.state.activeSession.blockIndex=100;assert.throws(()=>g.engine.importProgress(bad));
});
test('export includes latest library progress, import restores it, and incomplete material is rejected',()=>{
  const f=fixture({xp:10});f.engine.start();f.storage.setItem('linguo_app_state_v3',JSON.stringify({xp:55,learnedWords:{newWord:{mastery:1}}}));const exported=f.engine.exportProgress();const g=fixture();g.engine.importProgress(exported);assert.equal(JSON.parse(g.storage.getItem('linguo_app_state_v3')).xp,55);assert.ok(g.engine.state.legacy.learnedWords.newWord);const broken=JSON.parse(exported);broken.state.activeSession.lesson.speaking.questions=null;assert.throws(()=>g.engine.importProgress(broken));
});
test('invalid feedback metrics cannot be imported as HTML or executable presentation',()=>{
  const f=fixture();f.engine.start();const data=JSON.parse(f.engine.exportProgress());data.state.activeSession.feedback.speaking={source:'ai',summary:'test',corrections:[],skills:{task:'<img src=x onerror=alert(1)>'}};assert.throws(()=>f.engine.importProgress(data));assert.equal(f.engine.current().feedback.speaking,undefined);
});
test('calendar uses Kyiv learning days from 05:00 and handles month/year boundaries',()=>{assert.equal(E.localDay(new Date('2026-11-14T02:30:00Z')),'2026-11-13');assert.equal(E.after('2026-12-31',1),'2027-01-01');assert.equal(E.after('2026-03-01',-1),'2026-02-28');});
test('editing a reviewed answer requires a fresh check and repeated checks do not inflate evidence',()=>{
  const f=fixture(),s=f.engine.start();f.engine.setAnswer('vocab-0',s.lesson.vocabulary[0].en);f.engine.checkText('vocab-0',s.lesson.vocabulary[0].en);const count=s.attempts.length;f.engine.checkText('vocab-0',s.lesson.vocabulary[0].en);assert.equal(s.attempts.length,count);
  s.feedback.writing={source:'self',summary:'Checked',corrections:[]};f.engine.grade('writing-check-0',true);f.engine.setAnswer('writing','A changed draft');assert.equal(s.feedback.writing,undefined);assert.equal(s.results['writing-check-0'],undefined);
});
test('whole 84-day cycle supports simulation, checkpoint, and maintenance',()=>{const f=fixture();for(let i=0;i<84;i++){const s=f.engine.start();assert.equal(s.lessonId,C.lessons[i].id);complete(f.engine);f.nextDay();}assert.equal(f.engine.nextLesson(),null);const practice=f.engine.start();assert.equal(practice.mode,'maintenance');complete(f.engine);assert.equal(f.engine.state.sessions.length,85);});
module.exports={fixture,complete};
