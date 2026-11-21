import {defaultDuration,minuteMs,validDuration} from '../../core/tracks';
import * as CoachingLearning from './vendor/learning';
import * as EngineModule from './vendor/engine';
import * as Course from './vendor/course';
import * as Learning from './vendor/learning';
import {practiceTask,practiceMessage} from './practice';
import {isSpeakingDialogue,type SpeakingDialogue} from './dialogue';
import {kyivDayKey} from '../../core/calendar';
import {envelopeValid,type LearningAction,type LearningController,type LearningEnvelope,type LearningOutcome,type ActivityState} from '../../core/learning';
import type {EnglishDocument,EnglishCourseState,EnglishDay,EnglishRunPayload,EnglishView,EnglishAttempt,EnglishPractice,EnglishChoice,EnglishLanguageReport,EnglishLesson} from './types';
const {Engine,validateImport,normal,defaultState}=EngineModule as any;
export const ENGLISH_TARGET_MS=defaultDuration('english')*minuteMs,ENGLISH_SURRENDER_MS=15*60000,ENGLISH_EXTENSION_MS=30*60000;
export const ENGLISH_REVIEW_LIMIT=3;
const clone=<T>(value:T):T=>structuredClone(value);
export function newEnglishDocument(now=new Date()):EnglishDocument{return {version:2,revision:0,course:defaultState({},now),days:{},runs:[],activeRunId:null};}
export function validateEnglishDocument(value:unknown):EnglishDocument {
  const d=clone(value) as EnglishDocument;
  if(d?.version!==2||!Number.isInteger(d.revision)||d.revision<0||!d.days||typeof d.days!=='object'||!Array.isArray(d.runs)||d.runs.length>10000)throw new Error('Incompatible English progress file.');
  d.course=validateImport(d.course);
  if(d.parkedAttempts!==undefined){
    if(!Array.isArray(d.parkedAttempts)||d.parkedAttempts.length>84||new Set(d.parkedAttempts.map(a=>a?.id)).size!==d.parkedAttempts.length)throw Error('Invalid saved English lessons.');
    d.parkedAttempts=d.parkedAttempts.map(attempt=>validateImport({...d.course,activeSession:attempt,sessions:[]}).activeSession);
  }
  if(d.primaryAttemptId!==undefined&&!d.parkedAttempts?.some(a=>a.id===d.primaryAttemptId))throw Error('Invalid English lesson bookmark.');
  for(const attempt of [d.course.activeSession,...d.course.sessions,...d.parkedAttempts??[]]){
    if(attempt?.liveSpeaking!==undefined&&!isSpeakingDialogue(attempt.liveSpeaking))throw Error('Invalid saved conversation.');
  }
  for(const [day,item] of Object.entries(d.days))if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!item||!Number.isFinite(item.activeMs)||item.activeMs<0||item.activeMs>120*minuteMs||item.targetMinutes!==undefined&&!validDuration('english',item.targetMinutes)||['dismissed','fulfilled','learningComplete'].some(k=>typeof item[k as keyof EnglishDay]!=='boolean'))throw new Error('Invalid daily English progress.');
  for(const run of d.runs)if(!envelopeValid(run)||run.moduleId!=='english'||!run.payload||!['lesson','break','reinforcement'].includes(run.payload.phase)||!Number.isFinite(run.payload.breakRemainingMs)||run.payload.breakRemainingMs<0||run.payload.breakRemainingMs>300000||!Number.isInteger(run.payload.practiceIndex)||run.payload.practiceIndex<0)throw new Error('Invalid English session.');
  for(const {payload:p}of d.runs){if(typeof p.lessonId!=='string'||!Course.getLesson(p.lessonId)||typeof p.breakUsed!=='boolean')throw new Error('Invalid lesson state.');if(p.practice){const r=p.practice;if(!['word','choice','production','sentence'].includes(r.kind)||!['id','prompt','answer','explanation','value'].every(k=>typeof r[k as keyof typeof r]==='string'&&(r[k as keyof typeof r] as string).length<=20000)||typeof r.revealed!=='boolean'||!Number.isInteger(r.attempts)||r.attempts<0||r.options!==undefined&&(!Array.isArray(r.options)||r.options.length>10||!r.options.every(o=>typeof o==='string')))throw new Error('Invalid practice exercise.');}if(p.practiceHistory!==undefined&&(!Array.isArray(p.practiceHistory)||p.practiceHistory.length>100))throw new Error('Invalid practice history.');}
  for(const {payload:p} of d.runs){
    if(p.overtimeBlock!==undefined&&(!Number.isInteger(p.overtimeBlock)||p.overtimeBlock<0||p.overtimeBlock>7||p.phase!=='lesson'))throw Error('Invalid final English block.');
    if(p.revisit!==undefined&&p.revisit!==true)throw Error('Invalid English review state.');
  }
  if(d.activeRunId!==null&&!d.runs.some(r=>r.id===d.activeRunId))throw new Error('No active English session was found.');
  for(const run of d.runs)if(run.payload.extraPractice!==undefined&&(run.payload.extraPractice!==true||run.activeMs>ENGLISH_EXTENSION_MS||run.mode==='daily'||run.payload.phase==='break'))throw new Error('Invalid English extra practice state.');
  return d;
}
export function importEnglishCourse(source:unknown,now=new Date(),targetMinutes=defaultDuration('english')):EnglishDocument {
  const targetMs=targetMinutes*minuteMs;
  const raw=source as any,document=newEnglishDocument(now),course=validateImport(raw?.format==='english-daily-progress'?raw.state:raw?.version===2&&raw.course?raw.course:raw?.learnedWords||raw?.completedMilestones?defaultState(raw,now):raw);
  // Reconstruct learning days from real timestamps, retaining original session data.
  course.completedDays=[...new Set(course.sessions.filter((s:any)=>s.status==='completed').map((s:any)=>kyivDayKey(new Date(s.endedAt||s.startedAt))))];
  document.course=course;document.importedAt=now.toISOString();
  for(const session of course.sessions){const day=kyivDayKey(new Date(session.endedAt||session.startedAt)),entry=document.days[day]??={activeMs:0,dismissed:false,fulfilled:false,learningComplete:false};entry.targetMinutes=targetMinutes;entry.activeMs=Math.min(targetMs,entry.activeMs+session.activeMs);entry.learningComplete=true;entry.fulfilled=entry.activeMs>=targetMs;}
  if(course.activeSession){const s=course.activeSession,day=kyivDayKey(new Date(s.startedAt)),entry=document.days[day]??={activeMs:0,dismissed:false,fulfilled:false,learningComplete:false};entry.targetMinutes=targetMinutes;entry.activeMs=Math.min(targetMs,entry.activeMs+s.activeMs);entry.fulfilled=entry.activeMs>=targetMs;}
  return document;
}
export class EnglishController implements LearningController {
  document:EnglishDocument;private engine:any;
  constructor(state:unknown=newEnglishDocument(),private now:()=>Date=()=>new Date(),private configuredMinutes=()=>defaultDuration('english')){
    this.document=validateEnglishDocument(state);const adapter={getItem:(key:string)=>key==='english_daily_v1'?JSON.stringify(this.document.course):null,setItem:(key:string,value:string)=>{if(key==='english_daily_v1')this.document.course=JSON.parse(value);}};
    this.engine=new Engine(adapter,this.now,kyivDayKey);
    // The desktop host owns atomic persistence. Avoid serialising the whole
    // course history on every keypress inside the browser-oriented engine.
    this.engine.save=()=>{this.document.course=this.engine.state;return this.engine.state;};
  }
  snapshot(){return this.document.runs.find(r=>r.id===this.document.activeRunId)||null;}
  private current(){return this.engine.current() as EnglishAttempt|null;}
  acceptSpeakingDialogue(next:SpeakingDialogue){
    const attempt=this.current(),run=this.snapshot();
    if(!attempt||run?.status!=='active'||run?.payload.phase!=='lesson'||attempt.lesson.blocks[attempt.blockIndex]?.id!=='speaking')throw Error('Open the Speaking block first.');
    if(!isSpeakingDialogue(next)||next.turn!==(attempt.liveSpeaking?.turn??0)+1||attempt.liveSpeaking?.status==='ready')throw Error('The conversation changed.');
    attempt.liveSpeaking=next;
    this.reachBoundary();this.changed();
  }
  private dayFor(key:string){return this.document.days[key]??={activeMs:0,dismissed:false,fulfilled:false,learningComplete:false};}
  day(){return this.dayFor(kyivDayKey(this.now()));}
  private targetMs(day=this.day()){return (day.targetMinutes??this.configuredMinutes())*minuteMs;}
  private changed(){this.document.course=this.engine.state;this.document.revision++;const run=this.snapshot();if(run)run.revision++;}
  private archives():EnglishAttempt[]{return ((this.document.course.migration as any)?.manualAdvances||[]).map((entry:any)=>entry.attempt);}
  private park(attempt:EnglishAttempt){
    attempt.paused=true;
    this.document.parkedAttempts=[...(this.document.parkedAttempts||[]).filter(a=>a.id!==attempt.id),attempt];
  }
  private restorePrimary(){
    if(this.document.primaryAttemptId===undefined)return;
    const id=this.document.primaryAttemptId,current=this.current();
    if(current&&current.id!==id)this.park(current);
    this.engine.state.activeSession=this.document.parkedAttempts?.find(a=>a.id===id)??null;
    this.document.parkedAttempts=this.document.parkedAttempts?.filter(a=>a.id!==id);
    delete this.document.primaryAttemptId;
  }
  private firstUnfinished(){
    const index=Course.BLOCKS.findIndex((block:any)=>block.id==='summary'||!this.engine.requirements(block.id));
    return Math.max(0,index);
  }
  private createRun(mode:'daily'|'practice'|'demo',lessonId:string,phase:EnglishRunPayload['phase']){
    const now=this.now();
    const run:LearningEnvelope<EnglishRunPayload>={version:2,id:`en-${now.getTime()}-${Math.random().toString(36).slice(2,9)}`,moduleId:'english',contentVersion:Course.VERSION,dayKey:kyivDayKey(now),revision:0,mode,status:'active',startedAt:now.toISOString(),activeMs:0,payload:{phase,lessonId,breakRemainingMs:0,breakUsed:false,practiceIndex:0,practice:null}};
    this.document.runs.push(run);this.document.activeRunId=run.id;
    return run;
  }
  start(mode:'daily'|'practice'|'demo'='practice'){
    const day=this.day(),key=kyivDayKey(this.now()),old=this.snapshot();
    if(day.fulfilled||mode==='daily'&&day.dismissed)return;
    if(old&&old.dayKey===key&&!old.endedAt&&!old.payload.revisit&&!old.payload.extraPractice){
      day.targetMinutes??=defaultDuration('english');
      old.status='active';if(this.current()&&old.payload.phase==='lesson')this.engine.pause(false);
      if(old.payload.phase==='reinforcement'){
        if(old.payload.practiceIndex>=ENGLISH_REVIEW_LIMIT)this.closeRun(old,'completed');
        else this.ensurePractice();
      }else this.reachBoundary();
      this.changed();return;
    }
    if(old&&!old.endedAt){old.status='partial';old.endedAt=this.now().toISOString();}
    this.restorePrimary();
    const existing=this.current(),attempt=existing||this.engine.start();
    if(!attempt){day.fulfilled=true;this.changed();return;}
    if(existing&&old?.dayKey!==key)attempt.blockIndex=this.firstUnfinished();
    day.targetMinutes=this.configuredMinutes();
    const run=this.createRun(mode,attempt.lessonId,'lesson');
    if(old&&old.payload.lessonId===attempt.lessonId)run.payload.breakUsed=old.payload.breakUsed;
    this.engine.pause(false);this.reachBoundary();this.changed();
  }
  startSavedLesson(lessonId:string,mode:'practice'|'demo'){
    const old=this.snapshot(),current=this.current();
    if(old&&!old.endedAt&&old.status==='active')throw Error('Save the active session first.');
    if(this.document.course.sessions.some(a=>a.lessonId===lessonId&&a.status==='completed'))throw Error('Open the completed lesson to see its saved answers.');
    if(!current||current.lessonId!==lessonId){
      const saved=this.document.parkedAttempts?.find(a=>a.lessonId===lessonId)||this.archives().find(a=>a.lessonId===lessonId);
      if(!saved)throw Error('This unfinished lesson is unavailable.');
      if(current&&!this.document.primaryAttemptId){this.park(current);this.document.primaryAttemptId=current.id;}
      else if(current)this.park(current);
      this.engine.state.activeSession=clone(saved);
      this.document.parkedAttempts=this.document.parkedAttempts?.filter(a=>a.id!==saved.id);
      if(this.document.primaryAttemptId===saved.id)delete this.document.primaryAttemptId;
      this.current()!.resumedFromArchive=true;
    }
    if(old&&!old.endedAt){old.status='partial';old.endedAt=this.now().toISOString();}
    const attempt=this.current()!;
    attempt.blockIndex=this.firstUnfinished();
    this.createRun(mode,attempt.lessonId,'lesson').payload.revisit=true;
    this.engine.pause(false);this.changed();
  }
  canExtend(){
    const run=this.snapshot(),today=kyivDayKey(this.now());
    return !!run&&run.dayKey===today&&!!this.document.days[today]?.fulfilled&&
      (run.payload.extraPractice?!run.endedAt&&run.status==='paused':!!run.endedAt);
  }
  startExtension(mode:'practice'|'demo'='practice'){
    const old=this.snapshot();
    if(!old||!this.canExtend())throw Error('Extra practice is available after today’s English session.');
    if(old.payload.extraPractice){
      old.status='active';
    }else{
      const attempt=this.current(),now=this.now();
      const run:LearningEnvelope<EnglishRunPayload>={version:2,id:`en-extra-${now.getTime()}-${Math.random().toString(36).slice(2,9)}`,moduleId:'english',contentVersion:old.contentVersion,dayKey:old.dayKey,revision:0,mode,status:'active',startedAt:now.toISOString(),activeMs:0,payload:{
        phase:attempt?.lessonId===old.payload.lessonId?'lesson':'reinforcement',lessonId:old.payload.lessonId,breakRemainingMs:0,breakUsed:true,extraPractice:true,practiceIndex:old.payload.practiceIndex,practice:null,
      }};
      this.document.runs.push(run);this.document.activeRunId=run.id;
    }
    if(this.snapshot()?.payload.phase==='lesson')this.engine.pause(false);else this.ensurePractice();
    this.changed();
  }
  pause(){const run=this.snapshot();if(run&&!run.endedAt){run.status='paused';if(this.current())this.engine.pause(true);this.changed();}}
  private question(key:string):EnglishChoice|null {const s=this.current();if(!s)return null;const match=/^(reading|listening|grammar)-(\d+)$/.exec(key);if(!match)return null;const index=Number(match[2]);return match[1]==='grammar'?s.lesson.grammar.exercises[index]||null:s.lesson[match[1] as 'reading'|'listening'].questions[index]||null;}
  exitQuestions(){const s=this.current();if(!s||s.lesson.productionMode==='ai-opinion-v1')return [];return [...s.lesson.vocabulary.slice(3).map((v,i)=>{const task=(Learning as any).wordTask(v);return {key:`exit-${i}`,prompt:`${task.prompt}\nClue: ${task.clue}\nType ONE word or phrase.`,kind:'word' as const,answer:v.en};}),...s.lesson.grammar.exercises.slice(0,2).map((q,i)=>{const options=[...q.options.slice(1),q.options[0]];return {key:`exit-${i+3}`,prompt:q.prompt,kind:'choice' as const,answer:q.options[q.correct],options,correct:options.indexOf(q.options[q.correct])};})];}
  languageTarget(key:string,attemptId?:string){
    if(!/^(vocab-example|vocab-\d+|reading-\d+|listening-\d+|grammar-\d+|retell|monologue|turn-[0-2]|retry|writing|review-\d+)$/.test(key))throw new Error('This field does not use the language checker.');
    const active=this.current(),attempt=attemptId?[active,...this.document.course.sessions,...this.document.parkedAttempts??[],...this.archives()].find(s=>s?.id===attemptId):active;
    if(!attempt)throw new Error('This saved answer is not available.');const text=attempt.answers[key];if(!text?.trim())throw new Error('Write your English answer before checking it.');
    if(/^\[(Локальний аудіозапис|Local audio recording)/.test(text))throw new Error('Your recording is saved. Type what you said to check its wording; audio is not automatically transcribed.');
    return {attemptId:attempt.id,key,text};
  }
  assessmentBundle(area:string){if(area==='practice'){const p=this.snapshot()?.payload.practice;if(!p?.value.trim())throw new Error('Write your own practice response first.');return {area,answers:[{key:'practice',task:p.prompt,text:p.value}]};}const s=this.current();if(!s)throw new Error('Resume a lesson first.');return (Learning as any).assessmentBundle(s,area);}
  acceptAI(a:any){if(a.area==='practice'){const p=this.snapshot()!.payload.practice!,bundle=this.assessmentBundle('practice');if(a.snapshot!==JSON.stringify(bundle.answers.map((r:any)=>[r.key,r.text])))throw new Error('Practice draft changed. Submit it again.');(p as any).aiAssessment=a;p.result={correct:a.passed,assisted:p.revealed||p.attempts>0,scope:'ai',at:a.checkedAt,message:a.answers[0].summary};p.attempts++;}else this.engine.acceptAI(a);this.reachBoundary();this.changed();}
  acceptLanguageCheck(key:string,report:EnglishLanguageReport){this.engine.acceptLanguageCheck(key,report);this.reachBoundary();this.changed();}
  reviewLanguageFlags(key:string){const s=this.current(),report=s?.languageChecks?.[key];if(!s||!report||report.text!==s.answers[key])throw new Error('Check the current answer first.');report.reviewed=true;report.ignored=true;this.engine.acceptLanguageCheck(key,report);this.reachBoundary();this.changed();}
  private lessonReady(){return !!this.current()&&Course.BLOCKS.every((b:any)=>this.engine.requirements(b.id))&&this.exitQuestions().every(q=>this.current()!.results[q.key]?.correct);}
  dispatch(action:LearningAction){
    const run=this.snapshot();
    if(action.type==='save-and-exit'){this.finish(run?.payload.phase==='reinforcement'?'completed':'partial');return;}
    // Flush an input event that was already in flight when the host paused or
    // reached its budget. It changes no time and awards no completion credit.
    if(run&&action.type==='answer'&&(run.status==='paused'||!!run.endedAt&&this.now().getTime()-Date.parse(run.endedAt)<=10000)){
      const key=action.key||'';if(!key||['__proto__','prototype','constructor'].includes(key)||key.length>150||(action.value||'').length>20000)throw new Error('Invalid answer.');
      if(run.payload.phase==='lesson'&&this.current()?.lessonId===run.payload.lessonId)this.engine.setAnswer(key,action.value||'',action.flag?'voice':'typed');else if(run.payload.practice){run.payload.practice.value=action.value||'';delete run.payload.practice.result;}this.changed();return;
    }
    if(!run||run.endedAt||run.status!=='active')throw new Error('There is no active English session.');
    if(action.type==='skip-break'){if(run.payload.phase!=='break')return;run.payload.breakRemainingMs=0;run.payload.phase='lesson';this.engine.pause(false);this.changed();return;}
    if(run.payload.phase==='break')throw new Error('You are on a break. You can resume now.');
    if(run.payload.phase==='reinforcement'){this.practiceAction(action);this.changed();return;}
    const s=this.current();if(!s)throw new Error('Lesson unavailable.');
    if(run.payload.overtimeBlock!==undefined&&['select-block','previous'].includes(action.type))throw Error('Finish this block or save and exit.');
    const key=action.key||'';
    if(key.length>150||action.value&&action.value.length>20000)throw new Error('The answer is too long.');
    if(['__proto__','prototype','constructor'].includes(key))throw new Error('Invalid answer key.');
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
        else if(q)this.engine.checkChoice(key,q);else throw new Error('You can check this answer against the model.');break;
      }
      case 'self':{
        if(s.lesson.productionMode==='ai-opinion-v1'||s.lesson.guidedTasks?.version===1)throw new Error('Self-reported checks cannot complete guided tasks.');
        const allowed=/^(review-\d+|vocab-example|retell|speaking-reflection|writing-check-[0-2])$/.test(key);if(!allowed)throw new Error('Unknown criterion.');
        if(!action.flag){delete s.results[key];this.engine.save();break;}
        const answerKey=key==='speaking-reflection'?'retry':key.startsWith('writing-check')?'writing':key;
        if(!s.answers[answerKey]?.trim())throw new Error('Add your answer or recording first.');
        if(key==='vocab-example'&&s.lesson.vocabulary.filter(v=>normal(s.answers[key]).includes(normal(v.en))).length<2)throw new Error('Use at least two of today’s phrases.');
        this.engine.grade(key,true,{selfReported:true,assisted:true});s.results[key].selfReported=true;break;
      }
      case 'self-feedback':{
        if(s.lesson.guidedTasks?.version===1)throw new Error('Complete the guided tasks; free feedback does not award task credit.');
        const area=action.area;if(area!=='speaking'&&area!=='writing')throw new Error('Unknown section.');if(!s.answers[area==='speaking'?'monologue':'writing']?.trim())throw new Error('Add your answer first.');
        const corrections=s.answers['correction-original']?.trim()&&s.answers['correction-improved']?.trim()?[{original:s.answers['correction-original'],improved:s.answers['correction-improved'],explanation:'Your revision after comparing it with the model.'}]:[];
        s.feedback[area]={source:'self',summary:'You checked your meaning against the model. Grammar and pronunciation were not graded.',corrections,rewrite:'',skills:null};this.engine.save();break;
      }
      case 'listen-complete':s.listens++;this.engine.save();break;
      case 'transcript':s.transcriptVisible=true;this.engine.save();break;
      case 'audio-unavailable':s.listeningUnavailable=true;s.transcriptVisible=true;this.engine.save();break;
      case 'previous':this.engine.previous();break;
      case 'advance':{const before=s.blockIndex;if(run.payload.overtimeBlock!==undefined){if(!this.engine.requirements())throw Error('Finish this block or save and exit.');this.reachBoundary();break;}this.engine.advance();if(before===3&&!run.payload.breakUsed){run.payload.breakUsed=true;run.payload.breakRemainingMs=5*60000;run.payload.phase='break';this.engine.pause(true);}break;}
      case 'complete-lesson':{
        if(!this.lessonReady())throw new Error('Finish the sections and the final check.');
        this.completeLesson(run);
        if(run.payload.revisit||run.payload.extraPractice||this.day().activeMs>=this.targetMs())this.closeRun(run,'completed');
        else{run.payload.phase='reinforcement';this.ensurePractice();}
        break;
      }
      default:throw new Error('Unknown English action.');
    }this.reachBoundary();this.changed();
  }
  private completeLesson(run:LearningEnvelope<EnglishRunPayload>){
    this.engine.finish();
    if(!run.payload.revisit&&!run.payload.extraPractice)this.dayFor(run.dayKey).learningComplete=true;
  }
  private closeRun(run:LearningEnvelope<EnglishRunPayload>,outcome:LearningOutcome){
    run.status=outcome;run.endedAt=this.now().toISOString();
    const attempt=this.current();
    if(attempt&&run.payload.phase!=='reinforcement'){
      attempt.blockIndex=this.firstUnfinished();
      this.engine.pause(true);
    }
    if(run.payload.revisit){this.restorePrimary();return;}
    if(run.payload.extraPractice)return;
    const day=this.dayFor(run.dayKey);
    day.dismissed=true;
    day.fulfilled=outcome==='completed'||day.activeMs>=this.targetMs(day);
  }
  private reachBoundary(){
    const run=this.snapshot(),attempt=this.current();
    if(!run||run.endedAt||run.status!=='active'||!attempt||run.payload.phase!=='lesson'||run.payload.extraPractice||run.payload.revisit||this.dayFor(run.dayKey).activeMs<this.targetMs(this.dayFor(run.dayKey)))return;
    const block=run.payload.overtimeBlock??attempt.blockIndex;
    const ready=block===Course.BLOCKS.length-1?this.lessonReady():this.engine.requirements(Course.BLOCKS[block].id);
    if(!ready){run.payload.overtimeBlock=block;return;}
    if(this.lessonReady()){this.completeLesson(run);this.closeRun(run,'completed');}
    else this.closeRun(run,'partial');
  }
  tick(milliseconds:number,activity:ActivityState){
    const run=this.snapshot();if(!run||run.endedAt||run.status!=='active')return;
    if(run.dayKey!==kyivDayKey(this.now())){this.closeRun(run,'partial');this.changed();return;}
    if(!activity.active||activity.waiting)return;
    const delta=Math.max(0,Math.min(milliseconds,5000));if(!delta)return;
    if(run.payload.phase==='break'){run.payload.breakRemainingMs=Math.max(0,run.payload.breakRemainingMs-delta);if(!run.payload.breakRemainingMs){run.payload.phase='lesson';this.engine.pause(false);this.reachBoundary();}this.changed();return;}
    const day=this.day(),extra=run.payload.extraPractice||run.payload.revisit;
    const credited=extra?Math.min(delta,Math.max(0,ENGLISH_EXTENSION_MS-run.activeMs)):delta;
    if(!extra)day.activeMs=Math.max(day.activeMs,Math.min(this.targetMs(day),day.activeMs+credited));
    run.activeMs+=credited;
    if(run.payload.phase==='lesson')this.engine.tick(credited,{visible:true,focused:true});
    if(extra&&run.activeMs>=ENGLISH_EXTENSION_MS){if(run.payload.phase==='lesson'&&this.lessonReady())this.completeLesson(run);this.closeRun(run,run.payload.phase==='lesson'&&this.current()?'partial':'completed');}
    else this.reachBoundary();
    this.changed();
  }
  finish(outcome:LearningOutcome){
    const run=this.snapshot();if(!run||run.endedAt)return;const day=this.dayFor(run.dayKey);
    if(outcome==='surrendered'&&day.activeMs<ENGLISH_SURRENDER_MS)throw new Error('“Finish early” is available after 15 active minutes.');
    if((outcome==='completed'||outcome==='partial')&&!(run.payload.phase==='reinforcement'||run.payload.overtimeBlock!==undefined||run.payload.revisit||run.payload.extraPractice))throw new Error('Finish the lesson or use “Finish early”.');
    if(outcome==='completed'&&run.payload.phase!=='reinforcement')throw new Error('Save this lesson as unfinished.');
    this.closeRun(run,outcome);this.changed();
  }
  private ensurePractice(){
    const run=this.snapshot();if(!run||run.endedAt||run.payload.practice?.presentationVersion===2)return;
    const record=[...this.document.course.sessions].reverse().find(s=>s.lessonId===run.payload.lessonId);
    const lesson=(Learning as any).englishLesson(record?.lesson||Course.getLesson(run.payload.lessonId)||Course.lessons[0]) as EnglishLesson;
    // Keep the previous run's open response in the persisted history when migrating it.
    if(run.payload.practice?.value)run.payload.practiceHistory=[...(run.payload.practiceHistory||[]),clone(run.payload.practice)].slice(-100);
    run.payload.practice=practiceTask(lesson,record,this.document.course,run.payload.practiceIndex,run.payload.practiceHistory||[]);
  }
  private practiceAction(action:LearningAction){this.ensurePractice();const run=this.snapshot()!,p=run.payload.practice!;
    if(action.type==='answer'){p.value=(action.value||'').slice(0,20000);delete p.result;delete (p as any).aiAssessment;}
    else if(action.type==='hint')p.revealed=true;
    else if(action.type==='check'||action.type==='self'){
      if(p.presentationVersion===3)throw new Error('Use AI feedback for your own response.');if(!p.value.trim())throw new Error('Write an answer first.');const correct=p.kind==='choice'?Number(p.value)===p.correct:normal(p.value)===normal(p.answer);
      p.previousAnswers=[...(p.previousAnswers||[]),p.value].slice(-5);p.result={correct,assisted:p.revealed||p.attempts>0,at:this.now().toISOString(),message:practiceMessage(p,correct)};p.attempts++;
      if(!correct){const id=`practice-${p.answer.toLowerCase().replace(/[^a-z]+/g,'-').slice(0,80)}`;this.document.course.reviews[id]={id,kind:p.kind==='word'?'vocabulary':'grammar',prompt:p.prompt,answer:p.answer,explanation:p.explanation,unresolved:true,intervalIndex:0,dueDay:this.tomorrow(),lastDay:kyivDayKey(this.now()),independent:0,assisted:1};}
    }else if(action.type==='practice-next'){if(!p.result?.correct)throw new Error('Check this answer before moving on.');run.payload.practiceHistory=[...(run.payload.practiceHistory||[]),clone(p)].slice(-100);run.payload.practiceIndex++;run.payload.practice=null;if(!run.payload.extraPractice&&run.payload.practiceIndex>=ENGLISH_REVIEW_LIMIT)this.closeRun(run,'completed');else this.ensurePractice();}
    else throw new Error('Unknown review action.');
  }
  private savedAttempts(){
    const attempts=[this.current(),...this.document.course.sessions.slice().reverse(),...this.document.parkedAttempts??[],...this.archives()].filter((a):a is EnglishAttempt=>!!a);
    return attempts.filter((a,i)=>attempts.findIndex(other=>other.id===a.id)===i);
  }
  private topics():NonNullable<EnglishView['topics']>{
    const attempts=this.savedAttempts(),next=this.engine.nextLesson();
    return (Course.lessons as EnglishLesson[]).flatMap(lesson=>{
      const record=attempts.find(a=>a.lessonId===lesson.id);
      if(!record&&next?.id!==lesson.id)return [];
      const status=record?.status==='completed'?'complete':record===this.current()?'active':record?'unfinished':'next';
      return [{lessonId:lesson.id,number:lesson.number,title:lesson.title,status,attemptId:record?.id}];
    });
  }
  private savedTasks(attempt:EnglishAttempt){
    const tasks:Record<string,string>={};
    for(const area of ['review','vocabulary','reading','listening','grammar','speaking','writing']){
      try{for(const row of (Learning as any).assessmentBundle(attempt,area).answers)tasks[row.key]=row.task;}catch{/* A block can be entirely unanswered. */}
    }
    const l=attempt.lesson;
    attempt.reviews.forEach((q,i)=>tasks['review-'+i]??=q.prompt);
    l.vocabulary.forEach((w,i)=>tasks['vocab-'+i]??=w.conceptPrompt||w.definition||w.en);
    for(const area of ['reading','listening'] as const)l[area].questions.forEach((q,i)=>tasks[area+'-'+i]??=q.openPrompt||q.prompt);
    l.grammar.exercises.forEach((q,i)=>tasks['grammar-'+i]??=q.openPrompt||q.prompt);
    return {retell:l.reading.retell,writing:l.writing.prompt,monologue:l.speaking.prompt,retry:l.speaking.retry,...tasks};
  }
  private tomorrow(){const date=new Date(this.now());date.setUTCDate(date.getUTCDate()+1);return kyivDayKey(date);}
  courseProgress(){
    const completed=new Set(this.document.course.sessions.filter(s=>s.status==='completed').map(s=>s.lessonId));
    const lessons=Course.lessons as EnglishLesson[];
    return {done:lessons.filter(lesson=>completed.has(lesson.id)).length,total:lessons.length};
  }
  view(readonly=false):EnglishView {
    const run=this.snapshot(),attempt=this.current(),lesson=attempt?.lesson||Course.getLesson(run?.payload.lessonId)||this.document.course.sessions.at(-1)?.lesson||Course.lessons[0];
    const canAdvance=!!attempt&&this.engine.requirements(),canCompleteLesson=this.lessonReady(),blockStatus=lesson.blocks.map((b:any)=>({id:b.id,title:b.title,done:!!attempt&&(b.id==='summary'?canCompleteLesson:!!this.engine.requirements(b.id))})),currentBlock=attempt?lesson.blocks[attempt.blockIndex]?.id:'',advanceBlocker=!attempt?undefined:currentBlock==='summary'?(!canCompleteLesson?'To finish the lesson, complete these sections: '+blockStatus.filter((b:any)=>b.id!=='summary'&&!b.done).map((b:any)=>b.title).join(', ')+'.':undefined):!canAdvance?(currentBlock==='speaking'&&lesson.productionMode==='ai-opinion-v1'?'Continue the conversation until you reach its goal.':currentBlock==='listening'&&!(attempt.listens>=1||attempt.listeningUnavailable)?'Listen to the dialogue once or use the text alternative. Fill in each answer and select “Check new or edited answers”.':'Fill in the answers in this section, then select “Check new or edited answers”.'):undefined;
    const progress=this.courseProgress();
    return {revision:this.document.revision,targetMs:this.targetMs(),courseVersion:Course.VERSION,lesson,attempt,run,canExtend:this.canExtend(),blockStatus,advanceBlocker,day:clone(this.day()),completedLessons:progress.done,totalLessons:progress.total,familiarWords:this.document.course.familiarWords.length,reviewsDue:Object.values(this.document.course.reviews).filter(r=>!!r.dueDay&&r.dueDay<=kyivDayKey(this.now())).length,readonly,canAdvance,canCompleteLesson,canSurrender:this.day().activeMs>=ENGLISH_SURRENDER_MS,canFinish:!!run&&!run.endedAt&&(run.payload.overtimeBlock!==undefined||run.payload.phase==='reinforcement'||!!run.payload.revisit),exitQuestions:this.exitQuestions(),topics:run?.status==='active'&&!run.endedAt?undefined:this.topics(),savedWork:run?.status==='active'&&!run.endedAt?undefined:this.savedAttempts().map(s=>({id:s.id,liveSpeaking:s.liveSpeaking,title:s.lesson.title+(s.advancedByRequestAt&&s.status!=='completed'&&!s.resumedFromArchive?' · skipped at your request, unfinished':''),at:s.endedAt||s.startedAt,tasks:this.savedTasks(s),answers:clone(s.answers),checks:clone(s.languageChecks||{}),assessments:clone((s as any).aiAssessments||{}),coachingPrompt:s.status==='completed'?CoachingLearning.handoffPrompt(s,undefined):undefined})),history:this.document.course.sessions.slice(-20).reverse().map(s=>({id:s.id,title:s.lesson.title,at:s.endedAt||s.startedAt,activeMs:s.activeMs,selfReported:s.attempts.filter(a=>a.selfReported).length,assisted:s.attempts.filter(a=>a.assisted&&!a.selfReported&&!a.ungraded&&a.scope!=='ai').length,independent:s.attempts.filter(a=>a.correct&&!a.assisted&&!a.selfReported&&!a.ungraded).length,listeningUnavailable:!!s.listeningUnavailable}))};
  }
}
