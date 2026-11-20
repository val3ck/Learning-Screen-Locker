import * as Learning from '../src/modules/english/vendor/learning';
import P from '../integration/english-ai-prompts.cjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {EnglishController,newEnglishDocument,validateEnglishDocument,importEnglishCourse,ENGLISH_TARGET_MS} from '../src/modules/english/controller';
import * as Course from '../src/modules/english/vendor/course';
import {FocusClock} from '../src/core/learning';
import {kyivDayKey} from '../src/core/calendar';
import {eveningSchedule,tickEvening,snoozeEvening} from '../src/core/evening';
import {hasFinishedToday} from '../src/core/scheduler';
import type {SessionRecord} from '../src/core/contracts';
import type {EnglishLesson} from '../src/modules/english/types';
const at=(hour=19,minute=0)=>new Date(Date.UTC(2026,10,14,hour-2,minute));
function fixture(){let date=at();const c=new EnglishController(newEnglishDocument(date),()=>new Date(date));c.start();return {c,nextDay(){date=new Date(date.getTime()+86400000);}};}
function answer(c:EnglishController,key:string,value:string){c.dispatch({type:'answer',key,value});}
function self(c:EnglishController,key:string){c.dispatch({type:'self',key,flag:true});}
function assess(c:EnglishController,area:string){const s=c.document.course.activeSession!,b=P.context(s.lesson,area,c.assessmentBundle(area).answers),raw={answers:b.answers.map((a:any)=>({key:a.key,relevance:'on_task',scores:{task:3,grammar:3,vocabulary:3,clarity:3,coherence:3},summary:'Test estimate.',strengths:[],corrections:[],nextStep:'Give another reason.'}))};c.acceptAI({...P.validateGrade(raw,b),provider:'mock',model:'test'});}

function completeLesson(c:EnglishController){
  let v=c.view();for(let i=0;i<v.attempt!.reviews.length;i++)answer(c,'review-'+i,'I explain this idea using a situation from my own work.');assess(c,'review');c.dispatch({type:'advance'});
  for(const [i,word]of v.lesson.vocabulary.entries())answer(c,'vocab-'+i,word.example);assess(c,'vocabulary');c.dispatch({type:'advance'});
  for(const area of ['reading','listening'] as const){for(const [i,q]of v.lesson[area].questions.entries()){answer(c,area+'-'+i,String(q.correct));c.dispatch({type:'check',key:area+'-'+i});}if(area==='reading'){answer(c,'retell','I would explain the problem and propose a change while acknowledging a limitation.');assess(c,'reading');}else c.dispatch({type:'audio-unavailable'});c.dispatch({type:'advance'});}
  c.dispatch({type:'skip-break'});for(const [i,q]of v.lesson.grammar.exercises.entries()){answer(c,'grammar-'+i,String(q.correct));c.dispatch({type:'check',key:'grammar-'+i});}c.dispatch({type:'advance'});
  for(const key of ['monologue','turn-0','turn-1','turn-2','retry'])answer(c,key,'My view is that understanding the users helps us choose a useful next step.');assess(c,'speaking');c.dispatch({type:'advance'});
  answer(c,'writing','I prefer a clear explanation of the user problem because it gives the work a purpose.');assess(c,'writing');c.dispatch({type:'advance'});
  assert.equal(c.view().canCompleteLesson,true);c.dispatch({type:'complete-lesson'});
}
function credit(c:EnglishController,ms:number,active=true){for(let left=ms;left>0;left-=5000)c.tick(Math.min(left,5000),{active});}
test('English: усі 84 уроки проходять контролер і закріплення без SQL або API',()=>{
  assert.equal(Course.lessons.length,84);
  for(const lesson of Course.lessons as unknown as EnglishLesson[]){const {c}=fixture();const s=c.document.course.activeSession!;s.lesson=structuredClone(lesson);s.lessonId=s.lesson.id;c.snapshot()!.payload.lessonId=s.lessonId;
    const hydrated=new EnglishController(c.document,()=>at());completeLesson(hydrated);assert.equal(hydrated.document.course.sessions.length,1);assert.equal(hydrated.document.course.xp,100);assert.equal(hydrated.snapshot()!.payload.phase,'reinforcement');assert.equal(hydrated.document.course.sessions[0].listeningUnavailable,true);
    assert.throws(()=>hydrated.finish('completed'));validateEnglishDocument(hydrated.document);
  }
});
test('English: own answers require AI assessment; self-report cannot bypass it',()=>{const {c}=fixture();c.document.course.activeSession!.blockIndex=6;answer(c,'writing','My own reasoned opinion.');assert.throws(()=>c.dispatch({type:'advance'}));assert.throws(()=>self(c,'writing-check-0'));assess(c,'writing');assert.equal(c.view().canAdvance,true);answer(c,'writing','Edited opinion.');assert.equal(c.view().canAdvance,false);});

