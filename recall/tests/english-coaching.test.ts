import * as Course from '../src/modules/english/vendor/course';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import AI from '../integration/english-ai.cjs';import P from '../integration/english-ai-prompts.cjs';import Coaching from '../integration/english-coaching.cjs';import Translation from '../integration/english-translation.cjs';
import {EnglishController,newEnglishDocument} from '../src/modules/english/controller';import {renderAIBlock} from '../src/modules/english/ai-view';import {scoreTone} from '../src/modules/english/answer-enhancements';
import {sentenceContext} from '../src/modules/english/translator-view';
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'recall-coaching-'));
const feedback=(b:any)=>({answers:b.answers.map((a:any)=>({key:a.key,relevance:'on_task',scores:{task:4,grammar:3,vocabulary:3,clarity:3,coherence:3},summary:'The main point is clear.',strengths:['A relevant idea is explained.'],conclusion:{skill:'maintain',focus:'Збережи зрозумілу думку.',rule:'Пояснюй одну ідею за раз.',example:'This change saves time.',practice:'Name one useful change.',solution:'Any relevant change.'},corrections:[],nextStep:'Keep one clear main point.'})),blockOverview:{summary:'Головні думки розділу зрозумілі.',strengths:[{text:'Ти формулюєш власні думки.',answerKeys:b.blockContext.map((a:any)=>a.key)}],weaknesses:[],nextStep:'Спробуй новий контекст.'}});
test('Tutor receives the actual reading, exact task, latest saved draft and a correctly labelled previous score',()=>{
 const c=new EnglishController(newEnglishDocument());c.start();const s:any=c.document.course.activeSession;s.blockIndex=2;c.dispatch({type:'answer',key:'retell',value:'I think the team should name an owner.'});const raw=P.context(s.lesson,'reading',[{key:'retell',task:s.lesson.reading.retell,text:s.answers.retell}]);s.aiAssessments={reading:{checkedAt:new Date().toISOString(),snapshot:JSON.stringify([['retell','The old draft.']]),answers:[{key:'retell',score:65,passed:true,scores:{grammar:2},summary:'Earlier feedback.',corrections:[],nextStep:'Check agreement.'}]}};
 const b=Coaching.tutorContext(raw,s,undefined),prompt=JSON.parse(P.helpPrompt(b,'Explain the phrase in this reading.').user);assert.equal(P.locationHelp(b,"What does 'approve requirements' mean in this passage?"),null);assert.equal(prompt.coaching.materials.text,s.lesson.reading.text);assert.equal(prompt.coaching.currentDraft,s.answers.retell);assert.equal(prompt.coaching.feedback.score,65);assert.equal(prompt.coaching.feedback.appliesToCurrentDraft,false);assert.equal(prompt.coaching.lastCheckedDraft,'The old draft.');assert.ok(!JSON.stringify(prompt).includes(s.lesson.writing.model));
 assert.ok(P.validateHint({clarification:'In “I think”, you introduce your opinion.',hint:'Separate your view from the facts in the passage.',nextStep:'Choose one fact to explain.'},b));assert.throws(()=>P.validateHint({clarification:'I would explain the project like this.',hint:'Copy this.',nextStep:'Use it.'},b));assert.throws(()=>Coaching.tutorContext(raw,s,'not-a-task'));
});
test('Luna gets the chosen task’s pass status and real blockers even when another answer was edited last',()=>{
 const c=new EnglishController(newEnglishDocument());c.start();const s:any=c.document.course.activeSession;
 const answers=[{key:'vocab-0',task:'Use estimate as a verb.',text:'The developers estimate their work.'},{key:'vocab-1',task:'Use priorities and explain how the team chooses work.',text:'They have some priorities.'}];
 s.lastAnswerKey='vocab-0';
 s.aiAssessments={vocabulary:{snapshot:JSON.stringify(answers.map(a=>[a.key,a.text])),answers:[
  {key:'vocab-0',score:85,passed:true,relevance:'on_task',scores:{task:4},summary:'Uses the target verb.'},
  {key:'vocab-1',score:55,passed:false,relevance:'on_task',scores:{task:2},summary:'The answer does not explain who decides what to work on first.'},
 ]}};
 const ask=(key:string)=>P.helpPrompt(Coaching.tutorContext(P.context(s.lesson,'vocabulary',answers),s,key),'What should I change?');
 const failed=JSON.parse(ask('vocab-1').user).coaching;
 assert.equal(failed.currentDraft,'They have some priorities.');
 assert.equal(failed.feedback.status,'needs_work');
 assert.deepEqual(failed.feedback.blockers,['Task fulfilment 2/4, needs at least 3/4.']);
 assert.match(failed.feedback.summary,/who decides/);
 const passed=ask('vocab-0');
 assert.equal(JSON.parse(passed.user).coaching.feedback.status,'passed');
 assert.match(passed.system,/If you want to improve/);
 answers[0].text='We estimate the work before planning.';
 const edited=JSON.parse(ask('vocab-0').user).coaching;
 assert.equal(edited.feedback.status,'edited');
 assert.equal(edited.feedback.appliesToCurrentDraft,false);
 assert.equal(edited.lastCheckedDraft,'The developers estimate their work.');
});

