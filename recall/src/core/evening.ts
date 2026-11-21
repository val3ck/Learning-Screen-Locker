import {WARNING_MS,SNOOZE_MS} from './scheduler';
import {clockDue,isLateHour,kyivDayKey,kyivParts,type ClockTime} from './calendar';
export interface EveningSchedule {version:1;dayKey:string;finished:boolean;snoozedUntil?:number;warningRemainingMs:number;offered:boolean;lastTick:number}
export function eveningSchedule(now:Date):EveningSchedule{return {version:1,dayKey:kyivDayKey(now),finished:false,warningRemainingMs:WARNING_MS,offered:false,lastTick:now.getTime()};}
export function tickEvening(previous:EveningSchedule,input:{now:Date;active:boolean;busy:boolean;enabledAfterDay:string;done:boolean;warningVisible:boolean;returned?:boolean;start?:ClockTime|null}):{state:EveningSchedule;action:'none'|'warn'|'start';optional:boolean}{
  const now=input.now.getTime(),parts=kyivParts(input.now),day=kyivDayKey(input.now);
  let state={...previous};if(state.dayKey!==day)state=eveningSchedule(input.now);
  const delta=Math.max(0,Math.min(5000,now-state.lastTick));state.lastTick=now;
  const start=input.start===undefined?'19:00':input.start;
  const optional=isLateHour(parts.hour);
  if(input.done)state.finished=true;
  if(state.finished||day<=input.enabledAfterDay||input.busy||!input.active)return {state,action:'none',optional};
  if(start===null||!clockDue(input.now,start))return {state,action:'none',optional};
  if(state.snoozedUntil&&state.snoozedUntil>now)return {state,action:'none',optional};
  if(state.snoozedUntil){state.snoozedUntil=undefined;state.offered=false;state.warningRemainingMs=WARNING_MS;}
  if(!state.offered){state.offered=true;state.warningRemainingMs=WARNING_MS;return {state,action:'warn',optional};}
  if(optional)return {state,action:input.warningVisible?'none':'warn',optional:true};
  if(!input.warningVisible||input.returned){state.warningRemainingMs=WARNING_MS;return {state,action:'warn',optional:false};}
  state.warningRemainingMs=Math.max(0,state.warningRemainingMs-delta);
  return {state,action:state.warningRemainingMs===0?'start':'none',optional:false};
}
export function snoozeEvening(previous:EveningSchedule,now=new Date()):EveningSchedule{return {...previous,snoozedUntil:now.getTime()+SNOOZE_MS,offered:false,warningRemainingMs:WARNING_MS,lastTick:now.getTime()};}
