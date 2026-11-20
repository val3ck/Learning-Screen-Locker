import path from 'node:path';
import {copyFile,mkdir,readFile,readdir,stat} from 'node:fs/promises';
import {Store} from './store';
import {modules} from '../src/modules/registry';
import {updateHistory} from '../src/core/session';
import {dayKey} from '../src/core/calendar';
import type {ModuleState,SessionRecord} from '../src/core/contracts';

/** Import each legacy location once. Originals and a migration backup stay intact. */
export async function migrateLegacyStatistics(destination:Store,candidates:string[],now=new Date()){
  const marker=await destination.read<{version:1;roots:string[]}>('migration.json',{version:1,roots:[]},v=>!!v&&typeof v==='object'&&(v as any).version===1&&Array.isArray((v as any).roots));
  const roots:string[]=[],visited=new Set<string>([path.resolve(destination.root)]),queue=[...candidates];
  while(queue.length&&visited.size<16){
    const root=path.resolve(queue.shift()!);if(visited.has(root))continue;visited.add(root);
    let setting:any;try{setting=JSON.parse(await readFile(path.join(root,'settings.json'),'utf8'));}catch{}
    if(typeof setting?.statisticsPath==='string'&&path.isAbsolute(setting.statisticsPath))queue.push(setting.statisticsPath);
    try{if((await stat(root)).isDirectory()&&!marker.roots.includes(root))roots.push(root);}catch{}
  }
  if(!roots.length)return;
  const all=[destination,...roots.map(root=>new Store(root))];
  const records=new Map<string,SessionRecord>();
  for(const store of all)for(const record of await store.sessions()){
    if(record.mode==='demo')continue;
    const prior=records.get(record.id);
    if(!prior||Number(!!record.endedAt)>Number(!!prior.endedAt)||!!record.endedAt===!!prior.endedAt&&(record.attempts.length>prior.attempts.length||record.activeMs>prior.activeMs))records.set(record.id,record);
  }
  const backupRoot=path.join(destination.root,'migration-backups',`${now.getTime()}`);
  for(let i=0;i<roots.length;i++){
    // Copy only owned JSON data, never links or arbitrary directory trees.
    const backup=async(relative:string)=>{const from=path.join(roots[i],relative),to=path.join(backupRoot,String(i),relative);try{if((await stat(from)).isFile()){await mkdir(path.dirname(to),{recursive:true});await copyFile(from,to);}}catch{}};
    for(const file of ['settings.json','schedule.json'])await backup(file);
    for(const id of modules.keys())for(const file of ['state.json','progress-source.json','trainer-state.json'])await backup(`modules/${id}/${file}`);
    let names:string[]=[];try{names=await readdir(path.join(roots[i],'sessions'));}catch{}
    for(const name of names.filter(n=>/^[\w-]+\.json(?:\.bak)?$/.test(n)))await backup(`sessions/${name}`);
  }
  const sessions=[...records.values()].sort((a,b)=>a.startedAt.localeCompare(b.startedAt));
  for(const record of sessions)await destination.saveSession(record);
  // Keep a single settings/schedule pair. A moved copy must not reset setup.
  for(const name of ['settings.json','schedule.json']){
    try{await readFile(path.join(destination.root,name));continue;}catch{}
    let newest:{root:string;mtime:number}|undefined;
    for(const root of roots)try{const info=await stat(path.join(root,name));if(!newest||info.mtimeMs>newest.mtime)newest={root,mtime:info.mtimeMs};}catch{}
    if(newest)try{const value=JSON.parse(await readFile(path.join(newest.root,name),'utf8'));if(value.version===1)await destination.write(name,value);}catch{}
  }
  for(const [id,module] of modules){
    if(module.manifest.capabilities.includes('lesson'))continue;
    const states=await Promise.all(all.map(s=>s.module(id)));
    const validProgress=states.map(s=>s.progress).filter((p):p is NonNullable<ModuleState['progress']>=>!!p);
    for(const store of all){const source=await store.source(id);if(source)try{validProgress.push(module.progressAdapter.parse(source));}catch{}}
    const merged=validProgress.length?{
      ...validProgress.sort((a,b)=>a.syncedAt.localeCompare(b.syncedAt)).at(-1)!,
      confirmedTopicIds:[...new Set(validProgress.flatMap(p=>p.confirmedTopicIds))],
      practiceTopicIds:[...new Set(validProgress.flatMap(p=>p.practiceTopicIds))],
      completedSourceIds:[...new Set(validProgress.flatMap(p=>p.completedSourceIds))]
    }:null;
    let state:ModuleState={version:1,moduleId:id,progress:merged,history:{}};
    for(const record of sessions.filter(s=>s.moduleId===id&&s.endedAt))state=updateHistory(state,record);
    // Retain topic history when no surviving session can reconstruct it.
    for(const old of states)for(const [topic,history] of Object.entries(old.history))if(!state.history[topic]||history.lastReviewedAt>state.history[topic].lastReviewedAt)state.history[topic]=history;
    await destination.write(`modules/${id}/state.json`,state);
    // The newest raw source must not later overwrite merged confirmed progress.
    const sources=[];for(const store of all){const source=await store.source(id);if(source)try{module.progressAdapter.parse(source);sources.push(source);}catch{}}
    if(sources.length){
      const newest=sources.at(-1) as Record<string,unknown>;
      if(sources.every(s=>Array.isArray((s as any).completed))){const completed=[...new Set(sources.flatMap(s=>(s as any).completed))];await destination.write(`modules/${id}/progress-source.json`,{...newest,completed});}
    }
  }
  const settings=await destination.settings('');
  const firstKnownDay=sessions[0]&&dayKey(new Date(sessions[0].startedAt));
  if(firstKnownDay&&firstKnownDay<settings.dailyEnabledAfterDay)settings.dailyEnabledAfterDay=firstKnownDay;
  await destination.write('settings.json',{...settings,statisticsPath:destination.root});
  await destination.write('migration.json',{version:1,roots:[...new Set([...marker.roots,...roots])],migratedAt:now.toISOString()});
  destination.messages.push('Прогрес і повторення об’єднано в постійній папці даних. Резервні копії збережено в migration-backups.');
}