test('Whole-section AI conclusions include cached answers when only one response is edited',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}});ai.save({provider:'groq',key:'fake'});const contexts:any[]=[];ai.generate=async(_:string,p:any)=>{const b=JSON.parse(p.user);contexts.push(b);return feedback(b);};
 const bundle={lessonId:'test',area:'vocabulary',level:'A2',topic:'Work',sourceFacts:[],answers:[{key:'vocab-0',task:'Use feature.',text:'The new feature saves time.'},{key:'vocab-1',task:'Use role.',text:'My role is to test the app.'}]};
 let r=await ai.grade(bundle);assert.equal(r.assessment.conclusion.source,'ai');assert.equal(r.assessment.conclusion.strengths[0],'Ти формулюєш власні думки.');bundle.answers[1].text='My role includes testing the app.';r=await ai.grade(bundle);assert.equal(r.assessment.cache.reused,1);assert.equal(contexts[1].answers.length,1);assert.equal(contexts[1].blockContext.length,2);assert.equal(r.assessment.conclusion.total,2);const count=contexts.length;await ai.grade(bundle);assert.equal(contexts.length,count);
 assert.throws(()=>Coaching.validateOverview({summary:'x',strengths:[{text:'Invented',answerKeys:['not-in-block']}],weaknesses:[],nextStep:'x'},['vocab-0']));
});
test('Feedback uses score bands, a single explanation, checked draft, and no premature whole-lesson prompt',()=>{
 assert.equal(scoreTone(25),'low');assert.equal(scoreTone(65),'medium');assert.equal(scoreTone(85),'high');assert.equal(scoreTone(100),'perfect');
 const c=new EnglishController(newEnglishDocument());c.start();const s:any=c.document.course.activeSession;s.blockIndex=1;s.answers['vocab-0']='The feature saves time.';s.aiAssessments={vocabulary:{score:65,passed:false,provider:'mock',model:'test',checkedAt:new Date().toISOString(),snapshot:JSON.stringify([['vocab-0',s.answers['vocab-0']]]),answers:[{key:'vocab-0',score:65,passed:true,relevance:'on_task',scores:{task:4,grammar:2,vocabulary:3,clarity:2,coherence:2},summary:'The idea is understandable.',strengths:[],corrections:[{kind:'error',original:'feature',replacement:'feature',explanation:'A test explanation.'}],nextStep:'Check the verb.'}],conclusion:{version:1,total:1,passed:1,strengths:[],priorities:[]}}};
 const html=renderAIBlock(c.view(),'');assert.match(html,/en-score-medium/);assert.match(html,/Actual answer/);assert.ok(!html.includes('Explanation &amp; corrections'));assert.ok(!html.includes('data-en-coaching-prompt'));assert.match(html,/data-en-autosize="short"/);assert.match(html,/en-section-results/);assert.ok(!html.includes('en-ai-tutor'));
});
test('Local translations select contextual senses, save the dictionary and never call an API',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}});ai.generate=async()=>{throw Error('No API calls allowed');};const t=new Translation.EnglishTranslation({root:ai.root,ai,glossary:[]});
 const r=await t.handle({action:'lookup',text:'book',context:'Patients can book an appointment.'});assert.match(r.entry.translation,/бронювати/);assert.equal(r.entry.alternatives.length,2);assert.equal((await t.handle({action:'lookup',text:'book',context:'I read a book in the library.'})).entry.translation,'книжка');assert.equal((await t.handle({action:'lookup',text:'BOOK',context:'Patients can BOOK an appointment.'})).cached,true);
 const saved=await t.handle({action:'list'});
 assert.equal(saved.status.count,1);
 assert.equal(saved.entries.length,1);
 assert.deepEqual(new Set(saved.entries[0].uses.map((use:{translation:string})=>use.translation)),new Set(['бронювати; записувати','книжка']));
});
test('Existing dictionary entries with mixed casing share a card and retain their saved contexts',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}});
 const t=new Translation.EnglishTranslation({root:ai.root,ai,glossary:[{en:'bottleneck',uk:'вузьке місце'}]});
 const file=t.file;
 const existing=[
  {id:'1'.repeat(64),text:'bottleneck',context:'Find the bottleneck in this pipeline.',at:'2026-11-19T12:00:00Z'},
  {id:'2'.repeat(64),text:'Bottleneck',context:'Bottleneck: the queue writes to disk.',at:'2026-11-19T13:00:00Z'}
 ].map(entry=>({...entry,translation:'вузьке місце',explanation:'З курсу.',alternatives:[],provider:'local',model:'course-glossary'}));
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify({version:1,entries:existing}));
 const old=(await t.handle({action:'list'})).entries;
 assert.equal(old.length,1);
 assert.equal(old[0].text,'bottleneck');
 assert.deepEqual(old[0].uses.map((use:{context:string})=>use.context),[existing[1]!.context,existing[0]!.context]);
 const cached=await t.handle({action:'lookup',text:'BOTTLENECK',context:'BOTTLENECK: the queue writes to disk.'});
 assert.equal(cached.cached,true);
 assert.equal(cached.entry.id,existing[1]!.id);
 assert.deepEqual(t.read().entries,existing);
 await Promise.all([
  t.handle({action:'lookup',text:'bottleneck',context:'The network is the bottleneck.'}),
  t.handle({action:'lookup',text:'BOTTLENECK',context:'The network is the BOTTLENECK.'})
 ]);
 assert.equal(t.read().entries.length,3);
 const saved=await t.handle({action:'list'});
 assert.equal(saved.entries.length,1);
 assert.equal(saved.entries[0].uses.length,3);
});
test('Translator has no paid fallback, requires complimentary flags, obeys the local cap and caches AI results',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}}),t=new Translation.EnglishTranslation({root:ai.root,ai,glossary:[]});ai.save({provider:'openai',key:'fake'});let calls=0;ai.remote=async()=>{calls++;throw Error('Should not call');};await assert.rejects(t.handle({action:'translate',provider:'complimentary',text:'handover',context:'A handover note for the team.'}),/promotional/);assert.equal(calls,0);
 ai.save({hybridRouting:true,complimentaryEnrolled:true,openaiStandardBudget:1000});await assert.rejects(t.handle({action:'translate',provider:'complimentary',text:'handover',context:'A handover note for the team.'}),/local daily token limit/);assert.equal(calls,0);
 ai.save({openaiStandardBudget:200000});ai.remote=async()=>{calls++;return {status:'completed',usage:{input_tokens:50,output_tokens:60},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({translation:'передавання справ',explanation:'Роботу передають колезі.',alternatives:[{text:'передача зміни',when:'Для позмінної роботи.'},{text:'передавання повноважень',when:'Для відповідальності.'}]})}]}]};};
 const request={action:'translate',provider:'complimentary',text:'handover',context:'A handover note for the team.'};await t.handle(request);assert.equal((await t.handle(request)).cached,true);assert.equal(calls,1);
});
test('OpenRouter translation pins a free route and zero price; saved dictionary handles concurrent writes',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}});ai.save({provider:'openrouter',key:'fake'});ai.remote=async(url:string,options:any)=>{assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');const b=JSON.parse(options.body);assert.equal(b.model,'openrouter/free');assert.deepEqual(b.provider.max_price,{prompt:0,completion:0,request:0});return {choices:[{message:{content:JSON.stringify({translation:'передавання справ',explanation:'Робочий контекст.',alternatives:[{text:'передача зміни',when:'Графік роботи.'},{text:'передавання повноважень',when:'Відповідальність.'}]})}}]};};
 const t=new Translation.EnglishTranslation({root:ai.root,ai,glossary:[]});await t.handle({action:'translate',provider:'openrouter',text:'handover',context:'The team prepared a handover.'});await Promise.all([t.handle({action:'lookup',text:'feature',context:'Add an app feature.'}),t.handle({action:'lookup',text:'role',context:'A team role.'})]);assert.equal((await t.handle({action:'list'})).entries.length,3);
});

