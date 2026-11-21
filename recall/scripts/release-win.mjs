import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=await realpath(fileURLToPath(new URL('..',import.meta.url)));
const artifacts=path.join(root,'artifacts');
const modules=path.join(root,'node_modules');
const localPrefix='release-local-';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const exists=file=>access(file).then(()=>true,()=>false);

async function sha256(file){
  const hash=createHash('sha256');
  for await(const chunk of createReadStream(file))hash.update(chunk);
  return hash.digest('hex');
}

function run(args,env=process.env){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:root,env,stdio:'inherit',windowsHide:true});
    child.once('error',reject);
    child.once('close',(code,signal)=>{
      if(code===0)resolve();
      else reject(Error(path.basename(args[0])+' завершився з кодом '+(code??signal)));
    });
  });
}

async function lockRelease(){
  await mkdir(artifacts,{recursive:true});
  const lock=path.join(artifacts,'release-win.lock');
  for(let attempt=0;attempt<2;attempt++){
    let handle;
    try{handle=await open(lock,'wx');}
    catch(error){
      if(error.code!=='EEXIST')throw error;
      const owner=Number(await readFile(lock,'utf8'));
      if(!Number.isInteger(owner)||owner<=0)throw Error('Інша локальна збірка стартує.');
      try{process.kill(owner,0);}
      catch(probe){
        if(probe.code==='ESRCH'){await rm(lock);continue;}
        throw probe;
      }
      throw Error('Інша локальна збірка Recall вже працює.');
    }
    try{await handle.writeFile(String(process.pid));}
    catch(error){await rm(lock,{force:true}).catch(()=>{});throw error;}
    finally{await handle.close();}
    return ()=>rm(lock,{force:true});
  }
  throw Error('Не вдалося відкрити локальну збірку.');
}

async function ensureDependencies(npm){
  const lock=await json(path.join(root,'package-lock.json'));
  const manifest=lock.packages[''];
  for(const dependency of Object.keys({...manifest.dependencies,...manifest.devDependencies})){
    const expected=lock.packages['node_modules/'+dependency]?.version;
    const installed=await json(path.join(modules,dependency,'package.json')).catch(()=>null);
    if(!expected||installed?.version!==expected){
      await run([npm,'ci']);
      return;
    }
  }
}

async function cachedElectron(){
  const cache=process.env.ELECTRON_CACHE||path.join(process.env.LOCALAPPDATA||'','electron','Cache');
  if(!path.isAbsolute(cache))return null;
  const electron=await json(path.join(modules,'electron','package.json'));
  const file='electron-v'+electron.version+'-win32-'+process.arch+'.zip';
  const expected=(await json(path.join(modules,'electron','checksums.json')))[file];
  if(!expected||!await exists(cache))return null;
  const directories=await readdir(cache,{withFileTypes:true});
  for(const directory of [cache,...directories.filter(e=>e.isDirectory()).map(e=>path.join(cache,e.name))]){
    const candidate=path.join(directory,file);
    if(await exists(candidate)&&await sha256(candidate)===expected)return candidate;
  }
  return null;
}

async function publish(directory){
  const executable=path.join(directory,'win-unpacked','SQL Recall.exe');
  const archive=path.join(directory,'win-unpacked','resources','app.asar');
  const env={...process.env,RECALL_TEST_EXE:executable};
  delete env.ELECTRON_RUN_AS_NODE;
  await run(['scripts/smoke-desktop.mjs'],env);
  const [exeFile,asarFile,exeSha256,archiveSha256]=await Promise.all([
    stat(executable),stat(archive),sha256(executable),sha256(archive),
  ]);
  const version=(await json(path.join(root,'package.json'))).version;
  const marker={
    schema:1,product:'sql-recall',version,checkedAt:new Date().toISOString(),
    exeBytes:exeFile.size,archiveBytes:asarFile.size,exeSha256,archiveSha256,
  };
  const temporary=path.join(directory,'release-ready.json.tmp');
  await writeFile(temporary,JSON.stringify(marker,null,2),{flag:'wx'});
  await rename(temporary,path.join(directory,'release-ready.json'));
  console.log('Готовий реліз Recall '+version+' · '+directory);
  console.log('Лаунчер вибере його під час наступного повного запуску Recall.');
}

async function release(){
  if(process.platform!=='win32')throw Error('Локальний реліз Recall збирається на Windows.');
  const npm=process.env.npm_execpath;
  if(!npm)throw Error('Запусти npm run release:win з кореня Recall.');
  const unlock=await lockRelease();
  let directory,published=false;
  try{
    await ensureDependencies(npm);
    await run([npm,'run','build']);
    await run([path.join(modules,'tsx','dist','cli.mjs'),'--test','--test-concurrency=1',
      'tests/core.test.ts','tests/daily-focus.test.ts','tests/english*.test.ts','tests/learning-duration.test.ts','tests/track-clock.test.ts',
      'tests/local-release.test.ts','tests/node-night.test.ts','tests/progress.test.ts','tests/storage.test.ts',
    ]);
    directory=await mkdtemp(path.join(root,localPrefix));
    const cache=await cachedElectron();
    const options=['--win','dir','--publish','never','--config.directories.output='+directory];
    if(cache)options.push('--config.electronDist='+cache);
    await run([path.join(modules,'electron-builder','out','cli','cli.js'),...options]);
    await publish(directory);
    published=true;
  }finally{
    try{
      if(!published&&directory&&path.dirname(directory)===root&&path.basename(directory).startsWith(localPrefix)){
        const resolved=await realpath(directory).catch(()=>null);
        if(resolved===directory){
          await rm(directory,{recursive:true,force:true,maxRetries:3}).catch(error=>console.error('Тимчасова папка залишилась: '+error.message));
        }
      }
    }finally{await unlock();}
  }
}

release().catch(error=>{console.error('Локальний реліз не опубліковано. '+error.message);process.exitCode=1;});
