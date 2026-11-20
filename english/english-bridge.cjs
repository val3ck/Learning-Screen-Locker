const aiServices=new Map();
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {EnglishRepository,Conflict}=require('./english-repository.cjs');
function dayKey(date=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));const d=new Date(Date.UTC(+p.year,+p.month-1,+p.day));if(+p.hour<5)d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);}
const target=55*60000;const grammarCheckers=new Map();
function validateDocument(value,E){if(value?.version!==2||!Number.isInteger(value.revision)||value.revision<0||!value.days||!Array.isArray(value.runs)||value.runs.length>10000)throw new Conflict('Несумісне збереження English.',400);const next=structuredClone(value);next.course=E.validateImport(next.course);for(const [key,day]of Object.entries(next.days))if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!Number.isFinite(day.activeMs)||day.activeMs<0||day.activeMs>target)throw new Conflict('Некоректний час English.',400);return next;}
function createDefault(E,C){return {version:2,revision:0,course:E.defaultState(),days:{},runs:[],activeRunId:null};}
function totalMs(course){return [...course.sessions,...(course.activeSession?[course.activeSession]:[])].reduce((n,s)=>n+s.activeMs,0);}
function mergeCourse(previous,incoming){
  const next=structuredClone(previous),sessions=new Map(previous.sessions.map(s=>[s.mode==='course'?s.lessonId:s.id,s]));
  for(const s of incoming.sessions){const key=s.mode==='course'?s.lessonId:s.id,old=sessions.get(key);if(!old||s.attempts.length>old.attempts.length)sessions.set(key,s);}
  next.sessions=[...sessions.values()].sort((a,b)=>a.startedAt.localeCompare(b.startedAt));
  next.completedDays=[...new Set(next.sessions.map(s=>dayKey(new Date(s.endedAt||s.startedAt))))];next.xp=next.sessions.length*100;
  if(!next.activeSession&&incoming.activeSession&&!next.sessions.some(s=>s.lessonId===incoming.activeSession.lessonId&&s.mode==='course'))next.activeSession=incoming.activeSession;
  else if(next.activeSession&&incoming.activeSession&&next.activeSession.id===incoming.activeSession.id&&incoming.activeSession.activeMs>next.activeSession.activeMs)next.activeSession=incoming.activeSession;
  for(const [id,item]of Object.entries(incoming.reviews))if(!next.reviews[id]||(item.lastDay||'')>(next.reviews[id].lastDay||''))next.reviews[id]=item;
  const manual=new Map([...(incoming.migration?.manualAdvances||[]),...(next.migration?.manualAdvances||[])].map(a=>[a.lessonId,a]));if(manual.size){next.migration={...next.migration,manualAdvances:[...manual.values()]};if(next.activeSession&&[...manual.values()].some(a=>a.attempt.id===next.activeSession.id))next.activeSession=null;if(!next.activeSession&&incoming.activeSession&&![...manual.values()].some(a=>a.attempt.id===incoming.activeSession.id)&&!next.sessions.some(s=>s.mode==='course'&&s.lessonId===incoming.activeSession.lessonId))next.activeSession=incoming.activeSession;}
  next.legacy={...next.legacy,...incoming.legacy,learnedWords:{...next.legacy.learnedWords,...incoming.legacy.learnedWords}};const words=new Map([...incoming.familiarWords,...next.familiarWords].map(w=>[w.id,w]));next.familiarWords=[...words.values()];return next;
}
async function handle(route,method,body,{root,statisticsPath,env=statisticsPath?{}:process.env}){
  try{
    const E=require(path.join(root,'js/daily/engine.js')),C=require(path.join(root,'js/daily/course.js'));
    let config={};
    try{config=JSON.parse(fs.readFileSync(path.join(root,'recall-config.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
    if(statisticsPath)config.statisticsPath=statisticsPath;
    config.checkerPath ||= path.resolve(root,'../recall/resources/english-checker');
    if(typeof config.statisticsPath!=='string'||!path.isAbsolute(config.statisticsPath))throw new Conflict('Recall не налаштовано.',503);
    const repo=new EnglishRepository(path.join(config.statisticsPath,'modules','english'),{validate:d=>validateDocument(d,E),createDefault:()=>createDefault(E,C)});
    const owner=typeof body.owner==='string'&&/^browser-[\w-]{5,100}$/.test(body.owner)?body.owner:'browser-readonly';
    if(route==='/api/recall/status'&&method==='GET')return {status:200,body:{recall:true,moduleId:'english',version:1}};
    if(route==='/api/recall/state'&&method==='GET'){const document=repo.read();return {status:200,body:{version:1,revision:document.revision,course:document.course,days:document.days,readonly:!!repo.lease(),owner:repo.lease()?.owner||null}};}

    if(route.startsWith('/api/recall/ai/')){
      let ai=aiServices.get(config.statisticsPath);if(!ai){ai=new(require('./english-ai.cjs').EnglishAI)({statisticsPath:config.statisticsPath,legacyConfigPath:statisticsPath?undefined:path.join(root,'.english-daily-private.json'),env});aiServices.set(config.statisticsPath,ai);}const action=route.split('/').pop();
      if(action==='settings')return {status:200,body:{settings:method==='POST'?ai.save(body):ai.settings()}};
      if(action==='translate'){ai.dictionary??=new(require('./english-translation.cjs').EnglishTranslation)({root:config.statisticsPath,ai,glossary:C.lessons.flatMap(l=>l.vocabulary)});return {status:200,body:await ai.dictionary.handle(body)};}
      if(action==='models')return {status:200,body:{models:await ai.models(body.provider)}};
      if(repo.readonly(owner))throw new Conflict('The lesson is open in another interface.');
      const d=repo.read(),s=d.course.activeSession,l=s?.lesson||C.getLesson(d.course.sessions.at(-1)?.lessonId)||C.lessons[0];
      if(action==='voice'){const turns=body.kind==='word'?[{speaker:'Narrator',text:l.vocabulary[body.index]?.en}]:body.kind==='model'?[{speaker:'Narrator',text:l.speaking.model}]:l.listening.dialogue;return {status:200,body:await ai.voice(turns)};}
      if(!s)throw new Conflict('Resume your lesson first.');const area=body.area||s.lesson.blocks[s.blockIndex].id;
      if(action==='transcribe'){const transcripts={};for(const key of ['monologue','turn-0','turn-1','turn-2','retry']){const clip=repo.loadAudio(s.id+':'+key);if(clip){try{transcripts[key]=(await ai.transcribe({audio:clip.base64,mimeType:clip.mime})).transcript;}catch(e){transcripts[key]={text:'',error:e.message,provider:'none',confirmed:false};}}}return {status:200,body:{transcripts}};}
      const P=require('./english-ai-prompts.cjs'),Coaching=require('./english-coaching.cjs'),items=C.learning.areaItems(s,area),bundle=P.context(l,area,items.map(a=>({...a,text:s.answers[a.key]||''})));
      if(action==='grade'){C.learning.assessmentBundle(s,area);return {status:200,body:await ai.grade(bundle)};}
      if(action==='hint')return {status:200,body:await ai.hint(Coaching.tutorContext(bundle,s,body.targetKey),body.question)};
      if(action==='conclusion'){bundle.evidenceMode=['grammar','listening'].includes(area)?'closed-choice':'original-responses';bundle.listeningUnavailable=!!s.listeningUnavailable;return {status:200,body:await ai.conclude(bundle,Coaching.summaryRows(bundle,s))};}throw new Conflict('Unknown AI action.',400);
    }

    if(method!=='POST')throw new Conflict('Метод не підтримується.',405);
    if(route==='/api/recall/grammar'){if(typeof body.text!=='string'||body.text.length>12000)throw new Conflict('Invalid English text.',400);let checker=grammarCheckers.get(config.checkerPath);if(!checker){checker=new(require('./english-language.cjs').OfflineEnglishChecker)({root:config.checkerPath});grammarCheckers.set(config.checkerPath,checker);}return {status:200,body:{report:await checker.check(body.text)}};}
    if(route==='/api/recall/release'){repo.release(owner);return {status:200,body:{ok:true}};}
    if(route==='/api/recall/heartbeat'){repo.renew(owner);return {status:200,body:{ok:true}};}
    if(route==='/api/recall/audio-read'){return {status:200,body:{audio:repo.loadAudio(body.key)}};}
    if(route==='/api/recall/audio'){repo.acquire(owner);if(typeof body.base64!=='string'||body.base64.length>14000000||!/^[A-Za-z0-9+/=\r\n]+$/.test(body.base64))throw new Conflict('Некоректний аудіозапис.',400);repo.saveAudio(body.key,Buffer.from(body.base64,'base64'),body.mime,owner);return {status:200,body:{ok:true}};}
    if(route!=='/api/recall/state')throw new Conflict('Не знайдено.',404);
    repo.acquire(owner);
    const current=repo.read();if(body.revision!==current.revision)throw new Conflict('Є новіший прогрес. Онови стан.');
    const incoming=E.validateImport(body.course),before=totalMs(current.course),wasEmpty=!current.course.sessions.length&&!current.course.activeSession;
    if(body.import){repo.backup(current,'before-import');repo.backup(incoming,'incoming');current.course=mergeCourse(current.course,incoming);}
    else current.course=incoming;
    const today=dayKey(),day=current.days[today]??={activeMs:0,dismissed:false,fulfilled:false,learningComplete:false};
    const importedTime=incoming.sessions.filter(s=>dayKey(new Date(s.endedAt||s.startedAt))===today).reduce((n,s)=>n+s.activeMs,0)+(incoming.activeSession&&dayKey(new Date(incoming.activeSession.startedAt))===today?incoming.activeSession.activeMs:0);
    const delta=body.import?Math.max(0,importedTime-day.activeMs):Math.max(0,totalMs(incoming)-before);
    day.activeMs=Math.min(target,day.activeMs+Math.min(delta,body.import?target:60000));day.fulfilled=day.activeMs>=target;day.learningComplete=current.course.sessions.some(s=>dayKey(new Date(s.endedAt||s.startedAt))===today);
    if(current.course.activeSession)current.course.activeSession.dayKey=dayKey(new Date(current.course.activeSession.startedAt));
    const saved=repo.write(current,body.revision,owner);
    if(!incoming.activeSession||incoming.activeSession.paused)repo.release(owner);
    return {status:200,body:{version:1,revision:saved.revision,course:saved.course,days:saved.days,readonly:false}};
  }catch(error){return {status:error.status||400,body:{message:error.message||'Не вдалося синхронізувати English.'}};}
}
module.exports={handle,mergeCourse,dayKey,shutdownCheckers:async()=>{await Promise.all([...grammarCheckers.values()].map(c=>c.stop()));grammarCheckers.clear();}};