test('Selected-text help uses promotional Luna, then confirmed Groq, then zero-price OpenRouter',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}});
 for(const provider of ['openai','groq','gemini','openrouter'])ai.save({provider,key:'mock-key'});
 ai.save({hybridRouting:true,complimentaryEnrolled:true,translationGroqFreeConfirmed:true,automaticFallback:false});
 const service=new Translation.EnglishTranslation({root:ai.root,ai});
 const calls:string[]=[];
 ai.remote=async(url:string,options:any)=>{
  const body=JSON.parse(options.body);
  const provider=new URL(url).hostname;
  calls.push(provider);
  assert.ok(options.signal instanceof AbortSignal);
  if(provider==='api.openai.com'){
   assert.equal(body.model,'gpt-6-luna');
   assert.equal(body.store,false);
   assert.equal(JSON.parse(body.input).context,'We show patients an early version of the booking form.');
   throw Object.assign(Error('Test throttling'),{code:'429'});
  }
  if(provider==='api.groq.com'){
   assert.equal(body.model,'openai/gpt-oss-20b');
   return {choices:[{message:{content:'{"explanation":"\u041d\u0435\u0432\u0456\u0440\u043d\u0430 \u043c\u043e\u0432\u0430"}'}}]};
  }
  assert.equal(provider,'openrouter.ai');
  assert.equal(body.model,'openrouter/free');
  assert.deepEqual(body.provider.max_price,{prompt:0,completion:0,request:0});
  return {choices:[{message:{content:'{"explanation":"Patients test the first working form before the team improves it."}'}}]};
 };
 const request={action:'explain',text:'an early version',context:'We show patients an early version of the booking form.'};
 const result=await service.handle(request);
 assert.deepEqual(calls,['api.openai.com','api.groq.com','openrouter.ai']);
 assert.equal(result.provider,'openrouter');
 assert.equal(await service.handle(request),result);
 assert.equal(calls.length,3);
 assert.deepEqual((await service.handle({action:'list'})).entries,[]);
});

