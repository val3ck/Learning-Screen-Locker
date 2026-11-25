import type {EnglishLesson,EnglishPractice} from '../src/modules/english/types';
import test from 'node:test';import assert from 'node:assert/strict';import {EnglishController,newEnglishDocument} from '../src/modules/english/controller';import * as Course from '../src/modules/english/vendor/course';import * as L from '../src/modules/english/vendor/learning';import Language from '../integration/english-language.cjs';import {practiceTask,practiceMessage} from '../src/modules/english/practice';
import {answerCorrections,renderCheckedText} from '../src/modules/english/correction-highlights';
import CorrectionPolicy from '../integration/english-correction-policy.cjs';

test('English feedback highlights the checked words and keeps an anchored repeated quote precise',()=>{
  const source='We are getting ready. We may work longer and getting fewer results, without forgetting about tests. <em>Keep my draft.</em>';
  const correction={kind:'error' as const,original:'work longer and getting fewer results',replacement:'work longer and get fewer results',explanation:'Use parallel verb forms.'};
  const stored=JSON.parse(JSON.stringify(CorrectionPolicy.focusedCorrections([correction],source)));
  const corrections=answerCorrections(source,stored);
  assert.equal(corrections[0].original,'getting');
  assert.deepEqual(corrections[0].ranges.map(r=>r.start),[source.lastIndexOf('getting fewer')]);
  const html=renderCheckedText(source,corrections);
  assert.match(html,/are getting ready/);
  assert.match(html,/and <mark [^>]+>getting<\/mark> fewer/);
  assert.match(html,/&lt;em&gt;Keep my draft/);
  const legacy=answerCorrections(source,[{...correction,original:'getting',replacement:'get'}]);
  assert.deepEqual(legacy[0].ranges.map(r=>r.start),[source.indexOf('getting'),source.indexOf('getting fewer')]);
});
test('Every lesson has English learning instructions and concrete vocabulary clues',()=>{for(const l of (Course as any).lessons){for(const text of [l.mission,l.title,l.reading.retell,l.grammar.title,l.grammar.explanation,l.speaking.retry,...l.writing.checklist])assert.ok(!/[\u0400-\u04ff]/.test(text));for(const w of l.vocabulary){const task=(L as any).wordTask(w);assert.ok(task.clue&&!/[\u0400-\u04ff]/.test(task.clue));assert.equal(task.answer,w.en);assert.ok(task.instruction.includes('ONE'));}}});
test('The reported sentence gets precise local course corrections',()=>{const matches=Language.courseMatches('Our project help patient book appointment.');assert.equal(matches.length,3);assert.ok(matches.some((m:any)=>m.replacements.includes('helps')));assert.equal(Language.courseMatches('Our project helps patients book appointments.').length,0);assert.equal(Language.courseMatches('Does our project help patients book appointments?').length,0);});
test('Open wording check is invalidated when text changes; no semantic mastery is invented',()=>{const c=new EnglishController(newEnglishDocument());c.start();const text='Our project helps the user book an appointment.';c.dispatch({type:'answer',key:'vocab-example',value:text});c.acceptLanguageCheck('vocab-example',{version:1,source:'local-rules',engine:'test',text,matches:[],checkedAt:new Date().toISOString(),reviewed:true,ignored:false});assert.equal(c.view().attempt!.results['vocab-example'].scope,'wording');assert.equal(c.view().attempt!.results['vocab-example'].assisted,true);c.dispatch({type:'answer',key:'vocab-example',value:'Changed text.'});assert.equal(c.view().attempt!.languageChecks?.['vocab-example'],undefined);assert.equal(c.view().attempt!.results['vocab-example'],undefined);});
test('Extra practice offers each word and grammar sentence once before the deck ends in all 84 lessons',()=>{
 const {course}=newEnglishDocument();
 for(const lesson of Course.lessons as unknown as EnglishLesson[]){
  const history:EnglishPractice[]=[];
  const words=new Set<string>(),sentences=new Set<string>();
  for(let index=0;index<12;index++){
   const item=practiceTask(lesson,undefined,course,index,history);
   if(!item)break;
   if(item.kind==='word'){
    assert.ok(item.clue);assert.ok(!words.has(item.answer),lesson.id);words.add(item.answer);
    item.value='build\nteam\nresponsible for';assert.match(practiceMessage(item,false),/ONE/);
   }else{
    if(item.kind==='choice')assert.equal(item.options?.[item.correct!],item.answer);
    else assert.notEqual(item.prompt,item.answer);
    const sentence=item.kind==='choice'?item.prompt.replace(/_{3,}/,()=>item.answer):item.answer;
    assert.ok(!sentences.has(sentence),lesson.id);sentences.add(sentence);
    assert.ok(!lesson.grammar.exercises.some(q=>q.prompt.endsWith(item.prompt)),lesson.id);
   }
   history.push(item);
  }
  assert.equal(words.size,new Set(lesson.vocabulary.map(v=>v.en)).size,lesson.id);
  assert.equal(sentences.size,4,lesson.id);
  assert.equal(practiceTask(lesson,undefined,course,history.length,history),null);
 }
});

test('An old choice or written correction blocks the same sentence in another format',()=>{
 const {course}=newEnglishDocument();
 const lesson=Course.lessons[0] as unknown as EnglishLesson;
 const used=practiceTask(lesson,undefined,course,1,[])!;
 assert.equal(used.kind,'choice');
 const repair={...used,kind:'sentence' as const,answer:used.prompt.replace(/_{3,}/,()=>used.answer)};
 const next=practiceTask(lesson,undefined,course,2,[{...used,presentationVersion:2}])!;
 assert.notEqual(next.answer,repair.answer);
 assert.equal(practiceTask(lesson,undefined,course,2,[repair])?.answer,next.answer);
});
