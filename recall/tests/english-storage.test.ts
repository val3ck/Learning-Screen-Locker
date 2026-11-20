import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import Repository from '../integration/english-repository.cjs';
import {newEnglishDocument,validateEnglishDocument} from '../src/modules/english/controller';
import {EnglishHost} from '../electron/english-host';
test('English repository: один власник, ревізії, резервна копія й локальне аудіо',async()=>{
  const temp=await mkdtemp(path.join(tmpdir(),'recall-english-кирилиця-'));
  try{const a=new Repository.EnglishRepository(temp,{validate:validateEnglishDocument,createDefault:newEnglishDocument}),b=new Repository.EnglishRepository(temp,{validate:validateEnglishDocument,createDefault:newEnglishDocument});
    const document=a.acquire('desktop');assert.throws(()=>b.acquire('browser-123456'));const saved=a.write(document,0,'desktop');assert.equal(saved.revision,1);assert.throws(()=>a.write(document,0,'desktop'));
    a.saveAudio('12345-abc:monologue',Buffer.from([1,2,3]),'audio/webm','desktop');assert.equal(a.loadAudio('12345-abc:monologue').base64,'AQID');assert.throws(()=>a.audioPath('../../secret'));
    a.release('desktop');b.acquire('browser-123456');const second=b.write(saved,1,'browser-123456');assert.equal(second.revision,2);b.release('browser-123456');
    await writeFile(path.join(temp,'state.json'),'{bad');assert.equal(a.read().revision,1);const recovered=a.write(a.read(),1,'desktop');assert.equal(recovered.revision,2);assert.equal(JSON.parse(await readFile(path.join(temp,'state.json.bak'),'utf8')).revision,1);
  }finally{await rm(temp,{recursive:true,force:true});}
});
test('English host: пошкоджене збереження не блокує SQL і відновлюється лише явним імпортом',async()=>{
  const temp=await mkdtemp(path.join(tmpdir(),'recall-english-recovery-'));
  try{const first=new EnglishHost(temp);first.start();first.pause();await writeFile(path.join(temp,'modules/english/state.json'),'{bad');await writeFile(path.join(temp,'modules/english/state.json.bak'),'{bad');
    const host=new EnglishHost(temp);assert.ok(host.recoveryError);assert.equal(host.readonly(),true);assert.throws(()=>host.start());const state=newEnglishDocument().course;host.import({format:'english-daily-progress',version:1,state});assert.equal(host.recoveryError,null);host.start();host.pause();
  }finally{await rm(temp,{recursive:true,force:true});}
});