test('Correction and synonyms use separate requests, filter repeats, and skip ineligible keys',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}});
 for(const provider of ['openai','groq','gemini'])ai.save({provider,key:'mock-key'});
 let calls=0;
 ai.remote=async(url:string,options:any)=>{
  assert.equal(new URL(url).hostname,'api.groq.com');
  calls++;
  const [systemMessage,userMessage]=JSON.parse(options.body).messages;
  const system=systemMessage.content;
  const {context,cefrLevel}=JSON.parse(userMessage.content);
  assert.equal(context,'The booking workflow is overcycling.');
  const content=system.includes('one replacement')
   ?{replacement:'overcomplicated',explanation:'Use this adjective when a process is more complex than necessary.'}
   :cefrLevel==='C1'
    ?{explanation:'A formal option.',suggestions:[{word:'overengineered',meaning:'Designed with unnecessary complexity',usage:'When a technical design is needlessly elaborate'}]}
    :{explanation:'This option fits the sentence.',suggestions:[{word:'too hard to follow',meaning:'Difficult to understand or use',usage:'For confusing instructions or processes'},{word:'Too hard to follow',meaning:'Difficult to follow',usage:'In conversation'}]};
  return {choices:[{message:{content:JSON.stringify(content)}}]};
 };
 const service=new Translation.EnglishTranslation({root:ai.root,ai});
 const word={text:'overcycling',context:'The booking workflow is overcycling.'};
 await assert.rejects(service.handle({action:'correct',...word}),/Enable a supported provider/);
 assert.equal(calls,0);
 ai.save({translationGroqFreeConfirmed:true});
 assert.equal((await service.handle({action:'correct',...word})).replacement,'overcomplicated');
 const request={action:'synonyms',...word,cefrLevel:'A2'};
 const basic=await service.handle(request);
 assert.deepEqual(basic.suggestions,[{word:'too hard to follow',meaning:'Difficult to understand or use',usage:'For confusing instructions or processes'}]);
 assert.deepEqual((await service.handle({...request,cefrLevel:'C1'})).suggestions.map((item:any)=>item.word),['overengineered']);
 assert.equal(await service.handle(request),basic);
 await assert.rejects(service.handle({...request,cefrLevel:'B3'}),/Choose a CEFR level/);
 assert.equal(calls,3);
});

