import {defaultDuration} from '../src/core/tracks';
import path from 'node:path';
import Repository from '../integration/english-repository.cjs';
import Bridge from '../integration/english-bridge.cjs';
import {EnglishController,newEnglishDocument,validateEnglishDocument,importEnglishCourse} from '../src/modules/english/controller';
import type {EnglishDocument} from '../src/modules/english/types';
import type {LearningAction,LearningOutcome} from '../src/core/learning';
import {kyivDayKey} from '../src/core/calendar';
export class EnglishHost {
  readonly repository:any;controller:EnglishController;recoveryError:string|null=null;private baseRevision=0;private dirty=false;private lastSave=0;private leaseAt=0;private owned=false;private saveTimer:ReturnType<typeof setTimeout>|null=null;
  constructor(root:string,private now:()=>Date=()=>new Date(),private targetMinutes=()=>defaultDuration('english')){
    this.repository=new Repository.EnglishRepository(path.join(root,'modules','english'),{validate:validateEnglishDocument,createDefault:()=>newEnglishDocument(this.now()),now:()=>this.now().getTime()});
    let data:EnglishDocument;try{data=this.repository.read();if(data.course.activeSession&&data.course.activeSession.choicePresentationVersion!==2)this.repository.backup(data,'before-choices-v2');}catch(error){this.recoveryError=String(error);data=newEnglishDocument(this.now());}this.baseRevision=data.revision;this.controller=new EnglishController(data,this.now,this.targetMinutes);
  }
  readonly(){return !!this.recoveryError||this.repository.readonly('desktop');}
  refresh(){if(this.recoveryError||this.running())return;const data=this.repository.read() as EnglishDocument;if(data.revision!==this.baseRevision){this.baseRevision=data.revision;this.controller=new EnglishController(data,this.now,this.targetMinutes);}}
  running(){const run=this.controller.snapshot();return this.owned&&!!run&&run.status==='active'&&!run.endedAt;}
  view(){this.refresh();return {...this.controller.view(this.readonly()),message:this.recoveryError||(typeof this.controller.document.course.activeSession?.learningUpgradeNotice==='string'?this.controller.document.course.activeSession.learningUpgradeNotice:undefined)};}
  start(mode:'daily'|'practice'|'demo'='practice',extend=false,lessonId?:string){
    if(this.recoveryError)throw new Error(this.recoveryError);
    const data=this.repository.acquire('desktop') as EnglishDocument;this.baseRevision=data.revision;this.controller=new EnglishController(data,this.now,this.targetMinutes);
    try{if(lessonId)this.controller.startSavedLesson(lessonId,mode==='demo'?'demo':'practice');else if(extend)this.controller.startExtension(mode==='demo'?'demo':'practice');else this.controller.start(mode);}catch(error){this.repository.release('desktop');throw error;}
    this.owned=this.controller.snapshot()?.status==='active';this.dirty=true;this.save();
  }
  action(action:LearningAction){if(this.readonly())throw new Error('English is open in your browser. Pause the lesson there to continue here.');this.controller.dispatch(action);this.dirty=true;if(action.type==='answer'){if(this.saveTimer)clearTimeout(this.saveTimer);this.saveTimer=setTimeout(()=>{this.saveTimer=null;try{this.save();}catch(error){this.recoveryError=String(error);}},400);}else this.save();return this.view();}
  aiChange(fn:(c:EnglishController)=>void,allowPaused=false){if(this.readonly()||!allowPaused&&!this.running())throw new Error('Resume your lesson before submitting work.');fn(this.controller);this.dirty=true;this.save();return this.view();}
  acceptLanguageCheck(key:string,report:import('../src/modules/english/types').EnglishLanguageReport){if(!this.running()||this.readonly())throw new Error('Resume the lesson before changing its checks.');this.controller.acceptLanguageCheck(key,report);this.dirty=true;this.save();return this.view();}
  tick(ms:number,active:boolean){if(!this.running())return;this.controller.tick(ms,{active});this.dirty=true;if(this.now().getTime()-this.lastSave>=10000)this.save();if(this.now().getTime()-this.leaseAt>15000){this.repository.renew('desktop');this.leaseAt=this.now().getTime();}}
  save(){if(this.saveTimer)clearTimeout(this.saveTimer);this.saveTimer=null;if(!this.dirty)return;const next=this.repository.write(this.controller.document,this.baseRevision,'desktop') as EnglishDocument;this.baseRevision=next.revision;this.controller.document.revision=next.revision;this.dirty=false;this.lastSave=this.now().getTime();}
  finish(reason:LearningOutcome){this.controller.finish(reason);this.dirty=true;this.save();this.owned=false;this.repository.release('desktop');}
  pause(){if(this.running()){this.controller.pause();this.dirty=true;this.save();}this.owned=false;this.repository.release('desktop');}
  release(){this.save();this.owned=false;this.repository.release('desktop');}
  recover(){const run=this.controller.snapshot();if(run&&run.status==='active'&&!run.endedAt&&!this.readonly()){if(run.payload.extraPractice)this.controller.pause();else this.controller.finish('interrupted');this.dirty=true;this.save();this.repository.release('desktop');}}
  import(source:unknown){if(this.recoveryError){const repaired=this.repository.repair(importEnglishCourse(source,this.now(),this.targetMinutes()));this.recoveryError=null;this.baseRevision=repaired.revision;this.controller=new EnglishController(repaired,this.now,this.targetMinutes);return;}this.refresh();if(this.readonly()||this.running())throw new Error('Pause the active English lesson first.');this.repository.acquire('desktop');try{this.repository.backup(this.controller.document,'before-import');const imported=importEnglishCourse(source,this.now(),this.targetMinutes());
      this.repository.backup(imported,'incoming');
      const merged=this.controller.document;merged.course=Bridge.mergeCourse(merged.course,imported.course);for(const [key,day]of Object.entries(imported.days)){const old=merged.days[key];merged.days[key]=old?{...old,activeMs:Math.max(old.activeMs,day.activeMs),dismissed:old.dismissed,fulfilled:old.fulfilled||day.fulfilled,learningComplete:old.learningComplete||day.learningComplete}:day;}
      merged.importedAt=this.now().toISOString();const next=this.repository.write(merged,this.baseRevision,'desktop');this.baseRevision=next.revision;this.controller=new EnglishController(next,this.now,this.targetMinutes);
    }finally{this.repository.release('desktop');}}
  done(){this.refresh();const day=this.controller.document.days[kyivDayKey(this.now())];return !!day&&(day.dismissed||day.fulfilled);}
  saveAudio(key:string,bytes:number[],mime:string){const attemptId=key.split(':')[0];if(this.controller.document.course.activeSession?.id!==attemptId&&!this.controller.document.course.sessions.some(s=>s.id===attemptId))throw new Error('This recording does not belong to a saved lesson.');if(!Array.isArray(bytes)||bytes.length>10000000||!bytes.every(v=>Number.isInteger(v)&&v>=0&&v<=255))throw new Error('Invalid recording.');const saved=this.repository.saveAudio(key,Buffer.from(bytes),mime,'desktop'),s=this.controller.document.course.activeSession as any,field=key.split(':')[1];if(s?.id===attemptId){if(s.proposedTranscripts)delete s.proposedTranscripts[field];s.recordingNeedsTranscript??={};s.recordingNeedsTranscript[field]=true;this.dirty=true;this.save();}return saved;}
  loadAudio(key:string){const value=this.repository.loadAudio(key);return value?{bytes:Array.from(Buffer.from(value.base64,'base64')),mime:value.mime}:null;}
}
