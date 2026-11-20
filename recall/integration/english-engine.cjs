(function(root,factory){
  const course=typeof module==='object'&&module.exports?require('./course.js'):root.EnglishCourse;
  const api=factory(course);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.EnglishDailyEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(course){
  'use strict';
  const STORAGE_KEY='english_daily_v1', INTERVALS=[1,3,7,14,30];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const kyivFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'});
  const localDay=(date=new Date())=>{const p=Object.fromEntries(kyivFormatter.formatToParts(date).map(p=>[p.type,p.value]));const d=new Date(Date.UTC(+p.year,+p.month-1,+p.day));if(+p.hour<5)d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);};
  function after(day,count){const [y,m,d]=day.split('-').map(Number);return localDay(new Date(y,m-1,d+count,12));}
  const normal=value=>String(value||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?,;:]/g,'').replace(/\s+/g,' ').trim();
  const legacyFields=['xp','learnedWords','customWords','currentIndices','activeNav','completedPractices','aiEvaluations','completedSpeakingTopics','completedMilestones','lessonReminder','voiceGender'];
  function safeLegacy(input){
    const output={};
    for(const key of legacyFields)if(input&&Object.prototype.hasOwnProperty.call(input,key))output[key]=clone(input[key]);
    // Only the old application's known progress fields are copied, never storage
    // keys, provider settings, arbitrary objects or credentials.
    return output;
  }
  function defaultState(legacy={},now=new Date()){
    const prior=safeLegacy(legacy);
    return {version:1,contentVersion:course.VERSION,createdAt:now.toISOString(),calendarVersion:2,activeSession:null,sessions:[],reviews:{},completedDays:[],xp:0,legacy:prior,
      familiarWords:Object.keys(prior.learnedWords||{}).map(id=>({id,verified:false})),settings:{reminderTime:prior.lessonReminder?.time||'19:00',reminderEnabled:!!prior.lessonReminder?.enabled},migration:{from:'linguo_app_state_v3',at:now.toISOString()}};
  }
  function selectReviews(state,day,limit=8){
    return course.learning.uniqueReviews(Object.values(state.reviews).filter(item=>item.dueDay<=day)
      .sort((a,b)=>Number(b.unresolved)-Number(a.unresolved)||a.dueDay.localeCompare(b.dueDay)||a.id.localeCompare(b.id))).slice(0,limit).map(clone);
  }
  function seedReviews(lesson){
    return lesson.vocabulary.slice(0,3).map((word,i)=>{const task=course.learning.wordTask(word);return {id:`warmup-${lesson.id}-${i}`,kind:'vocabulary',prompt:task.prompt,answer:word.en,explanation:word.example,clue:task.clue,instruction:task.instruction};});
  }
  class Engine {
    constructor(adapter,now=()=>new Date(),calendar=localDay){
      this.adapter=adapter;this.now=now;this.calendar=calendar;this.lastSaveError=null;
      const raw=adapter.getItem(STORAGE_KEY);
      if(raw){try{this.state=validateImport(JSON.parse(raw));if(this.state.calendarVersion!==2){try{adapter.setItem('english_daily_before_calendar_v2',raw);}catch{}this.state.completedDays=[...new Set(this.state.sessions.map(s=>localDay(new Date(s.endedAt||s.startedAt))))];this.state.calendarVersion=2;this.save();}if(course.refreshSession(this.state.activeSession,this.state.sessions)){try{adapter.setItem('english_daily_before_choices_v2',raw);}catch{}this.save();}}catch(error){throw new Error('Збереження English Daily пошкоджене. Експортуй локальні дані перед відновленням. '+error.message);}}
      else {let legacy={};try{legacy=JSON.parse(adapter.getItem('linguo_app_state_v3')||'{}');}catch{} this.state=defaultState(legacy,this.now());this.save();}
      if(course.learning.refreshSession(this.state.activeSession,this.state.sessions,course.lessons)){try{adapter.setItem('english_daily_before_learning_en_v2',raw);}catch{}this.save();}
    }
    save(){
      try{this.adapter.setItem(STORAGE_KEY,JSON.stringify(this.state));this.lastSaveError=null;}
      catch(error){this.lastSaveError='Не вдалося зберегти прогрес. Завантаж експорт перед закриттям.';throw new Error(this.lastSaveError);}
      return this.state;
    }
    current(){return this.state.activeSession;}
    nextLesson(){
      const completed=new Set(this.state.sessions.filter(s=>s.status==='completed'&&s.mode==='course').map(s=>s.lessonId));
      const advanced=new Set((this.state.migration?.manualAdvances||[]).map(a=>a.lessonId));
      return course.lessons.find(l=>!completed.has(l.id)&&!advanced.has(l.id))||null;
    }
    advanceByRequest(){
      const current=this.current();if(!current||!current.paused)throw Error('Pause the lesson before advancing it manually.');
      const archived=clone(current),at=this.now().toISOString();archived.advancedByRequestAt=at;
      this.state.migration??={};this.state.migration.manualAdvances??=[];
      if(this.state.migration.manualAdvances.some(a=>a.lessonId===current.lessonId))throw Error('This lesson was already advanced manually.');
      this.state.migration.manualAdvances.push({lessonId:current.lessonId,at,reason:'user-request',attempt:archived});
      this.state.activeSession=null;this.save();return archived;
    }
    start(){
      if(this.current())return this.current();
      const day=this.calendar(this.now()),next=this.nextLesson();
      if(this.state.completedDays.includes(day)&&next)return null;
      const mode=next?'course':'maintenance';
      const lesson=clone(next||course.lessons.filter(l=>l.type==='simulation')[(this.state.sessions.length-84)%12]);
      const sessionId=`${this.now().getTime()}-${Math.random().toString(36).slice(2,10)}`;course.presentLesson(lesson,sessionId);this.state.contentVersion=course.VERSION;
      if(mode==='maintenance'){lesson.title='Practice: '+lesson.theme;lesson.mission='Персональне повторення та нова розмова за знайомою темою.';lesson.newVocabulary=false;}
      let reviews=selectReviews(this.state,day);
      if(!reviews.length){
        const mixed=course.learning.uniqueReviews(Object.values(this.state.reviews).sort((a,b)=>a.lastDay.localeCompare(b.lastDay))).slice(0,5).map(item=>({...clone(item),mixed:true}));
        reviews=mixed.length?mixed:seedReviews(lesson);
      }
      reviews=reviews.map(item=>{if(lesson.productionMode==='ai-opinion-v1')return course.learning.openReview(item);const word=course.lessons.flatMap(l=>l.vocabulary).find(w=>normal(w.en)===normal(item.answer));if(item.kind==='vocabulary'&&word){const task=course.learning.wordTask(word);return {...item,prompt:task.prompt,clue:task.clue,instruction:task.instruction,explanation:word.example};}if(!['vocabulary','grammar'].includes(item.kind))return course.learning.prepareReview(item);return {...item,prompt:item.kind==='grammar'?item.prompt:'Explain the saved situation below in English. Write a short reply, then check its wording.',context:item.kind==='grammar'?'':item.answer,instruction:item.kind==='grammar'?'Type the missing word or phrase.':'Use the saved context; you do not need to remember an earlier answer.',explanation:item.kind==='grammar'?'Choose the form that fits the complete sentence.':'The local checker checks wording; it does not grade the meaning of an open reply.'};});
      const recent=this.state.sessions.slice(-2),performance=recent.flatMap(s=>s.attempts.filter(a=>!a.technical));
      const support=performance.length&&performance.filter(a=>a.correct&&!a.assisted).length/performance.length<0.6?'guided':lesson.week>6?'light':'standard';
      const session={version:1,id:sessionId,choicePresentationVersion:2,lessonId:lesson.id,contentVersion:course.VERSION,mode,dayKey:day,startedAt:this.now().toISOString(),status:'active',blockIndex:0,paused:false,activeMs:0,blockMs:{},lesson,reviews,answers:{},results:{},attempts:[],revealed:{},listens:0,transcriptVisible:false,sources:{},feedback:{},support};
      this.state.activeSession=session;course.learning.refreshSession(session,this.state.sessions,course.lessons);this.save();return session;
    }
    importPersonalReview(raw){const s=this.current();if(!s)throw Error('Спочатку відкрий урок.');const items=course.learning.parsePersonalReview(raw,s.lessonId,after(this.calendar(this.now()),1));let added=0;for(const item of items)if(!this.state.reviews[item.id]){item.lastDay=this.calendar(this.now());this.state.reviews[item.id]=item;added++;}this.save();return added;}
    setAnswer(key,value,source='typed'){
      const s=this.current();if(!s)return;
      if(String(value).length>20000)throw new Error('Відповідь надто довга.');
      // Keep earlier feedback visible. aiPassed compares its snapshot with the
      // current drafts, so an edited answer cannot use a stale pass.
      if(source==='typed'&&s.recordingNeedsTranscript)delete s.recordingNeedsTranscript[key];
      if(s.answers[key]!==String(value)){s.lastAnswerKey=key;s.lastAnswerAt=this.now().toISOString();}
      s.answers[key]=String(value);s.sources[key]=source;
      if(s.languageChecks)delete s.languageChecks[key];
      // Changing an already checked response invalidates its result.
      delete s.results[key];
      if(key==='writing'){delete s.feedback.writing;for(let i=0;i<3;i++)delete s.results[`writing-check-${i}`];}
      if(key==='monologue'||/^turn-\d$/.test(key)){delete s.feedback.speaking;delete s.results['speaking-reflection'];}
      if(key==='retry')delete s.results['speaking-reflection'];
      this.save();
    }
    reveal(key){const s=this.current();s.revealed[key]=true;this.save();}
    grade(key,correct,details={}){
      const s=this.current();if(!s)return;
      if(correct&&s.results[key]?.correct)return s.results[key];
      const earlier=s.attempts.some(a=>a.key===key&&!a.correct);
      const assisted=!!s.revealed[key]||earlier||!!details.assisted;
      s.results[key]={correct:!!correct,assisted,at:this.now().toISOString()};
      s.attempts.push({key,answer:(s.answers[key]||'').slice(0,1000),correct:!!correct,assisted,at:this.now().toISOString(),...details});this.save();return s.results[key];
    }
    checkText(key,expected){return this.grade(key,normal(this.current().answers[key])===normal(expected));}
    checkChoice(key,question){return this.grade(key,/^\d+$/.test(String(this.current().answers[key]))&&Number(this.current().answers[key])===question.correct);}
    checkGuided(key){const s=this.current(),task=course.learning.findGuidedTask(s.lesson,key);if(!task)throw Error('Unknown guided task.');const checked=course.learning.evaluateGuided(task,s.answers[key]);const result=this.grade(key,checked.correct,{scope:'guided',message:checked.message});result.scope='guided';result.message=checked.message;this.save();return result;}
    acceptAI(a){const s=this.current(),result=course.learning.acceptAssessment(s,a);if(a.cache?.checked!==0)for(const item of course.learning.coachingReviews(a,s,after(this.calendar(this.now()),1))){item.lastDay=this.calendar(this.now());this.state.reviews[item.id]=item;}this.save();return result;}
    acceptLanguageCheck(key,report){const result=course.learning.acceptLanguageCheck(this.current(),key,report);this.save();return result;}
    tick(milliseconds,{visible=true,waiting=false,focused=true}={}){
      const s=this.current();if(!s||s.paused||!visible||!focused||waiting)return;
      const delta=Math.min(Math.max(milliseconds,0),5000);s.activeMs+=delta;
      const block=course.BLOCKS[s.blockIndex].id;s.blockMs[block]=(s.blockMs[block]||0)+delta;
    }
    requirements(block=course.BLOCKS[this.current().blockIndex].id){
      const s=this.current(),l=s.lesson,has=key=>!!s.answers[key]?.trim(),passed=key=>!!s.results[key]?.correct;
      if(l.productionMode==='ai-opinion-v1'&&['review','vocabulary','reading','speaking','writing'].includes(block)){if(block==='reading'&&!l.reading.questions.every((_,i)=>passed('reading-'+i)))return false;return course.learning.aiPassed(s,block);}
      if(l.guidedTasks?.version===1){const guided=area=>course.learning.guidedPassed(s,area);if(block==='vocabulary')return l.vocabulary.every((_,i)=>passed('vocab-'+i))&&guided('vocabulary');if(block==='reading')return l.reading.questions.every((_,i)=>passed('reading-'+i))&&guided('reading');if(block==='speaking')return guided('speaking');if(block==='writing')return guided('writing');}
      switch(block){
        case 'review':return s.reviews.every((_,i)=>passed(`review-${i}`))||(s.blockMs.review>=8*60000&&s.reviews.some((_,i)=>passed(`review-${i}`)));
        case 'vocabulary':return l.vocabulary.every((_,i)=>passed(`vocab-${i}`))&&has('vocab-example')&&passed('vocab-example');
        case 'reading':return l.reading.questions.every((_,i)=>passed(`reading-${i}`))&&has('retell')&&passed('retell');
        case 'listening':return (s.listens>=1||s.listeningUnavailable)&&(course.learning.aiPassed(s,'listening')||l.listening.questions.every((_,i)=>passed(`listening-${i}`)));
        case 'grammar':return course.learning.aiPassed(s,'grammar')||l.grammar.exercises.every((_,i)=>passed(`grammar-${i}`));
        case 'speaking':return ['monologue','turn-0','turn-1','turn-2','retry'].every(has)&&!!s.feedback.speaking&&(s.feedback.speaking.source==='local'?['monologue','turn-0','turn-1','turn-2','retry'].every(k=>course.learning.knownReport(s,k)&&passed(k)):passed('speaking-reflection'));
        case 'writing':return has('writing')&&!!s.feedback.writing&&(s.feedback.writing.source==='local'?course.learning.knownReport(s,'writing')&&passed('writing'):l.writing.checklist.every((_,i)=>passed(`writing-check-${i}`)));
        case 'summary':return true;
        default:return false;
      }
    }
    advance(){const s=this.current();if(!this.requirements())throw new Error('Complete the required checks in this block. Optional free writing cannot replace them.');if(s.blockIndex<course.BLOCKS.length-1)s.blockIndex++;this.save();}
    previous(){const s=this.current();s.blockIndex=Math.max(0,s.blockIndex-1);this.save();}
    pause(value){if(this.current()){this.current().paused=value;this.save();}}
    finish(){
      const s=this.current();if(!s)return null;
      if(course.BLOCKS.some(b=>!this.requirements(b.id)))throw new Error('Заверши всі блоки уроку перед підсумком.');
      const now=this.now(),day=this.calendar(now);s.status='completed';s.endedAt=now.toISOString();
      const schedule=(item,clean)=>{
        const sourceIds=[...new Set([item.id,...(item.reviewSourceIds||[])])];
        for(const sourceId of sourceIds){
        const old=this.state.reviews[sourceId];
        // Early mixed practice never advances a due date; an error still returns tomorrow.
        if(item.mixed&&clean&&old)continue;
        const interval=clean?Math.min((old?.intervalIndex??-1)+1,INTERVALS.length-1):0;
        this.state.reviews[sourceId]={...item,id:sourceId,mixed:false,intervalIndex:interval,dueDay:after(day,INTERVALS[interval]),lastDay:day,unresolved:!clean,independent:(old?.independent||0)+Number(clean),assisted:(old?.assisted||0)+Number(!clean)};
        }
      };
      s.reviews.forEach((item,i)=>{const r=s.results[`review-${i}`];if(r)schedule(item,r.correct&&!r.assisted);});
      s.lesson.vocabulary.forEach((v,i)=>{
        const id='word-'+normal(v.en)+'--'+normal(v.uk),r=s.results[`vocab-${i}`];
        if(!this.state.reviews[id]||!r?.correct||r.assisted){const task=course.learning.wordTask(v);schedule({id,kind:'vocabulary',prompt:task.prompt,clue:task.clue,instruction:task.instruction,answer:v.en,explanation:v.example,lessonId:s.lessonId,sourceKey:'vocab-'+i,previousAnswer:s.answers['vocab-'+i]||''},!!r?.correct&&!r?.assisted);}
      });
      s.lesson.grammar.exercises.forEach((q,i)=>{const r=s.results[`grammar-${i}`];if(r.assisted)schedule({id:`grammar-${s.lessonId}-${i}`,kind:'grammar',prompt:q.prompt,answer:q.options[q.correct],explanation:q.explanation},false);});
      for(const area of ['speaking','writing'])for(const [i,correction] of (s.feedback[area]?.corrections||[]).slice(0,2).entries()){
        schedule({id:`correction-${s.id}-${area}-${i}`,kind:'correction',prompt:`Виправ фрагмент: ${correction.original}`,answer:correction.improved,explanation:correction.explanation},false);
      }
      if(s.lesson.guidedTasks?.version===1)for(const area of ['vocabulary','reading','speaking','writing'])for(const t of s.lesson.guidedTasks[area]){const r=s.results[t.key];if(r?.correct&&r.assisted)schedule({id:'guided-'+s.lessonId+'-'+t.key,kind:t.kind==='gap'?'grammar':'reconstruction',prompt:t.prompt,answer:t.answer,explanation:t.explanation,lessonId:s.lessonId,sourceKey:t.key},false);}
      for(const issue of s.languageHistory||[])if(issue.improved)schedule({id:`wording-${s.lessonId}-${issue.ruleId}-${normal(issue.original).replace(/[^a-z]+/g,'-').slice(0,30)}`,kind:'grammar',prompt:`Replace the incorrect wording: “${issue.original}”. ${issue.message}`,answer:issue.improved,explanation:issue.message,lessonId:s.lessonId,sourceKey:issue.key},false);
      this.state.sessions.push(s);this.state.activeSession=null;
      if(!this.state.completedDays.includes(day))this.state.completedDays.push(day);
      this.state.xp+=100;this.save();return s;
    }
    streak(){
      const days=new Set(this.state.completedDays);let day=this.calendar(this.now()),count=0;
      if(!days.has(day))day=after(day,-1);
      while(days.has(day)){count++;day=after(day,-1);}return count;
    }
    exportProgress(){
      const out=clone(this.state);
      // The optional library can keep growing after the first migration.
      // Export its current progress, not a stale first-run snapshot.
      try{out.legacy=safeLegacy(JSON.parse(this.adapter.getItem('linguo_app_state_v3')||'null')||out.legacy);}catch{out.legacy=safeLegacy(out.legacy);}
      return JSON.stringify({format:'english-daily-progress',version:1,state:out},null,2);
    }
    importProgress(data){
      const raw=typeof data==='string'?JSON.parse(data):data;
      if(raw.format!=='english-daily-progress')throw new Error('Це не експорт English Daily.');
      const next=validateImport(raw.state);
      const previous=this.state,priorLegacy=this.adapter.getItem('linguo_app_state_v3');this.state=next;
      try{
        this.adapter.setItem('linguo_app_state_v3',JSON.stringify(next.legacy||{}));this.save();
      }catch(error){this.state=previous;try{this.adapter.setItem('linguo_app_state_v3',priorLegacy||'{}');this.save();}catch{}throw error;}
    }
  }
  function validateImport(input){
    if(!input||input.version!==1||!Array.isArray(input.sessions)||!Array.isArray(input.completedDays)||!input.reviews||typeof input.reviews!=='object'||Array.isArray(input.reviews))throw new Error('Невідомий формат прогресу.');
    if(!Number.isFinite(input.xp)||input.xp<0||input.sessions.length>10000)throw new Error('Некоректні підсумки прогресу.');
    const text=(value,max=30000)=>typeof value==='string'&&value.length<=max;
    const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
    const legacy=input.legacy||{};
    if(legacy.customWords!==undefined&&(!Array.isArray(legacy.customWords)||!legacy.customWords.every(w=>record(w)&&text(w.id,150)&&text(w.word,1000)&&text(w.ukr,2000)&&(w.examples===undefined||Array.isArray(w.examples)&&w.examples.every(v=>text(v))))))throw new Error('Некоректні слова бібліотеки.');
    if(legacy.learnedWords!==undefined&&(!record(legacy.learnedWords)||!Object.values(legacy.learnedWords).every(w=>record(w)&&(w.learnedAt===undefined||text(w.learnedAt,200)))))throw new Error('Некоректний прогрес словника.');
    for(const name of ['currentIndices','aiEvaluations'])if(legacy[name]!==undefined&&(!record(legacy[name])||!Object.values(legacy[name]).every(v=>Number.isFinite(v)&&v>=0)))throw new Error('Некоректна статистика бібліотеки.');
    if(legacy.completedPractices!==undefined&&(!record(legacy.completedPractices)||!Object.values(legacy.completedPractices).every(v=>Array.isArray(v))))throw new Error('Некоректна історія практики.');
    if(legacy.lessonReminder!==undefined&&(!record(legacy.lessonReminder)||!/^\d{2}:\d{2}$/.test(legacy.lessonReminder.time)||!Array.isArray(legacy.lessonReminder.days)||!Number.isFinite(legacy.lessonReminder.goalMinutes)))throw new Error('Некоректне нагадування.');
    if(legacy.completedSpeakingTopics!==undefined&&(!record(legacy.completedSpeakingTopics)||!Object.values(legacy.completedSpeakingTopics).every(v=>record(v)&&(v.bestScore===undefined||Number.isFinite(v.bestScore)))))throw new Error('Некоректний прогрес тем.');
    const choices=questions=>Array.isArray(questions)&&questions.length>0&&questions.length<=10&&questions.every(q=>q&&text(q.prompt)&&Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=8&&q.options.every(o=>text(o))&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length&&text(q.explanation));
    const validSession=s=>{
      if(!s||!course.getLesson(s.lessonId)||!s.lesson||s.lesson.id!==s.lessonId||!Array.isArray(s.lesson.blocks)||!Number.isInteger(s.blockIndex)||s.blockIndex<0||s.blockIndex>7||!s.answers||!s.results||!s.sources||!s.revealed||!s.feedback||!Array.isArray(s.reviews)||s.reviews.length>8||!Array.isArray(s.attempts)||!s.blockMs||!Number.isFinite(s.activeMs)||s.activeMs<0||!['course','maintenance'].includes(s.mode)||!['active','completed'].includes(s.status))throw new Error('Некоректна сесія уроку.');
      // Stored content is data only, but validate it before the UI consumes it.
      if(!Array.isArray(s.lesson.vocabulary)||s.lesson.vocabulary.length!==6||!Array.isArray(s.lesson.reading?.questions)||!Array.isArray(s.lesson.listening?.dialogue)||!Array.isArray(s.lesson.listening?.questions)||!Array.isArray(s.lesson.grammar?.exercises)||!s.lesson.speaking||!s.lesson.writing)throw new Error('Неповний матеріал уроку.');
      const l=s.lesson;
      if((l.learningLanguageVersion===3||l.guidedTasks!==undefined)&&!course.learning.validGuidedTasks(l.guidedTasks))throw new Error('Invalid guided task content.');
      if(!text(s.id,150)||!record(s.answers)||!record(s.results)||!record(s.sources)||!record(s.feedback)||!record(s.revealed)||!record(s.blockMs)||typeof s.paused!=='boolean'||!Number.isInteger(s.listens)||s.listens<0)throw new Error('Некоректний стан сесії.');
      if(!['title','mission','theme','level'].every(k=>text(l[k]))||!l.concept||!text(l.concept.explanation)||!text(l.concept.caveat)||!Number.isInteger(l.week)||l.week<1||l.week>12||!l.vocabulary.every(v=>v&&['id','en','uk','example'].every(k=>text(v[k])))||!text(l.reading.text)||!text(l.reading.retell)||!choices(l.reading.questions)||!choices(l.listening.questions)||!l.listening.dialogue.every(t=>t&&text(t.speaker)&&text(t.text))||!choices(l.grammar.exercises)||!text(l.grammar.explanation)||!text(l.grammar.title))throw new Error('Некоректний навчальний матеріал.');
      if(!['role','prompt','optionalQuestion','model','retry'].every(k=>text(l.speaking[k]))||!['questions','outline','phrases'].every(k=>Array.isArray(l.speaking[k])&&l.speaking[k].length<=10&&l.speaking[k].every(v=>text(v)))||l.speaking.questions.length!==3||!text(l.writing.prompt)||!text(l.writing.model)||!text(l.writing.targetWords)||!Array.isArray(l.writing.checklist)||l.writing.checklist.length!==3||!l.writing.checklist.every(v=>text(v)))throw new Error('Некоректний сценарій практики.');
      if(!Object.values(s.answers).every(v=>text(v,20000))||!Object.values(s.results).every(r=>r&&typeof r.correct==='boolean'&&typeof r.assisted==='boolean')||!s.reviews.every(r=>r&&text(r.id)&&text(r.kind)&&text(r.prompt)&&text(r.answer)&&text(r.explanation)))throw new Error('Invalid saved answers or reviews.');
      if(s.aiAssessments!==undefined&&(!record(s.aiAssessments)||!Object.values(s.aiAssessments).every(course.learning.validAssessment)))throw Error('Invalid saved AI assessment.');
      if(s.priorLearning!==undefined&&(!Array.isArray(s.priorLearning)||s.priorLearning.length>8||!s.priorLearning.every(c=>c&&['area','skill','focus','rule'].every(k=>text(c[k],900)))))throw Error('Invalid learning memory.');
      if(s.coachingHistory!==undefined&&(!Array.isArray(s.coachingHistory)||s.coachingHistory.length>20||!s.coachingHistory.every(c=>c&&text(c.area,100)&&text(c.at,100)&&(c.conclusion===undefined||course.learning.validBlockConclusion(c.conclusion))&&Array.isArray(c.answers)&&c.answers.length<=10&&c.answers.every(a=>a&&text(a.key,150)&&text(a.summary,1400)&&(a.conclusion===undefined||course.learning.validConclusion(a.conclusion))))))throw Error('Invalid coaching history.');
      if(s.mistakeLog!==undefined&&(!Array.isArray(s.mistakeLog)||s.mistakeLog.length>200||!s.mistakeLog.every(x=>x&&text(x.key,150)&&['original','replacement','explanation'].every(k=>text(x[k],1200))&&text(x.at,100))))throw Error('Invalid mistake history.');
      if(s.lastAnswerKey!==undefined&&(!text(s.lastAnswerKey,150)||!text(s.lastAnswerAt,100)))throw Error('Invalid last saved answer metadata.');
      if(s.blockSummaries!==undefined&&(!record(s.blockSummaries)||Object.keys(s.blockSummaries).length>8||!Object.values(s.blockSummaries).every(v=>v&&text(v.snapshot,200000)&&course.learning.validBlockConclusion(v.conclusion))))throw Error('Invalid section conclusions.');
      if(s.aiHints!==undefined&&(!Array.isArray(s.aiHints)||s.aiHints.length>50||!s.aiHints.every(h=>h&&['clarification','hint','nextStep'].every(k=>text(h[k])))))throw Error('Invalid saved hints.');
      if(s.proposedTranscripts!==undefined&&(!record(s.proposedTranscripts)||!Object.values(s.proposedTranscripts).every(t=>t&&text(t.text,12000))))throw Error('Invalid saved transcripts.');
      if(s.languageChecks!==undefined&&(!record(s.languageChecks)||!Object.entries(s.languageChecks).every(([key,r])=>/^(vocab-example|vocab-\d+|reading-\d+|listening-\d+|grammar-\d+|retell|monologue|turn-[0-2]|retry|writing|review-\d+)$/.test(key)&&course.learning.validReport(r))))throw new Error('Invalid saved language feedback.');
      for(const feedback of Object.values(s.feedback)){
        if(!feedback||!text(feedback.summary)||!Array.isArray(feedback.corrections)||!feedback.corrections.every(c=>c&&['original','improved','explanation'].every(k=>text(c[k])))||(feedback.strengths!==undefined&&(!Array.isArray(feedback.strengths)||!feedback.strengths.every(v=>text(v)))))throw new Error('Некоректний розбір відповіді.');
        if(feedback.skills!==undefined&&feedback.skills!==null&&(!record(feedback.skills)||!Object.values(feedback.skills).every(v=>v===null||Number.isInteger(v)&&v>=0&&v<=4)))throw new Error('Некоректні показники навичок.');
      }
    };
    if(input.migration?.manualAdvances!==undefined){const list=input.migration.manualAdvances;if(!Array.isArray(list)||list.length>84||new Set(list.map(a=>a?.lessonId)).size!==list.length)throw Error('Invalid manual course advances.');for(const a of list){if(!a||!course.getLesson(a.lessonId)||a.reason!=='user-request'||!text(a.at,100)||!Number.isFinite(Date.parse(a.at))||a.attempt?.lessonId!==a.lessonId||!a.attempt.paused||a.attempt.status!=='active')throw Error('Invalid archived manual advance.');validSession(a.attempt);}}
    input.sessions.forEach(validSession);if(input.activeSession)validSession(input.activeSession);
    if(new Set(input.sessions.map(s=>s.id)).size!==input.sessions.length)throw new Error('Повторені ідентифікатори сесій.');
    for(const day of input.completedDays)if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new Error('Некоректна дата.');
    for(const [key,item] of Object.entries(input.reviews))if(!item||['__proto__','constructor','prototype'].includes(key)||item.id!==key||typeof item.id!=='string'||typeof item.prompt!=='string'||typeof item.answer!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(item.dueDay)||!/^\d{4}-\d{2}-\d{2}$/.test(item.lastDay)||!Number.isInteger(item.intervalIndex)||item.intervalIndex<0||item.intervalIndex>=INTERVALS.length)throw new Error('Некоректна черга повторення.');
    const allowed=['calendarVersion','version','contentVersion','createdAt','activeSession','sessions','reviews','completedDays','xp','legacy','familiarWords','settings','migration'];
    const result={};for(const key of allowed)if(input[key]!==undefined)result[key]=clone(input[key]);
    result.legacy=safeLegacy(result.legacy);
    if(!Array.isArray(result.familiarWords))result.familiarWords=[];
    if(!result.settings||typeof result.settings!=='object')result.settings={reminderTime:'19:00',reminderEnabled:false};
    if(!result.createdAt)result.createdAt=new Date().toISOString();
    return result;
  }
  return {Engine,STORAGE_KEY,INTERVALS,localDay,after,normal,defaultState,selectReviews,validateImport};
});