test('Selection context includes the full sentence and respects the occurrence the learner selected',()=>{
 const source='The app is live. The app still takes two seconds! Please check the logs.';
 const selected='The app';
 assert.equal(sentenceContext(source,selected,source.lastIndexOf(selected)),'The app still takes two seconds!');
 assert.equal(sentenceContext(source,'seconds! Please'),'The app still takes two seconds! Please check the logs.');
 assert.equal(sentenceContext('She asked Dr. Smith about the change. They spoke.','about'),'She asked Dr. Smith about the change.');
 assert.equal(sentenceContext('Check the logs','logs'),'Check the logs');
});

test('Grammar checks the whole sentence and grounds severity and highlights in the original text',async()=>{
 const ai=new AI.EnglishAI({statisticsPath:temp(),env:{}});
 ai.save({provider:'groq',key:'mock-key'});
 ai.save({translationGroqFreeConfirmed:true});
 const service=new Translation.EnglishTranslation({root:ai.root,ai});
 const context='Every morning they checks the logs, and she checks it since last week.';
 const input={action:'grammar',text:'the logs',context};
 ai.remote=async(url:string,options:any)=>{
  assert.equal(new URL(url).hostname,'api.groq.com');
  const [system,user]=JSON.parse(options.body).messages;
  assert.match(system.content,/Check the entire context/);
  assert.deepEqual(JSON.parse(user.content),{selection:input.text,context});
  const content={explanation:'Two places need attention.',issues:[
   {fragment:'checks',occurrence:1,severity:'error',reason:'Use check after they.'},
   {fragment:'checks it',occurrence:1,severity:'uncertain',reason:'Clarify what it refers to.'},
   {fragment:'the report',occurrence:1,severity:'error',reason:'This fragment is absent.'},
   {fragment:'they checks',occurrence:1,severity:'uncertain',reason:'Overlaps with a definite error.'}
  ]};
  return {choices:[{message:{content:JSON.stringify(content)}}]};
 };
 const result=await service.handle(input);
 assert.deepEqual(result.issues,[
  {start:context.indexOf('checks'),end:context.indexOf('checks')+6,severity:'error',reason:'Use check after they.'},
  {start:context.lastIndexOf('checks'),end:context.lastIndexOf('checks')+9,severity:'uncertain',reason:'Clarify what it refers to.'}
 ]);
});

