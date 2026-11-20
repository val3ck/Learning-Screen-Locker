import type {SessionRecord} from '../../core/contracts';
import type {LearningController,LearningEnvelope,LearningAction,LearningOutcome,ActivityState} from '../../core/learning';
export class SQLController implements LearningController {
  constructor(private session:SessionRecord){}
  snapshot():LearningEnvelope {const s=this.session;return {version:2,id:s.id,moduleId:s.moduleId,contentVersion:s.contentVersion,dayKey:s.dayKey,revision:s.attempts.length,mode:s.mode,status:s.outcome||(s.paused?'paused':'active'),startedAt:s.startedAt,endedAt:s.endedAt,activeMs:s.activeMs,payload:s};}
  dispatch(action:LearningAction){if(action.type==='answer'&&typeof action.value==='string')this.session.answers[this.session.currentIndex]=action.value;else if(action.type==='pause')this.session.paused=!!action.flag;else throw new Error('Дія SQL-контролера недоступна.');}
  tick(milliseconds:number,activity:ActivityState){const s=this.session;if(!activity.active||activity.waiting||s.paused||s.endedAt)return;s.activeMs+=milliseconds;if(!s.solved[s.currentIndex])s.taskElapsedMs[s.currentIndex]+=milliseconds;}
  finish(outcome:LearningOutcome){this.session.outcome=outcome==='partial'?'interrupted':outcome;this.session.endedAt=new Date().toISOString();}
}
