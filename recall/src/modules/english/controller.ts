import * as CoachingLearning from './vendor/learning';
import * as EngineModule from './vendor/engine';
import * as Course from './vendor/course';
import * as Learning from './vendor/learning';
import {practiceTask,practiceMessage} from './practice';
import {kyivDayKey} from '../../core/calendar';
import {envelopeValid,type LearningAction,type LearningController,type LearningEnvelope,type LearningOutcome,type ActivityState} from '../../core/learning';
import type {EnglishDocument,EnglishCourseState,EnglishDay,EnglishRunPayload,EnglishView,EnglishAttempt,EnglishPractice,EnglishChoice,EnglishLanguageReport,EnglishLesson} from './types';
const {Engine,validateImport,normal,defaultState}=EngineModule as any;
export const ENGLISH_TARGET_MS=55*60000,ENGLISH_SURRENDER_MS=15*60000,ENGLISH_EXTENSION_MS=30*60000;
const clone=<T>(value:T):T=>structuredClone(value);
export function newEnglishDocument(now=new Date()):EnglishDocument{return {version:2,revision:0,course:defaultState({},now),days:{},runs:[],activeRunId:null};}
export function validateEnglishDocument(value:unknown):EnglishDocument {
  const d=clone(value) as EnglishDocument;
  if(d?.version!==2||!Number.isInteger(d.revision)||d.revision<0||!d.days||typeof d.days!=='object'||!Array.isArray(d.runs)||d.runs.length>10000)throw new Error('Несумісне збереження English.');
  d.course=validateImport(d.course);
  for(const [day,item] of Object.entries(d.days))if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!item||!Number.isFinite(item.activeMs)||item.activeMs<0||item.activeMs>ENGLISH_TARGET_MS||['dismissed','fulfilled','learningComplete'].some(k=>typeof item[k as keyof EnglishDay]!=='boolean'))throw new Error('Некоректний денний прогрес English.');
  for(const run of d.runs)if(!envelopeValid(run)||run.moduleId!=='english'||!run.payload||!['lesson','break','reinforcement'].includes(run.payload.phase)||!Number.isFinite(run.payload.breakRemainingMs)||run.payload.breakRemainingMs<0||run.payload.breakRemainingMs>300000||!Number.isInteger(run.payload.practiceIndex)||run.payload.practiceIndex<0)throw new Error('Некоректна English-сесія.');
  for(const {payload:p}of d.runs){if(typeof p.lessonId!=='string'||!Course.getLesson(p.lessonId)||typeof p.breakUsed!=='boolean')throw new Error('Invalid lesson state.');if(p.practice){const r=p.practice;if(!['word','choice','production','sentence'].includes(r.kind)||!['id','prompt','answer','explanation','value'].every(k=>typeof r[k as keyof typeof r]==='string'&&(r[k as keyof typeof r] as string).length<=20000)||typeof r.revealed!=='boolean'||!Number.isInteger(r.attempts)||r.attempts<0||r.options!==undefined&&(!Array.isArray(r.options)||r.options.length>10||!r.options.every(o=>typeof o==='string')))throw new Error('Invalid practice exercise.');}if(p.practiceHistory!==undefined&&(!Array.isArray(p.practiceHistory)||p.practiceHistory.length>100))throw new Error('Invalid practice history.');}
  if(d.activeRunId!==null&&!d.runs.some(r=>r.id===d.activeRunId))throw new Error('Не знайдено активну English-сесію.');
  for(const run of d.runs)if(run.payload.extraPractice!==undefined&&(run.payload.extraPractice!==true||run.activeMs>ENGLISH_EXTENSION_MS||run.mode==='daily'||run.payload.phase==='break'))throw new Error('Некоректний стан допрацювання English.');
  return d;
}
export function importEnglishCourse(source:unknown,now=new Date()):EnglishDocument {
  const raw=source as any,document=newEnglishDocument(now),course=validateImport(raw?.format==='english-daily-progress'?raw.state:raw?.version===2&&raw.course?raw.course:raw?.learnedWords||raw?.completedMilestones?defaultState(raw,now):raw);
  // Reconstruct learning days from real timestamps, retaining original session data.
  course.completedDays=[...new Set(course.sessions.filter((s:any)=>s.status==='completed').map((s:any)=>kyivDayKey(new Date(s.endedAt||s.startedAt))))];
  document.course=course;document.importedAt=now.toISOString();
  for(const session of course.sessions){const day=kyivDayKey(new Date(session.endedAt||session.startedAt)),entry=document.days[day]??={activeMs:0,dismissed:false,fulfilled:false,learningComplete:false};entry.activeMs=Math.min(ENGLISH_TARGET_MS,entry.activeMs+session.activeMs);entry.learningComplete=true;entry.fulfilled=entry.activeMs>=ENGLISH_TARGET_MS;}
  if(course.activeSession){const s=course.activeSession,day=kyivDayKey(new Date(s.startedAt)),entry=document.days[day]??={activeMs:0,dismissed:false,fulfilled:false,learningComplete:false};entry.activeMs=Math.min(ENGLISH_TARGET_MS,entry.activeMs+s.activeMs);entry.fulfilled=entry.activeMs>=ENGLISH_TARGET_MS;}
  return document;
}
export class EnglishController implements LearningController {
  document:EnglishDocument;private engine:any;
  constructor(state:unknown=newEnglishDocument(),private now:()=>Date=()=>new Date()){
    this.document=validateEnglishDocument(state);const adapter={getItem:(key:string)=>key==='english_daily_v1'?JSON.stringify(this.document.course):null,setItem:(key:string,value:string)=>{if(key==='english_daily_v1')this.document.course=JSON.parse(value);}};
    this.engine=new Engine(adapter,this.now,kyivDayKey);
    // The desktop host owns atomic persistence. Avoid serialising the whole
    // course history on every keypress inside the browser-oriented engine.
    this.engine.save=()=>{this.document.course=this.engine.state;return this.engine.state;};
  }
  snapshot(){return this.document.runs.find(r=>r.id===this.document.activeRunId)||null;}
  private current(){return this.engine.current() as EnglishAttempt|null;}
  private dayFor(key:string){return this.document.days[key]??={activeMs:0,dismissed:false,fulfilled:false,learningComplete:false};}
  day(){return this.dayFor(kyivDayKey(this.now()));}
  private changed(){this.document.course=this.engine.state;this.document.revision++;const run=this.snapshot();if(run)run.revision++;}
  start(mode:'daily'|'practice'|'demo'='practice'){
    const day=this.day(),key=kyivDayKey(this.now()),old=this.snapshot();
    if(day.fulfilled&&old?.payload.extraPractice)return;
    if(day.fulfilled){if(old&&!old.endedAt){old.status=this.current()?'partial':'completed';old.endedAt=this.now().toISOString();this.changed();}return;}
    if(old&&old.dayKey===key&&!old.endedAt){old.status='active';if(this.current())this.engine.pause(false);else{old.payload.phase='reinforcement';this.ensurePractice();}this.changed();return;}
    if(old&&!old.endedAt){old.status='partial';old.endedAt=this.now().toISOString();}
    let attempt=this.current();if(!attempt)attempt=this.engine.start();
    const lesson=attempt?.lesson||this.document.course.sessions.at(-1)?.lesson||Course.lessons[0]!;
    const run:LearningEnvelope<EnglishRunPayload>={version:2,id:`en-${this.now().getTime()}-${Math.random().toString(36).slice(2,9)}`,moduleId:'english',contentVersion:Course.VERSION,dayKey:key,revision:0,mode,status:'active',startedAt:this.now().toISOString(),activeMs:0,payload:{phase:attempt?'lesson':'reinforcement',lessonId:lesson.id,breakRemainingMs:0,breakUsed:false,practiceIndex:0,practice:null}};
    this.document.runs.push(run);this.document.activeRunId=run.id;if(attempt)this.engine.pause(false);else this.ensurePractice();this.changed();
  }
  canExtend(){
    const run=this.snapshot(),today=kyivDayKey(this.now());
    return !!run&&run.dayKey===today&&!!this.document.days[today]?.fulfilled&&
      (run.payload.extraPractice?!run.endedAt&&run.status==='paused':!!run.endedAt);
  }
  startExtension(mode:'practice'|'demo'='practice'){
    const old=this.snapshot();
    if(!old||!this.canExtend())throw Error('Допрацювання доступне після сьогоднішньої сесії English.');
    if(old.payload.extraPractice){
      old.status='active';
    }else{
      const attempt=this.current(),now=this.now();
      const run:LearningEnvelope<EnglishRunPayload>={version:2,id:`en-extra-${now.getTime()}-${Math.random().toString(36).slice(2,9)}`,moduleId:'english',contentVersion:old.contentVersion,dayKey:old.dayKey,revision:0,mode,status:'active',startedAt:now.toISOString(),activeMs:0,payload:{
        ...clone(old.payload),phase:attempt?'lesson':'reinforcement',lessonId:attempt?.lessonId??old.payload.lessonId,breakRemainingMs:0,breakUsed:true,extraPractice:true,
      }};
      this.document.runs.push(run);this.document.activeRunId=run.id;
    }
    if(this.current())this.engine.pause(false);else this.ensurePractice();
    this.changed();
  }
  pause(){const run=this.snapshot();if(run&&!run.endedAt){run.status='paused';if(this.current())this.engine.pause(true);this.changed();}}
  private question(key:string):EnglishChoice|null {const s=this.current();if(!s)return null;const match=/^(reading|listening|grammar)-(\d+)$/.exec(key);if(!match)return null;const index=Number(match[2]);return match[1]==='grammar'?s.lesson.grammar.exercises[index]||null:s.lesson[match[1] as 'reading'|'listening'].questions[index]||null;}
  exitQuestions(){const s=this.current();if(!s||s.lesson.productionMode==='ai-opinion-v1')return [];return [...s.lesson.vocabulary.slice(3).map((v,i)=>{const task=(Learning as any).wordTask(v);return {key:`exit-${i}`,prompt:`${task.prompt}\nClue: ${task.clue}\nType ONE word or phrase.`,kind:'word' as const,answer:v.en};}),...s.lesson.grammar.exercises.slice(0,2).map((q,i)=>{const options=[...q.options.slice(1),q.options[0]];return {key:`exit-${i+3}`,prompt:q.prompt,kind:'choice' as const,answer:q.options[q.correct],options,correct:options.indexOf(q.options[q.correct])};})];}
  languageTarget(key:string,attemptId?:string){
    if(!/^(vocab-example|vocab-\d+|reading-\d+|listening-\d+|grammar-\d+|retell|monologue|turn-[0-2]|retry|writing|review-\d+)$/.test(key))throw new Error('This field does not use the language checker.');
    const active=this.current(),attempt=attemptId?this.document.course.sessions.find(s=>s.id===attemptId)||((this.document.course.migration as any)?.manualAdvances||[]).find((a:any)=>a.attempt.id===attemptId)?.attempt||(active?.id===attemptId?active:null):active;
    if(!attempt)throw new Error('This saved answer is not available.');const text=attempt.answers[key];if(!text?.trim())throw new Error('Write your English answer before checking it.');
    if(/^\[(Локальний аудіозапис|Local audio recording)/.test(text))throw new Error('Your recording is saved. Type what you said to check its wording; audio is not automatically transcribed.');
    return {attemptId:attempt.id,key,text};
  }
  assessmentBundle(area:string){if(area==='practice'){const p=this.snapshot()?.payload.practice;if(!p?.value.trim())throw new Error('Write your own practice response first.');return {area,answers:[{key:'practice',task:p.prompt,text:p.value}]};}const s=this.current();if(!s)throw new Error('Resume a lesson first.');return (Learning as any).assessmentBundle(s,area);}
  acceptAI(a:any){if(a.area==='practice'){const p=this.snapshot()!.payload.practice!,bundle=this.assessmentBundle('practice');if(a.snapshot!==JSON.stringify(bundle.answers.map((r:any)=>[r.key,r.text])))throw new Error('Practice draft changed. Submit it again.');(p as any).aiAssessment=a;p.result={correct:a.passed,assisted:p.revealed||p.attempts>0,scope:'ai',at:a.checkedAt,message:a.answers[0].summary};p.attempts++;}else this.engine.acceptAI(a);this.changed();}
  acceptLanguageCheck(key:string,report:EnglishLanguageReport){this.engine.acceptLanguageCheck(key,report);this.changed();}
  reviewLanguageFlags(key:string){const s=this.current(),report=s?.languageChecks?.[key];if(!s||!report||report.text!==s.answers[key])throw new Error('Check the current answer first.');report.reviewed=true;report.ignored=true;this.engine.acceptLanguageCheck(key,report);this.changed();}
  private lessonReady(){return !!this.current()&&Course.BLOCKS.every((b:any)=>this.engine.requirements(b.id))&&this.exitQuestions().every(q=>this.current()!.results[q.key]?.correct);}
  dispatch(action:LearningAction){
    const run=this.snapshot();
    // Flush an input event that was already in flight when the host paused or
    // reached its budget. It changes no time and awards no completion credit.
    if(run&&action.type==='answer'&&(run.status==='paused'||!!run.endedAt&&this.now().getTime()-Date.parse(run.endedAt)<=10000)){
      const key=action.key||'';if(!key||['__proto__','prototype','constructor'].includes(key)||key.length>150||(action.value||'').length>20000)throw new Error('Некоректна відповідь.');
      if(this.current())this.engine.setAnswer(key,action.value||'',action.flag?'voice':'typed');else if(run.payload.practice){run.payload.practice.value=action.value||'';delete run.payload.practice.result;}this.changed();return;
    }
    if(!run||run.endedAt||run.status!=='active')throw new Error('English-сесія не активна.');
    if(action.type==='skip-break'){if(run.payload.phase!=='break')return;run.payload.breakRemainingMs=0;run.payload.phase='lesson';this.engine.pause(false);this.changed();return;}
    if(run.payload.phase==='break')throw new Error('Зараз перерва. Можна продовжити раніше.');
    if(run.payload.phase==='reinforcement'){this.practiceAction(action);this.changed();return;}
    const s=this.current();if(!s)throw new Error('Урок недоступний.');
    const key=action.key||'';
    if(key.length>150||action.value&&action.value.length>20000)throw new Error('Відповідь надто довга.');
    if(['__proto__','prototype','constructor'].includes(key))throw new Error('Некоректний ключ відповіді.');
    switch(action.type){
      case 'import-personal-review':this.engine.importPersonalReview(action.value||'');break;
      case 'use-transcript':{const t=(s as any).proposedTranscripts?.[key];if(!t?.text?.trim())throw new Error('No usable transcript available. Type your answer or retry ASR.');(s as any).transcriptHistory=[...((s as any).transcriptHistory||[]),{key,text:s.answers[key]||'',at:new Date().toISOString()}].slice(-30);this.engine.setAnswer(key,t.text,'voice');delete (s as any).recordingNeedsTranscript?.[key];t.confirmed=true;break;}
      case 'select-block':{const index=Number(action.value);if(!Number.isInteger(index)||index<0||index>7)throw new Error('Invalid block.');s.blockIndex=index;break;}
      case 'answer':this.engine.setAnswer(key,action.value||'',action.flag?'voice':'typed');break;
      case 'keep-wording':this.reviewLanguageFlags(key);break;
      case 'hint':this.engine.reveal(key);break;
      case 'check':{
        const vocab=/^vocab-(\d+)$/.exec(key),review=/^review-(\d+)$/.exec(key),exit=this.exitQuestions().find(q=>q.key===key),q=this.question(key);
        if((Learning as any).findGuidedTask(s.lesson,key))this.engine.checkGuided(key);
        else if(vocab&&s.lesson.vocabulary[Number(vocab[1])])this.engine.checkText(key,s.lesson.vocabulary[Number(vocab[1])].en);
        else if(review&&s.reviews[Number(review[1])])this.engine.checkText(key,s.reviews[Number(review[1])].answer);
        else if(exit)this.engine.grade(key,exit.kind==='word'?normal(s.answers[key])===normal(exit.answer):s.answers[key]!==undefined&&Number(s.answers[key])===exit.correct);
        else if(q)this.engine.checkChoice(key,q);else throw new Error('Для цієї відповіді доступна самоперевірка.');break;
      }
      case 'self':{
        if(s.lesson.productionMode==='ai-opinion-v1'||s.lesson.guidedTasks?.version===1)throw new Error('Self-reported checks cannot complete guided tasks.');
        const allowed=/^(review-\d+|vocab-example|retell|speaking-reflection|writing-check-[0-2])$/.test(key);if(!allowed)throw new Error('Невідомий критерій.');
        if(!action.flag){delete s.results[key];this.engine.save();break;}
        const answerKey=key==='speaking-reflection'?'retry':key.startsWith('writing-check')?'writing':key;
        if(!s.answers[answerKey]?.trim())throw new Error('Спочатку додай свою відповідь або запис.');
        if(key==='vocab-example'&&s.lesson.vocabulary.filter(v=>normal(s.answers[key]).includes(normal(v.en))).length<2)throw new Error('Використай щонайменше дві сьогоднішні фрази.');
        this.engine.grade(key,true,{selfReported:true,assisted:true});s.results[key].selfReported=true;break;
      }
      case 'self-feedback':{
        if(s.lesson.guidedTasks?.version===1)throw new Error('Complete the guided tasks; free feedback does not award task credit.');
        const area=action.area;if(area!=='speaking'&&area!=='writing')throw new Error('Невідомий блок.');if(!s.answers[area==='speaking'?'monologue':'writing']?.trim())throw new Error('Спочатку додай відповідь.');
        const corrections=s.answers['correction-original']?.trim()&&s.answers['correction-improved']?.trim()?[{original:s.answers['correction-original'],improved:s.answers['correction-improved'],explanation:'Власна поправка після порівняння зі зразком.'}]:[];
        s.feedback[area]={source:'self',summary:'Самоперевірка змісту за зразком. Мовна правильність і вимова автоматично не оцінювалися.',corrections,rewrite:'',skills:null};this.engine.save();break;
      }
      case 'listen-complete':s.listens++;this.engine.save();break;
      case 'transcript':s.transcriptVisible=true;this.engine.save();break;
      case 'audio-unavailable':s.listeningUnavailable=true;s.transcriptVisible=true;this.engine.save();break;
      case 'previous':this.engine.previous();break;
      case 'advance':{const before=s.blockIndex;this.engine.advance();if(before===3&&!run.payload.breakUsed){run.payload.breakUsed=true;run.payload.breakRemainingMs=5*60000;run.payload.phase='break';this.engine.pause(true);}break;}
      case 'complete-lesson':{
        if(!this.lessonReady())throw new Error('Заверши блоки й підсумкову перевірку.');
        this.engine.finish();this.day().learningComplete=true;run.payload.phase='reinforcement';this.ensurePractice();break;
      }
      default:throw new Error('Невідома дія English.');
    }this.changed();
  }
  tick(milliseconds:number,activity:ActivityState){
    const run=this.snapshot();if(!run||run.endedAt||run.status!=='active'||!activity.active||activity.waiting)return;
    if(run.dayKey!==kyivDayKey(this.now())){run.status='partial';run.endedAt=this.now().toISOString();if(this.current())this.engine.pause(true);this.changed();return;}
    const delta=Math.max(0,Math.min(milliseconds,5000));if(!delta)return;
    if(run.payload.phase==='break'){run.payload.breakRemainingMs=Math.max(0,run.payload.breakRemainingMs-delta);if(!run.payload.breakRemainingMs){run.payload.phase='lesson';this.engine.pause(false);}this.changed();return;}
    const day=this.day(),remaining=run.payload.extraPractice?ENGLISH_EXTENSION_MS-run.activeMs:ENGLISH_TARGET_MS-day.activeMs;
    const credited=Math.min(delta,Math.max(0,remaining));
    if(!run.payload.extraPractice)day.activeMs+=credited;
    run.activeMs+=credited;
    if(run.payload.phase==='lesson')this.engine.tick(credited,{visible:true,focused:true});
    if(run.payload.extraPractice?run.activeMs>=ENGLISH_EXTENSION_MS:day.activeMs>=ENGLISH_TARGET_MS){if(this.lessonReady()){this.engine.finish();day.learningComplete=true;}day.fulfilled=true;run.status=this.current()?'partial':'completed';run.endedAt=this.now().toISOString();if(this.current())this.engine.pause(true);}
    this.changed();
  }
  finish(outcome:LearningOutcome){
    const run=this.snapshot();if(!run||run.endedAt)return;const day=this.dayFor(run.dayKey);
    if(outcome==='surrendered'&&day.activeMs<ENGLISH_SURRENDER_MS)throw new Error('«Здатись» доступна після 15 активних хвилин.');
    if((outcome==='completed'||outcome==='partial')&&day.activeMs<ENGLISH_TARGET_MS)throw new Error('Ще є час на повторення до 55 хвилин.');
    run.status=outcome;run.endedAt=this.now().toISOString();if(this.current())this.engine.pause(true);day.dismissed=true;if(day.activeMs>=ENGLISH_TARGET_MS)day.fulfilled=true;this.changed();
  }
  private ensurePractice(){
    const run=this.snapshot();if(!run||run.payload.practice?.presentationVersion===3)return;
    const record=[...this.document.course.sessions].reverse().find(s=>s.lessonId===run.payload.lessonId),lesson=(Learning as any).englishLesson(record?.lesson||Course.getLesson(run.payload.lessonId)||Course.lessons[0]) as EnglishLesson,previous=run.payload.practice;
    const next=practiceTask(lesson,record,this.document.course,run.payload.practiceIndex,run.payload.practiceHistory||[],previous?.kind==='word'?previous.answer:undefined);if(lesson.productionMode==='ai-opinion-v1'){const word=lesson.vocabulary[run.payload.practiceIndex%lesson.vocabulary.length];next.kind='production';next.presentationVersion=3;next.wordId=word.en;next.prompt='Use “'+word.en+'” in your own short explanation or opinion about '+lesson.title+'. Give a reason or a concrete example.';}
    if(previous){next.value=previous.value;next.revealed=previous.revealed;next.attempts=previous.attempts;if(previous.result?.scope==='ai')next.result=previous.result;}
    run.payload.practice=next;
  }
  private practiceAction(action:LearningAction){this.ensurePractice();const run=this.snapshot()!,p=run.payload.practice!;
    if(action.type==='answer'){p.value=(action.value||'').slice(0,20000);delete p.result;delete (p as any).aiAssessment;}
    else if(action.type==='hint')p.revealed=true;
    else if(action.type==='check'||action.type==='self'){
      if(p.presentationVersion===3)throw new Error('Use AI feedback for your own response.');if(!p.value.trim())throw new Error('Write an answer first.');const correct=p.kind==='choice'?Number(p.value)===p.correct:normal(p.value)===normal(p.answer);
      p.previousAnswers=[...(p.previousAnswers||[]),p.value].slice(-5);p.result={correct,assisted:p.revealed||p.attempts>0,at:this.now().toISOString(),message:practiceMessage(p,correct)};p.attempts++;
      if(!correct){const id=`practice-${p.answer.toLowerCase().replace(/[^a-z]+/g,'-').slice(0,80)}`;this.document.course.reviews[id]={id,kind:p.kind==='word'?'vocabulary':'grammar',prompt:p.prompt,answer:p.answer,explanation:p.explanation,unresolved:true,intervalIndex:0,dueDay:this.tomorrow(),lastDay:kyivDayKey(this.now()),independent:0,assisted:1};}
    }else if(action.type==='practice-next'){if(!p.result?.correct)throw new Error('Check this answer before moving on.');run.payload.practiceHistory=[...(run.payload.practiceHistory||[]),clone(p)].slice(-100);run.payload.practiceIndex++;run.payload.practice=null;this.ensurePractice();}
    else throw new Error('Невідома дія повторення.');
  }
  private tomorrow(){const date=new Date(this.now());date.setUTCDate(date.getUTCDate()+1);return kyivDayKey(date);}
  view(readonly=false):EnglishView {
    if(this.snapshot()?.payload.phase==='reinforcement')this.ensurePractice();
    const run=this.snapshot(),attempt=this.current(),lesson=attempt?.lesson||Course.getLesson(run?.payload.lessonId)||this.document.course.sessions.at(-1)?.lesson||Course.lessons[0];
    const canAdvance=!!attempt&&this.engine.requirements(),canCompleteLesson=this.lessonReady(),blockStatus=lesson.blocks.map((b:any)=>({id:b.id,title:b.title,done:!!attempt&&(b.id==='summary'?canCompleteLesson:!!this.engine.requirements(b.id))})),currentBlock=attempt?lesson.blocks[attempt.blockIndex]?.id:'',advanceBlocker=!attempt?undefined:currentBlock==='summary'?(!canCompleteLesson?'Щоб завершити урок, закрий незавершені блоки: '+blockStatus.filter((b:any)=>b.id!=='summary'&&!b.done).map((b:any)=>b.title).join(', ')+'.':undefined):!canAdvance?(currentBlock==='listening'&&!(attempt.listens>=1||attempt.listeningUnavailable)?'Щоб перейти далі: прослухай діалог 1 раз до кінця (або натисни «Use text alternative»), дай відповіді у текстових полях і натисни «Check new or edited answers».':'Щоб перейти далі: заповни всі текстові поля цього блоку й перевір їх кнопкою «Check new or edited answers».'):undefined;
    return {revision:this.document.revision,courseVersion:Course.VERSION,lesson,attempt,run,canExtend:this.canExtend(),blockStatus,advanceBlocker,day:clone(this.day()),completedLessons:new Set(this.document.course.sessions.filter(s=>s.status==='completed').map(s=>s.lessonId)).size,totalLessons:84,familiarWords:this.document.course.familiarWords.length,reviewsDue:Object.values(this.document.course.reviews).filter(r=>!!r.dueDay&&r.dueDay<=kyivDayKey(this.now())).length,readonly,canAdvance,canCompleteLesson,canSurrender:this.day().activeMs>=ENGLISH_SURRENDER_MS,canFinish:this.day().fulfilled,exitQuestions:this.exitQuestions(),savedWork:[...(attempt?[attempt]:[]),...this.document.course.sessions.slice(-5).reverse(),...((this.document.course.migration as any)?.manualAdvances||[]).slice(-5).reverse().map((a:any)=>a.attempt)].map(s=>({id:s.id,title:s.lesson.title+((s as any).advancedByRequestAt?' · ручний перехід, незавершено':''),at:s.endedAt||s.startedAt,answers:clone(s.answers),checks:clone(s.languageChecks||{}),assessments:clone((s as any).aiAssessments||{}),coachingPrompt:s.status==='completed'?CoachingLearning.handoffPrompt(s,undefined):undefined})),history:this.document.course.sessions.slice(-20).reverse().map(s=>({id:s.id,title:s.lesson.title,at:s.endedAt||s.startedAt,activeMs:s.activeMs,selfReported:s.attempts.filter(a=>a.selfReported).length,assisted:s.attempts.filter(a=>a.assisted&&!a.selfReported&&!a.ungraded&&a.scope!=='ai').length,independent:s.attempts.filter(a=>a.correct&&!a.assisted&&!a.selfReported&&!a.ungraded).length,listeningUnavailable:!!s.listeningUnavailable}))};
  }
}