test('English lesson blocks keep course instructions in English for all 84 lessons and localise saved task text',()=>{
 const cyrillic=/\p{Script=Cyrillic}/u;
 for(const lesson of (Course as any).lessons){
  assert.ok(!cyrillic.test(lesson.grammar.title+' '+lesson.grammar.explanation),lesson.id);
  for(const word of lesson.vocabulary)assert.ok(!cyrillic.test(word.conceptPrompt),lesson.id);
  for(const q of lesson.grammar.exercises)assert.ok(!cyrillic.test(q.explanation+' '+q.instruction+' '+q.hint),lesson.id);
 }
 const c=new EnglishController(newEnglishDocument());c.start();
 const attempt=c.document.course.activeSession!;
 const lesson=attempt.lesson as any;
 lesson.vocabulary[0].conceptPrompt='Write one sentence using “project” (noun — проєкт).';
 lesson.grammar.exercises[0].hint='Team тут — однина.';
 const answer=c.document.course.activeSession!.answers;
 answer['grammar-0']='The team checks the booking page.';
 const refreshed=new EnglishController(c.document).view();
 assert.equal(refreshed.attempt!.answers['grammar-0'],answer['grammar-0']);
 assert.equal(refreshed.lesson.vocabulary[0].conceptPrompt,'Write one sentence using “project” (noun).');
 assert.ok(!cyrillic.test((refreshed.lesson.grammar.exercises[0] as any).hint));
 for(const id of ['vocabulary','reading','listening','grammar','speaking','writing']){
  const blockIndex=refreshed.lesson.blocks.findIndex(block=>block.id===id);
  assert.ok(!cyrillic.test(renderAIBlock({...refreshed,attempt:{...refreshed.attempt!,blockIndex}},'')),id);
 }
});

test('Early readings separate story facts from instructions, and frozen active reading stays unchanged',()=>{for(const l of (Course as any).lessons.filter((l:any)=>l.type==='lesson')){assert.ok(!l.reading.text.includes('In our team discussion, we separate'));for(const q of l.reading.questions.slice(0,3))assert.ok(l.reading.text.toLowerCase().includes(q.options[q.correct].toLowerCase()),l.id);}const team=(Course as any).lessons.find((l:any)=>l.concept.title==='Team roles'||l.title==='Team roles');assert.match(team.reading.text,/cannot review every detail/);const c=new EnglishController(newEnglishDocument());c.start();const doc=structuredClone(c.document);doc.course.activeSession!.lesson.reading.text='An earlier frozen passage that the learner has already read.';const restored=new EnglishController(doc);assert.equal(restored.view().attempt!.lesson.reading.text,'An earlier frozen passage that the learner has already read.');});


test('Final coaching prompt keeps earlier corrected mistakes and all section evidence',()=>{
 const c=new EnglishController(newEnglishDocument());c.start();c.dispatch({type:'answer',key:'writing',value:'The developer check the screen.'});let b:any=c.assessmentBundle('writing');const initial:any=feedback({...b,blockContext:b.answers});initial.answers[0].corrections=[{kind:'error',original:'developer check',replacement:'developer checks',explanation:'A singular subject needs agreement.'}];c.acceptAI({...P.validateGrade(initial,b),provider:'mock',model:'test'});
 c.dispatch({type:'answer',key:'writing',value:'The developer checks the screen.'});b=c.assessmentBundle('writing');c.acceptAI({...P.validateGrade(feedback({...b,blockContext:b.answers}),b),provider:'mock',model:'test'});const s:any=c.document.course.activeSession,prompt=(Course as any).learning.handoffPrompt(s);assert.equal(s.mistakeLog.length,1);assert.equal(s.aiAssessments.writing.answers[0].corrections.length,0);assert.match(prompt,/developer check/);assert.match(prompt,/mistakeHistory/);assert.match(prompt,/"area": "listening"/);assert.match(prompt,/"area": "grammar"/);assert.match(prompt,/"materials"/);
});


test('CEFR is a separate evidence-based estimate of a text, with no claim from a short answer',()=>{
 const text='I think the team should name one owner because this person can confirm the requirements and explain the final decision to everyone.';
 const b:any={area:'writing',answers:[{key:'writing',task:'Explain your opinion.',text}],blockContext:[{key:'writing'}]},raw:any=feedback(b);raw.answers[0].textLevel={band:'A2-B1',reason:'Прості речення пов’язані поясненням причини.',evidence:['because this person can confirm']};const grade=P.validateGrade(raw,b);assert.equal(grade.answers[0].textLevel.band,'A2–B1');assert.equal(grade.score,80);assert.equal(grade.answers[0].textLevel.reason,raw.answers[0].textLevel.reason);
 assert.throws(()=>Coaching.validateTextLevel({band:'C2',reason:'Invented.',evidence:['not in the text']},text));assert.equal(Coaching.validateTextLevel({band:'B2',reason:'A short clause.',evidence:['This works']},'This works.').band,'insufficient');
});
