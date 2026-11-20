import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import Installer from '../integration/install-english.cjs';
import {EnglishHost} from '../electron/english-host';
const require=createRequire(import.meta.url);
test('English bridge: браузер ↔ desktop, власник, ревізія та аудіо; оригінальні дані збережено',async()=>{
  const temp=await mkdtemp(path.join(tmpdir(),'english-bridge-'));
  try{
    const course=path.join(temp,'english'),stats=path.join(temp,'statistics'),original=path.resolve('../english');await mkdir(path.join(course,'js/daily'),{recursive:true});
    for(const name of ['server.js','index.html','js/daily/course.js','js/daily/examples.js','js/daily/engine.js','js/daily/ui.js'])await copyFile(path.join(original,name),path.join(course,name));
    await writeFile(path.join(course,'package.json'),'{"type":"commonjs"}');Installer.installEnglish(course,stats,fileURLToPath(new URL('../integration',import.meta.url)));
    const E=require(path.join(course,'js/daily/engine.js')),bridge=require(path.join(course,'english-bridge.cjs'));
    const owner='browser-123456',read=()=>bridge.handle('/api/recall/state','GET',{}, {root:course}),post=(body:any)=>bridge.handle('/api/recall/state','POST',{owner,...body},{root:course});
    let result=await read();assert.equal(result.status,200);
    const legacy=E.defaultState({learnedWords:{existing:{mastery:1}}});
    result=await post({revision:0,course:legacy,import:true});assert.equal(result.status,200);assert.equal(result.body.course.activeSession,null);assert.equal(result.body.course.familiarWords.length,1);assert.equal(result.body.revision,1);
    const data=new Map<string,string>();const engine=new E.Engine({getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v)});engine.start();engine.setAnswer('monologue','My saved browser answer.');engine.tick(1000);
    result=await post({revision:1,course:engine.state,import:true});assert.equal(result.status,200);assert.equal(result.body.revision,2);assert.equal(result.body.course.familiarWords.length,1);
    const host=new EnglishHost(stats);assert.equal(host.readonly(),true);assert.throws(()=>host.start());
    await bridge.handle('/api/recall/release','POST',{owner},{root:course});host.start();assert.equal(host.view().attempt!.answers.monologue,'My saved browser answer.');
    result=await post({revision:2,course:engine.state});assert.equal(result.status,409);
    host.pause();result=await read();assert.equal(result.body.readonly,false);assert.equal(result.body.course.activeSession.paused,true);
    const revision=result.body.revision;result=await post({revision:0,course:engine.state});assert.equal(result.status,409);await bridge.handle('/api/recall/release','POST',{owner},{root:course});
    engine.pause(true);result=await post({revision,course:engine.state});assert.equal(result.status,200);
    const audio=await bridge.handle('/api/recall/audio','POST',{owner,key:engine.current().id+':monologue',base64:'AQID',mime:'audio/webm'},{root:course});assert.equal(audio.status,200);
    const saved=await bridge.handle('/api/recall/audio-read','POST',{owner,key:engine.current().id+':monologue'},{root:course});assert.equal(saved.body.audio.base64,'AQID');
    assert.ok((await readFile(path.join(course,'js/daily/engine.js'),'utf8')).includes("timeZone:'Europe/Kyiv'"));assert.ok((await readFile(path.join(course,'js/daily/ui.js'),'utf8')).includes('EnglishRecallSync'));assert.ok((await readFile(path.join(course,'server.js'),'utf8')).includes('recallStatisticsPath'));
  }finally{await rm(temp,{recursive:true,force:true});}
});
