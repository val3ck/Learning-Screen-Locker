import type {Attempt,ExecutionResult,LearningModule,ModuleState,SessionRecord,Task} from './contracts';
import {daysAfter} from './calendar';
import {defaultDuration,minuteMs} from './tracks';
export const INTERVALS=[1,3,7,14,30];
export function availableTopicIds(state:ModuleState):string[]{
  return [...new Set([...(state.progress?.confirmedTopicIds||[]),...(state.learnedTopicIds||[])])];
}
/** A checked learning step joins Recall's practice pool after the session ends. */
export function learnedTopics(session:SessionRecord):string[]{
  if(session.mode==='demo'||!session.endedAt)return [];
  return session.tasks.filter((task,index)=>task.learning&&session.solved[index]&&
    session.attempts.some(attempt=>attempt.taskId===task.id&&attempt.check&&!attempt.technical&&attempt.status==='correct'))
    .map(task=>task.learning!.topicId);
}
export function createSession(module:LearningModule,state:ModuleState,sessions:SessionRecord[],dayKey:string,mode:SessionRecord['mode'],now=new Date(),seed=Math.floor(Math.random()*0xffffffff)):SessionRecord {
  const tasks=module.taskProvider.generate({confirmedTopicIds:availableTopicIds(state),history:state.history,sessions,now:now.toISOString(),seed});
  if(tasks.length!==3)throw new Error('Навчальний модуль має створити три вправи.');
  return {version:1,id:`${now.getTime()}-${seed}`,moduleId:module.manifest.id,contentVersion:module.manifest.version,dayKey,mode,startedAt:now.toISOString(),activeMs:0,currentIndex:0,tasks,answers:tasks.map(t=>t.starter),hintLevels:[0,0,0],solved:[false,false,false],taskElapsedMs:[0,0,0],attempts:[],baseTaskCount:3};
}
export const MAX_SESSION_TASKS=5;
/** Late editor autosaves cannot undo a bonus task or a completed step. */
export function isStaleSessionUpdate(current:SessionRecord,incoming:SessionRecord):boolean {
  return incoming.tasks.length!==current.tasks.length||incoming.tasks.some((task,i)=>task.id!==current.tasks[i]?.id)||incoming.currentIndex<current.currentIndex||incoming.attempts.length<current.attempts.length||current.solved.some((solved,i)=>solved&&!incoming.solved[i])||current.hintLevels.some((count,i)=>count>incoming.hintLevels[i]);
}
export function addSpeedBonus(module:LearningModule,state:ModuleState,sessions:SessionRecord[],session:SessionRecord,minMinutes=5,now=new Date(),seed=Math.floor(Math.random()*0xffffffff),allowNewTopic=false):boolean {
  if(session.endedAt||!session.solved.every(Boolean)||session.tasks.length>=MAX_SESSION_TASKS||session.activeMs>=minMinutes*60000||!module.taskProvider.extraTask)return false;
  const task=module.taskProvider.extraTask({confirmedTopicIds:availableTopicIds(state),history:state.history,sessions,now:now.toISOString(),seed,allowNewTopic},session);
  const known=new Set(availableTopicIds(state));
  const newTopic=task.learning&&module.catalog.find(t=>t.id===task.learning!.topicId);
  const learningAllowed=allowNewTopic&&newTopic&&newTopic.prerequisites.every(id=>known.has(id))&&!session.tasks.some(t=>t.learning);
  if(task.moduleId!==session.moduleId||!task.topicIds.every(id=>known.has(id)||learningAllowed&&id===newTopic!.id))throw new Error('Додаткова вправа виходить за межі вивченого або одного дозволеного навчального кроку.');
  if(session.tasks.some(t=>t.id===task.id))throw new Error('Додаткова вправа має бути новою.');
  session.baseTaskCount??=3;session.tasks.push(task);session.answers.push(task.starter);session.hintLevels.push(0);session.solved.push(false);session.taskElapsedMs.push(0);session.currentIndex=session.tasks.length-1;
  return true;
}
export function sqlDuration(session:Pick<SessionRecord,'durationMinutes'>):number {
  return session.durationMinutes??defaultDuration('postgresql');
}
export function canSurrender(session:SessionRecord):boolean{return session.activeMs>=sqlDuration(session)*minuteMs;}
export function surrenderMessage(session:SessionRecord):string|null{return canSurrender(session)&&session.currentIndex<session.tasks.length-1?'Можна завершити на сьогодні. Виконані вправи збережуться, до решти повернемося іншим разом.':null;}
export function recordAttempt(session:SessionRecord,result:ExecutionResult,check:boolean,now=new Date()):void {
  const i=session.currentIndex;const task=session.tasks[i];
  const attempt:Attempt={at:now.toISOString(),taskId:task.id,templateId:task.templateId,topicIds:task.topicIds,seed:task.seed,answer:session.answers[i],status:result.status,technical:!!result.technical,elapsedMs:session.taskElapsedMs[i],hints:session.hintLevels[i],check};
  session.attempts.push(attempt);
  if(check&&result.status==='correct')session.solved[i]=true;
}
export function updateHistory(state:ModuleState,session:SessionRecord):ModuleState {
  if(session.mode==='demo')return state;
  const history=structuredClone(state.history);const at=session.endedAt||new Date().toISOString();
  const outcomes=new Map<string,number>();
  const acquired=new Set(learnedTopics(session));
  session.tasks.forEach((task:Task,i:number)=>{
    if(session.outcome==='technical'||session.outcome==='interrupted'){
      if(!session.solved[i])return;
    }
    const attempts=session.attempts.filter(a=>a.taskId===task.id&&a.check&&!a.technical);
    const clean=session.solved[i]&&session.hintLevels[i]===0&&!attempts.some(a=>a.status!=='correct'||a.hints>0);
    const touched=attempts.length>0||session.hintLevels[i]>0||session.taskElapsedMs[i]>=5000&&i<=session.currentIndex;
    const grade=clean?2:session.solved[i]?1:touched?0:-1;
    // A later, unfinished combined task must not erase a skill already demonstrated.
    for(const topicId of task.topicIds){
      if(task.learning?.topicId===topicId&&!acquired.has(topicId))continue;
      const topicGrade=task.learning?.topicId===topicId?Math.min(grade,1):grade;
      outcomes.set(topicId,Math.max(outcomes.get(topicId)??-1,topicGrade));
    }
  });
  for(const [topicId,grade] of outcomes){
    const old=history[topicId]||{topicId,intervalIndex:-1,dueAt:at,lastReviewedAt:'',independent:0,assisted:0,missed:0};
    const clean=grade===2,passed=grade>=1;
    const index=clean?Math.min(old.intervalIndex+1,INTERVALS.length-1):0;
    history[topicId]={...old,intervalIndex:index,dueAt:daysAfter(at,INTERVALS[index]),lastReviewedAt:grade>=0?at:old.lastReviewedAt,independent:old.independent+Number(clean),assisted:old.assisted+Number(passed&&!clean),missed:old.missed+Number(!passed)};
  }
  const learned=[...new Set([...(state.learnedTopicIds||[]),...learnedTopics(session)])];
  return {...state,history,...(learned.length?{learnedTopicIds:learned}:{})};
}
