export type LearningOutcome='completed'|'partial'|'surrendered'|'technical'|'interrupted';
export interface LearningEnvelope<T=unknown>{
  version:2;id:string;moduleId:string;contentVersion:string;dayKey:string;revision:number;
  mode:'daily'|'practice'|'demo';status:'active'|'paused'|'completed'|'partial'|'surrendered'|'technical'|'interrupted';
  startedAt:string;endedAt?:string;activeMs:number;payload:T;
}
export interface LearningAction {type:string;key?:string;value?:string;index?:number;flag?:boolean;area?:string}
export interface ActivityState {active:boolean;waiting?:boolean;media?:boolean}
export interface LearningController {
  snapshot():LearningEnvelope|null;
  dispatch(action:LearningAction):void;
  tick(milliseconds:number,activity:ActivityState):void;
  finish(outcome:LearningOutcome):void;
}
/** Main-process monotonic time source. OS suspension never becomes study time. */
export class FocusClock {
  private last:number|null=null;
  sample(now:number,active:boolean):number {
    const delta=this.last===null?0:Math.max(0,now-this.last);this.last=now;
    return active&&delta<=5000?delta:0;
  }
  reset(){this.last=null;}
}
export function envelopeValid(value:unknown):value is LearningEnvelope {
  const s=value as LearningEnvelope;
  return !!s&&s.version===2&&typeof s.id==='string'&&/^[\w-]{1,150}$/.test(s.id)&&typeof s.moduleId==='string'&&typeof s.contentVersion==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.dayKey)&&Number.isInteger(s.revision)&&s.revision>=0&&Number.isFinite(s.activeMs)&&s.activeMs>=0&&['daily','practice','demo'].includes(s.mode)&&['active','paused','completed','partial','surrendered','technical','interrupted'].includes(s.status)&&Number.isFinite(Date.parse(s.startedAt));
}
