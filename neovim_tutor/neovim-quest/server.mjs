import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { maxSnapshotBytes, progressStore } from './recall-progress.mjs';

const root=fileURLToPath(new URL('./dist/',import.meta.url));
const lunaAssets=new Map([
  ['/luna-chat.js',new URL('../../shared/tutor-luna.js',import.meta.url)],
  ['/luna-chat.css',new URL('../../shared/tutor-luna.css',import.meta.url)],
]);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const directory=process.env.VIM_TUTOR_DATA_DIR||path.join(process.env.LOCALAPPDATA||path.join(homedir(),'AppData','Local'),'Neovim Quest');
const endpoint=path.join(directory,'recall-endpoint.json');
const lock=path.join(directory,'.running');
const progress=progressStore(directory);
const token=randomBytes(24).toString('hex');
const preferredPort=Number(process.env.PORT)||4173;
let origin='',host='';

function json(res,status,body){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
}
function openBrowser(url){
  if(!process.argv.includes('--open'))return;
  const command=process.platform==='win32'?'rundll32.exe':process.platform==='darwin'?'open':'xdg-open';
  const args=process.platform==='win32'?['url.dll,FileProtocolHandler',url]:[url];
  const browser=spawn(command,args,{stdio:'ignore',windowsHide:true});
  browser.on('error',()=>console.log('Open this address in your browser: '+url));
  browser.unref();
}
async function readRequest(req){
  const parts=[];
  let bytes=0;
  for await(const data of req){
    bytes+=data.length;
    if(bytes>maxSnapshotBytes)throw Error('Запит задовгий.');
    parts.push(data);
  }
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Neovim-Quest','1');
  if(req.headers.host!==host){json(res,403,{error:'Використай локальну адресу Neovim Quest.'});return;}
  try{
    const url=new URL(req.url,origin);
    if(req.method==='GET'&&url.pathname==='/api/recall/status'){
      const {summary}=await progress.read();
      return json(res,200,{version:1,id:'vim',...summary});
    }
    if(url.pathname==='/api/recall/progress'){
      if(req.method==='GET'){
        const {revision,state}=await progress.read();
        return json(res,200,{version:1,revision,state,token});
      }
      if(req.method!=='POST'||req.headers.origin!==origin||req.headers['x-vim-tutor-token']!==token||
          !/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return json(res,403,{error:'Недійсний локальний сеанс.'});
      const result=await progress.write(await readRequest(req));
      return json(res,result.status,result.body);
    }
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    const lunaAsset=lunaAssets.get(url.pathname);
    if(lunaAsset){
      const body=await readFile(lunaAsset);
      res.writeHead(200,{'Content-Type':types[path.extname(lunaAsset.pathname)],'Cache-Control':'no-cache'});
      res.end(body);return;
    }
    const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
    const file=path.resolve(root,relative),mime=types[path.extname(file)];
    if(!file.startsWith(root)||!mime){res.writeHead(404).end();return;}
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache'});res.end(body);
  }catch(error){if(!res.headersSent)json(res,req.url.startsWith('/api/')?400:404,{error:'Не вдалося відкрити або зберегти дані Neovim Quest.'});else res.end();}
});
server.requestTimeout=15_000;

async function claim(){
  await mkdir(directory,{recursive:true});
  for(let attempt=0;attempt<2;attempt++){
    try{
      const fd=await open(lock,'wx');
      try{await fd.writeFile(String(process.pid));}finally{await fd.close();}
      return true;
    }catch(error){
      if(error.code!=='EEXIST')throw error;
      const pid=Number(await readFile(lock,'utf8'));
      if(!Number.isSafeInteger(pid)||pid<=0)throw Error('Neovim Quest запускається в іншому вікні.');
      try{process.kill(pid,0);}
      catch(probe){if(probe.code==='ESRCH'){await unlink(lock);continue;}throw probe;}
      try{
        const saved=JSON.parse(await readFile(endpoint,'utf8'));
        if(saved.pid===pid&&/^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(saved.origin)){
          console.log('Neovim Quest: '+saved.origin);openBrowser(saved.origin);
        }
      }catch{}
      return false;
    }
  }
  throw Error('Не вдалося відкрити збереження Neovim Quest.');
}

async function listen(port){
  return new Promise((resolve,reject)=>{
    const fail=error=>reject(error);
    server.once('error',fail);
    server.listen(port,'127.0.0.1',()=>{
      server.off('error',fail);
      host='127.0.0.1:'+server.address().port;
      origin='http://'+host;
      resolve();
    });
  });
}
async function main(){
  if(!await claim())return;
  try{
    const first=process.env.VIM_TUTOR_EPHEMERAL==='1'?0:preferredPort;
    for(let offset=0;;offset++){
      try{await listen(first+offset);break;}
      catch(error){if(error.code!=='EADDRINUSE'||offset>=10||first+offset>=65535)throw error;}
    }
    await writeFile(endpoint+'.tmp',JSON.stringify({version:1,id:'vim',pid:process.pid,origin}),{mode:0o600});
    await rename(endpoint+'.tmp',endpoint);
    console.log('Neovim Quest: '+origin);
    openBrowser(origin);
    let stopping=false;
    const stop=()=>{
      if(stopping)return;
      stopping=true;
      server.close(()=>void Promise.allSettled([unlink(endpoint),unlink(lock)]));
    };
    process.on('SIGTERM',stop);process.on('SIGINT',stop);
  }catch(error){
    server.close();
    await unlink(lock).catch(()=>{});
    throw error;
  }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
