import {validDuration,validDurations,validStarts} from '../src/core/tracks';
import {mkdir,open,readFile,rename,readdir} from 'node:fs/promises';
import path from 'node:path';
import type {ModuleState,ScheduleState,SessionRecord,Settings} from '../src/core/contracts';
import {newSchedule} from '../src/core/scheduler';
import {getModule,modules} from '../src/modules/registry';
import {dayKey,kyivDayKey} from '../src/core/calendar';

async function writeDurable(target:string,content:string):Promise<void>{
  const temporary=target+'.tmp';
  const handle=await open(temporary,'w');
  try{await handle.writeFile(content,'utf8');await handle.sync();}
  finally{await handle.close();}
  await rename(temporary,target);
}

export class Store {
  readonly messages:string[]=[];
  private queues=new Map<string,Promise<unknown>>();
  private damaged=new Set<string>();
  constructor(readonly root:string){}
  async read<T>(name:string,fallback:T,valid:(value:unknown)=>boolean):Promise<T>{
    const file=path.join(this.root,name);
    for(const suffix of ['', '.bak']){
      try{const value=JSON.parse(await readFile(file+suffix,'utf8'));if(!valid(value))throw new Error('Invalid data');if(suffix)this.messages.push(`Відновлено резервну копію ${name}.`);return value as T;}
      catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT'&&!suffix){this.damaged.add(name);this.messages.push(`Файл ${name} пошкоджений або несумісний; перевіряю резервну копію.`);}}
    }
    return structuredClone(fallback);
  }
  async write(name:string,value:unknown):Promise<void>{
    if(path.isAbsolute(name)||!path.resolve(this.root,name).startsWith(path.resolve(this.root)+path.sep))throw new Error('Шлях має залишатися в папці статистики.');
    const previous=this.queues.get(name)||Promise.resolve();
    const next=previous.catch(()=>{}).then(async()=>{
      const file=path.join(this.root,name),content=JSON.stringify(value,null,2);
      await mkdir(path.dirname(file),{recursive:true});
      let priorRaw:string|undefined;try{priorRaw=await readFile(file,'utf8');}catch{}
      if(!this.damaged.has(name)&&priorRaw===content)return;
      if(!this.damaged.has(name)&&priorRaw!==undefined)try{
        const prior=JSON.parse(priorRaw);
        if([1,2].includes(prior?.version)){
          let bakRaw:string|undefined;try{bakRaw=await readFile(file+'.bak','utf8');}catch{}
          if(bakRaw!==priorRaw)await writeDurable(file+'.bak',priorRaw);
        }
      }catch{}
      await writeDurable(file,content);
      if(this.damaged.has(name)){this.damaged.delete(name);const idx=this.messages.indexOf(`Файл ${name} пошкоджений або несумісний; перевіряю резервну копію.`);if(idx>=0)this.messages.splice(idx,1);}
    });this.queues.set(name,next);await next;
  }
  async flush(){await Promise.all([...this.queues.values()]);}
  async settings(coursePath:string,enabledAfterDay=dayKey(new Date())){
    const defaults:Settings={version:1,setupComplete:false,autoStart:false,statisticsPath:this.root,coursePath,activeModuleId:'postgresql',minPracticeMinutes:5,dailyEnabledAfterDay:enabledAfterDay,englishEnabled:true,englishEnabledAfterDay:kyivDayKey(new Date()),englishStartHour:19,sqlAIEnabled:true,sqlLearningBonus:true,sqlAIFallback:true};
    const saved=await this.read('settings.json',defaults,value=>{const s=value as Settings;return s?.version===1&&typeof s.setupComplete==='boolean'&&typeof s.autoStart==='boolean'&&modules.has(s.activeModuleId)&&typeof s.coursePath==='string'&&(s.durationMinutes===undefined||validDurations(s.durationMinutes))&&(s.startTimes===undefined||validStarts(s.startTimes))&&(s.minPracticeMinutes===undefined||[5,7,10,15].includes(s.minPracticeMinutes))&&(s.dailyEnabledAfterDay===undefined||/^\d{4}-\d{2}-\d{2}$/.test(s.dailyEnabledAfterDay))&&(s.englishEnabled===undefined||typeof s.englishEnabled==='boolean')&&(s.englishEnabledAfterDay===undefined||/^\d{4}-\d{2}-\d{2}$/.test(s.englishEnabledAfterDay))&&(s.englishStartHour===undefined||Number.isInteger(s.englishStartHour)&&s.englishStartHour>=17&&s.englishStartHour<=22)&&['sqlAIEnabled','sqlLearningBonus','sqlAIFallback'].every(key=>(s as any)[key]===undefined||typeof (s as any)[key]==='boolean')&&(s.englishCoursePath===undefined||typeof s.englishCoursePath==='string');});
    return {...defaults,...saved};
  }
  schedule(){return this.read<ScheduleState>('schedule.json',newSchedule(new Date()),v=>{const s=v as ScheduleState;return s?.version===1&&/^\d{4}-\d{2}-\d{2}$/.test(s.dayKey)&&Number.isFinite(s.activeMs)&&s.activeMs>=0&&Number.isFinite(s.delayMs)&&s.delayMs>=3600000&&s.delayMs<=7200000&&Number.isFinite(s.lastTick)&&(s.snoozedUntil===undefined||Number.isFinite(s.snoozedUntil)&&s.snoozedUntil>=0)&&(s.warningRemainingMs===undefined||Number.isFinite(s.warningRemainingMs)&&s.warningRemainingMs>=0&&s.warningRemainingMs<=120000)&&['eligible','warned','triggered','finished'].every(k=>typeof (s as unknown as Record<string,unknown>)[k]==='boolean');});}
  module(id:string){const module=getModule(id);return this.read<ModuleState>(`modules/${id}/state.json`,{version:1,moduleId:id,progress:null,history:{}},v=>{
    const s=v as ModuleState;if(s?.version!==1||s.moduleId!==id||!s.history||typeof s.history!=='object'||Array.isArray(s.history))return false;
    if(s.learnedTopicIds!==undefined&&(!Array.isArray(s.learnedTopicIds)||!s.learnedTopicIds.every(topic=>module.catalog.some(t=>t.id===topic))))return false;
    if(s.progress&&(s.progress.moduleId!==id||s.progress.catalogVersion!==module.manifest.version||!Array.isArray(s.progress.confirmedTopicIds)||!s.progress.confirmedTopicIds.every(id=>module.catalog.some(t=>t.id===id))))return false;
    return Object.values(s.history).every(h=>h&&module.catalog.some(t=>t.id===h.topicId)&&Number.isInteger(h.intervalIndex)&&h.intervalIndex>=-1&&h.intervalIndex<=4&&!Number.isNaN(Date.parse(h.dueAt))&&[h.independent,h.assisted,h.missed].every(n=>Number.isFinite(n)&&n>=0));
  });}
  async sessions():Promise<SessionRecord[]>{
    let names:string[]=[];try{names=await readdir(path.join(this.root,'sessions'));}catch{}
    const records=await Promise.all(names.filter(n=>/^[\w-]+\.json$/.test(n)).map(n=>this.read<SessionRecord|null>(`sessions/${n}`,null,validSession)));
    return records.filter((s):s is SessionRecord=>!!s).sort((a,b)=>a.startedAt.localeCompare(b.startedAt));
  }
  saveSession(session:SessionRecord){if(!validSession(session))throw new Error('Некоректна сесія.');return this.write(`sessions/${session.id}.json`,session);}
  async source(id:string):Promise<unknown|null>{try{return JSON.parse(await readFile(path.join(this.root,`modules/${id}/progress-source.json`),'utf8'));}catch{return null;}}
}
export function validSession(value:unknown):boolean {
  const s=value as SessionRecord;
  if(!s||!Array.isArray(s.tasks)||s.tasks.length<3||s.tasks.length>5)return false;
  const count=s.tasks.length;
  return s.version===1&&/^[\w-]{1,100}$/.test(s.id)&&typeof s.moduleId==='string'&&/^[a-z0-9-]+$/.test(s.moduleId)&&modules.has(s.moduleId)&&typeof s.startedAt==='string'&&!Number.isNaN(Date.parse(s.startedAt))&&['daily','practice','demo'].includes(s.mode)&&Number.isFinite(s.activeMs)&&s.activeMs>=0&&Number.isInteger(s.currentIndex)&&s.currentIndex>=0&&s.currentIndex<count&&(s.paused===undefined||typeof s.paused==='boolean')&&(s.durationMinutes===undefined||validDuration('postgresql',s.durationMinutes))&&(s.baseTaskCount===undefined||s.baseTaskCount===3)&&s.tasks.every(t=>t&&t.moduleId===s.moduleId&&typeof t.id==='string'&&typeof t.templateId==='string'&&Array.isArray(t.topicIds)&&Array.isArray(t.tables)&&Array.isArray(t.hints)&&t.hints.every(h=>typeof h==='string'))&&Array.isArray(s.answers)&&s.answers.length===count&&s.answers.every(a=>typeof a==='string'&&a.length<=100000)&&Array.isArray(s.hintLevels)&&s.hintLevels.length===count&&s.hintLevels.every(n=>Number.isSafeInteger(n)&&n>=0)&&Array.isArray(s.solved)&&s.solved.length===count&&s.solved.every(b=>typeof b==='boolean')&&Array.isArray(s.taskElapsedMs)&&s.taskElapsedMs.length===count&&s.taskElapsedMs.every(n=>Number.isFinite(n)&&n>=0)&&Array.isArray(s.attempts)&&s.attempts.length<3000&&s.attempts.every(a=>a&&typeof a.taskId==='string'&&typeof a.answer==='string'&&['correct','incorrect','error','ran'].includes(a.status)&&typeof a.technical==='boolean'&&typeof a.check==='boolean');
}
