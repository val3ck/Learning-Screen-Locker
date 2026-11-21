import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile,mkdir,mkdtemp,realpath,rm,utimes,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {promisify} from 'node:util';

const exec=promisify(execFile);
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');

test('Windows launch selects the newest verified package and falls back after an incomplete or damaged build', {skip:process.platform!=='win32'}, async ()=>{
  const root=await realpath(await mkdtemp(path.join(os.tmpdir(),'recall-release-')));
  const launcher=path.join(root,'scripts','launch-recall.ps1');
  const ps=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
  async function fixture(name:string,readyAt?:Date){
    const directory=path.join(root,name);
    const executable=path.join(directory,'win-unpacked','SQL Recall.exe');
    const archive=path.join(directory,'win-unpacked','resources','app.asar');
    const payload='archive content for '+name;
    await mkdir(path.dirname(archive),{recursive:true});
    await writeFile(executable,'test executable');
    await writeFile(archive,payload);
    if(readyAt){
      const marker=path.join(directory,'release-ready.json');
      await writeFile(marker,JSON.stringify({
        schema:1,product:'sql-recall',exeBytes:Buffer.byteLength('test executable'),archiveBytes:Buffer.byteLength(payload),
        exeSha256:hash('test executable'),archiveSha256:hash(payload),
      }));
      await utimes(marker,readyAt,readyAt);
    }
    return {executable,archive,payload};
  }
  async function selected(){
    return (await exec(ps,['-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',launcher,'-Background','-PrintTarget'],{windowsHide:true})).stdout.trim();
  }
  try{
    await mkdir(path.dirname(launcher),{recursive:true});
    await copyFile(new URL('../scripts/launch-recall.ps1',import.meta.url),launcher);
    const legacy=await fixture('release');
    await fixture('release-local-incomplete');
    assert.equal(await selected(),legacy.executable);
    const previous=await fixture('release-local-previous',new Date('2026-11-20T13:00:00Z'));
    const latest=await fixture('release-local-latest',new Date('2026-11-21T13:00:00Z'));
    assert.equal(await selected(),latest.executable);
    await writeFile(latest.archive,'x'.repeat(latest.payload.length));
    assert.equal(await selected(),previous.executable);
    await writeFile(previous.executable,'x'.repeat('test executable'.length));
    assert.equal(await selected(),legacy.executable);
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});
