import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,copyFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {SOURCE_VERSION} from '../src/modules/postgresql/progress';

test('Тренажер відновлює дисковий прогрес у чистому браузері й береже поточні чернетки',async()=>{
  const temp=await mkdtemp(path.join(tmpdir(),'recall-course-sync-'));
  const oldFetch=globalThis.fetch,descriptor=Object.getOwnPropertyDescriptor(globalThis,'document');
  try{
    await writeFile(path.join(temp,'package.json'),'{"type":"module"}');
    for(const name of ['course.js','project.js','concepts.js','checkpoint.js'])await copyFile(path.resolve('../SQL',name),path.join(temp,name));
    await copyFile(path.resolve('integration/recall-sync.js'),path.join(temp,'recall-sync.js'));
    Object.defineProperty(globalThis,'document',{configurable:true,value:{addEventListener(){}}});
    const remote={completed:[0,1],drafts:{0:'SELECT 7;',1:'SELECT 8;'},conceptAnswers:{},index:2,play:'SELECT 9;',unlockedThrough:2,freeExplore:false};
    globalThis.fetch=async()=>new Response(JSON.stringify({version:1,catalogVersion:SOURCE_VERSION,completed:[0,1],trainerState:remote}));
    const {restoreRecallProgress}=await import(pathToFileURL(path.join(temp,'recall-sync.js')).href);
    const fresh={completed:[],drafts:{},conceptAnswers:{},index:0,play:'',unlockedThrough:0,freeExplore:false};
    const restored=await restoreRecallProgress(fresh);assert.deepEqual(restored.completed,[0,1]);assert.equal(restored.index,2);assert.equal(restored.drafts[1],'SELECT 8;');assert.equal(restored.play,'SELECT 9;');
    const current=await restoreRecallProgress({...fresh,completed:[4],drafts:{1:'SELECT 100;'},index:4});
    assert.deepEqual(current.completed,[0,1,4]);assert.equal(current.drafts[1],'SELECT 100;');assert.equal(current.drafts[0],'SELECT 7;');assert.equal(current.index,4);
    globalThis.fetch=async()=>new Response('{}',{status:503});assert.deepEqual(await restoreRecallProgress(fresh),fresh);
  }finally{globalThis.fetch=oldFetch;if(descriptor)Object.defineProperty(globalThis,'document',descriptor);else Reflect.deleteProperty(globalThis,'document');await rm(temp,{recursive:true,force:true});}
});
