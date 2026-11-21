import {clockDue,dayKey,kyivParts} from './calendar';
import type {TrackStart} from './tracks';
import type {ScheduleState,SessionRecord} from './contracts';
export const WARNING_MS=2*60000;
export const SNOOZE_MS=30*60000;
export function needsWarning(now:Date,start?:TrackStart):boolean {return start!==null&&(start!==undefined&&start!=='activity'||kyivParts(now).hour<16);}
export function automaticDayAllowed(now:Date,enabledAfterDay:string):boolean {return dayKey(now)>enabledAfterDay;}
export function hasFinishedToday(sessions:SessionRecord[],now:Date,moduleId='postgresql'):boolean {
  const current=dayKey(now);
  return sessions.some(s=>(s.moduleId||'postgresql')===moduleId&&s.mode!=='demo'&&['completed','surrendered'].includes(s.outcome||'')&&(s.dayKey===current||!!s.endedAt&&dayKey(new Date(s.endedAt))===current));
}
export function newSchedule(now:Date,random=Math.random):ScheduleState {
  return {version:1,dayKey:dayKey(now),eligible:false,delayMs:(60+random()*60)*60000,activeMs:0,warned:false,triggered:false,finished:false,lastTick:now.getTime()};
}
export function completeScheduleForDay(previous:ScheduleState,now=new Date()):ScheduleState {
  const current=previous.dayKey===dayKey(now)?previous:newSchedule(now);
  return {...current,finished:true,snoozedUntil:undefined,warningRemainingMs:undefined};
}
export function snoozeSchedule(previous:ScheduleState,now=new Date()):ScheduleState {
  if(previous.finished)return previous;
  return {...previous,eligible:true,activeMs:Math.max(previous.activeMs,previous.delayMs),snoozedUntil:now.getTime()+SNOOZE_MS,warned:false,triggered:false,warningRemainingMs:undefined,lastTick:now.getTime()};
}
export function tickSchedule(previous:ScheduleState,input:{now:Date; active:boolean; returned:boolean; hasProgress:boolean; warningVisible?:boolean; start?:TrackStart},random=Math.random):{state:ScheduleState; action:'none'|'warn'|'start'} {
  const now=input.now.getTime();
  let state={...previous};
  if(state.dayKey!==dayKey(input.now))state={...newSchedule(input.now,random),snoozedUntil:previous.snoozedUntil&&previous.snoozedUntil>now?previous.snoozedUntil:undefined};
  const delta=Math.max(0,Math.min(15000,now-state.lastTick));
  state.lastTick=now;
  const fixed=typeof input.start==='string'&&input.start!=='activity'?input.start:undefined;
  if(input.start===null||fixed&&!clockDue(input.now,fixed))return {state,action:'none'};
  if(input.returned||fixed)state.eligible=true;
  if(!state.eligible||state.finished||state.triggered||!input.hasProgress)return {state,action:'none'};
  if(state.snoozedUntil&&now<state.snoozedUntil)return {state,action:'none'};
  if(state.snoozedUntil){state.snoozedUntil=undefined;state.warned=false;state.warningRemainingMs=undefined;}
  if(input.active)state.activeMs+=delta;
  if(!needsWarning(input.now,input.start)){
    state.warned=false;state.warningRemainingMs=undefined;
    if(input.active&&state.activeMs>=state.delayMs){state.triggered=true;return {state,action:'start'};}
    return {state,action:'none'};
  }
  if(input.active&&!state.warned&&(fixed||state.activeMs>=state.delayMs-WARNING_MS)){state.warned=true;state.warningRemainingMs=WARNING_MS;return {state,action:'warn'};}
  if(input.active&&state.warned){
    if(input.returned||input.warningVisible===false){state.warningRemainingMs=WARNING_MS;return {state,action:'none'};}
    state.warningRemainingMs=Math.max(0,(state.warningRemainingMs??WARNING_MS)-delta);
    if(state.warningRemainingMs===0){state.triggered=true;return {state,action:'start'};}
  }
  return {state,action:'none'};
}