test('English: швидкий урок продовжується до 55 хв; перерва та неактивність не додають часу',()=>{
  const {c}=fixture();completeLesson(c);credit(c,35*60000);assert.equal(c.view().day.activeMs,35*60000);assert.equal(c.snapshot()!.status,'active');assert.throws(()=>c.finish('completed'));
  const xp=c.document.course.xp;credit(c,10*60000,false);assert.equal(c.view().day.activeMs,35*60000);credit(c,20*60000);assert.equal(c.snapshot()!.status,'completed');assert.equal(c.view().day.fulfilled,true);assert.equal(c.document.course.xp,xp);
  const paused=fixture().c;paused.snapshot()!.payload.phase='break';paused.snapshot()!.payload.breakRemainingMs=300000;credit(paused,300000);assert.equal(paused.day().activeMs,0);assert.equal(paused.snapshot()!.payload.phase,'lesson');
});
test('English: здача після 15 хв і частковий урок після 55 зберігаються на наступний день',()=>{
  const first=fixture();answer(first.c,'review-0','Saved answer');credit(first.c,15*60000-1);assert.throws(()=>first.c.finish('surrendered'));credit(first.c,1);first.c.finish('surrendered');assert.equal(first.c.day().dismissed,true);first.nextDay();first.c.start();assert.equal(first.c.day().activeMs,0);assert.equal(first.c.view().attempt!.answers['review-0'],'Saved answer');
  const second=fixture();answer(second.c,'review-0','Keep this draft');credit(second.c,ENGLISH_TARGET_MS);assert.equal(second.c.snapshot()!.status,'partial');assert.equal(second.c.document.course.sessions.length,0);second.nextDay();second.c.start();assert.equal(second.c.view().attempt!.answers['review-0'],'Keep this draft');assert.equal(second.c.day().activeMs,0);
});
test('English: календар Києва 05:00 і монотонний годинник не зараховують сон',()=>{
  assert.equal(kyivDayKey(new Date('2026-11-15T02:59:00Z')),'2026-11-14');assert.equal(kyivDayKey(new Date('2026-11-15T03:00:00Z')),'2026-11-15');
  const clock=new FocusClock();assert.equal(clock.sample(1000,true),0);assert.equal(clock.sample(2000,true),1000);assert.equal(clock.sample(9999999,true),0);assert.equal(clock.sample(10000999,false),0);assert.equal(clock.sample(10001999,true),1000);
});
test('English: о 05:00 поточна сесія завершується частково, без нової примусової години',()=>{
  let now=new Date('2026-11-15T02:59:00Z');const c=new EnglishController(newEnglishDocument(now),()=>new Date(now));c.start();credit(c,30000);now=new Date('2026-11-15T03:00:00Z');c.tick(1000,{active:true});assert.equal(c.snapshot()!.status,'partial');assert.equal(c.document.days['2026-11-14'].activeMs,30000);assert.equal(c.day().activeMs,0);assert.equal(c.document.course.activeSession!.paused,true);
});
test('English: запрошення о 19:00, 30 хв відкладення, після 23:00 автоматичного старту немає',()=>{
  const input={active:true,busy:false,enabledAfterDay:'2026-11-13',done:false,warningVisible:false};let state=eveningSchedule(at(18,59));
  assert.equal(tickEvening(state,{...input,now:at(18,59)}).action,'none');let result=tickEvening(state,{...input,now:at(19)});assert.equal(result.action,'warn');state=result.state;
  for(let i=1;i<=120;i++){result=tickEvening(state,{...input,now:new Date(at(19).getTime()+i*1000),warningVisible:true});state=result.state;}assert.equal(result.action,'start');
  state=snoozeEvening(eveningSchedule(at(22,50)),at(22,50));result=tickEvening(state,{...input,now:at(23,20)});assert.equal(result.action,'warn');assert.equal(result.optional,true);state=result.state;
  for(let i=1;i<150;i++){result=tickEvening(state,{...input,now:new Date(at(23,20).getTime()+i*1000),warningVisible:true});state=result.state;assert.notEqual(result.action,'start');}
  assert.equal(tickEvening(eveningSchedule(at(19)),{...input,now:at(19),busy:true}).action,'none');assert.equal(tickEvening(eveningSchedule(at(19)),{...input,now:at(19),done:true}).action,'none');
});
test('English не скасовує SQL; однаковий день обліковується за moduleId',()=>{
  const now=new Date(2026,10,14,19),session={moduleId:'english',mode:'practice',outcome:'completed',dayKey:'2026-11-14',endedAt:now.toISOString()} as SessionRecord;
  assert.equal(hasFinishedToday([session],now,'postgresql'),false);assert.equal(hasFinishedToday([session],now,'english'),true);
});
test('English: імпорт активного уроку зараховує вже відпрацьований час цього дня',()=>{const {c}=fixture();credit(c,10*60000);const imported=importEnglishCourse({format:'english-daily-progress',state:c.document.course},at());assert.equal(imported.days[kyivDayKey(at())].activeMs,10*60000);assert.ok(imported.course.activeSession);});
test('English: останні символи на межі бюджету зберігаються без додаткового часу',()=>{const {c}=fixture();credit(c,ENGLISH_TARGET_MS);answer(c,'review-0','Last input before the summary.');assert.equal(c.document.course.activeSession!.answers['review-0'],'Last input before the summary.');assert.equal(c.day().activeMs,ENGLISH_TARGET_MS);assert.equal(c.document.course.sessions.length,0);});
test('English: старі слова не перетворюються на пройдені уроки або API-ключі',()=>{const doc=importEnglishCourse({xp:300,learnedWords:{old:{mastery:5}},apiKey:'must-not-copy'},at());assert.equal(doc.course.familiarWords.length,1);assert.equal(doc.course.sessions.length,0);assert.ok(!JSON.stringify(doc).includes('must-not-copy'));});
