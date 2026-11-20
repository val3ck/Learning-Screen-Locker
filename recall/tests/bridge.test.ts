import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,copyFile,writeFile,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {Readable} from 'node:stream';
import {SOURCE_VERSION} from '../src/modules/postgresql/progress';
test('Локальний міст зберігає тільки валідний прогрес та відхиляє чужий Origin',{timeout:30000},async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'recall-bridge-'));
  try{
    await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
    for(const name of ['course.js','project.js','concepts.js','checkpoint.js'])await copyFile(path.resolve('../SQL',name),path.join(dir,name));
    await copyFile('integration/recall-bridge.mjs',path.join(dir,'recall-bridge.mjs'));
    const stats=path.join(dir,'statistics');await writeFile(path.join(dir,'recall-config.json'),JSON.stringify({statisticsPath:stats}));
    const {recallBridge}=await import(pathToFileURL(path.join(dir,'recall-bridge.mjs')).href);
    async function request(body:unknown,origin='http://127.0.0.1:4173',host='127.0.0.1:4173',method='POST'){
      const req=Object.assign(Readable.from([Buffer.from(JSON.stringify(body))]),{url:'/api/recall/progress',method,headers:{host,origin,'content-type':'application/json'}});
      let status=0,text='';const res={writeHead(code:number){status=code;},end(value:string){text=value;}};await recallBridge(req,res);return {status,text};
    }
    assert.equal((await request({version:1,catalogVersion:SOURCE_VERSION,completed:[0,37]})).status,200);
    const saved=JSON.parse(await readFile(path.join(stats,'modules/postgresql/progress-source.json'),'utf8'));assert.deepEqual(saved.completed,[0,37]);
    const trainerState={completed:[0,37],drafts:{0:'SELECT * FROM customers;'},index:1,play:'SELECT 42;',conceptAnswers:{},unlockedThrough:2,freeExplore:false};
    assert.equal((await request({version:1,catalogVersion:SOURCE_VERSION,completed:[0,37],trainerState})).status,200);
    assert.equal((await request({version:1,catalogVersion:SOURCE_VERSION,completed:[]})).status,200);
    const restored=JSON.parse((await request({},'http://127.0.0.1:4173','127.0.0.1:4173','GET')).text);
    assert.deepEqual(restored.completed,[0,37]);assert.equal(restored.trainerState.drafts[0],trainerState.drafts[0]);assert.equal(restored.trainerState.index,1);
    assert.equal((await request({version:1,catalogVersion:SOURCE_VERSION,completed:[],trainerState:{...trainerState,index:999}})).status,400);
    assert.equal((await request({},'https://untrusted.example','127.0.0.1:4173','GET')).status,403);
    assert.equal((await request({version:1,catalogVersion:SOURCE_VERSION,completed:[99]})).status,400);
    assert.equal((await request({},'https://untrusted.example')).status,403);
    assert.equal((await request({},'http://127.0.0.1:4173','untrusted.example')).status,403);
  }finally{await rm(dir,{recursive:true,force:true});}
});
