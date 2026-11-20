import {mkdir,readFile,writeFile,rename,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {lessons} from './course.js';
import {projectSteps} from './project.js';
import {conceptLessons} from './concepts.js';
import {checkpoint} from './checkpoint.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const catalog=[...lessons,...projectSteps,...conceptLessons,checkpoint].map(l=>({title:l.title,module:l.module}));
const catalogVersion=JSON.stringify(catalog);
let queue=Promise.resolve();
const validCompleted=value=>Array.isArray(value)&&value.every(i=>Number.isInteger(i)&&i>=0&&i<catalog.length);
const validState=s=>s&&validCompleted(s.completed)&&s.drafts&&typeof s.drafts==='object'&&!Array.isArray(s.drafts)&&Object.values(s.drafts).every(v=>typeof v==='string'&&v.length<100000)&&Number.isInteger(s.index)&&s.index>=0&&s.index<catalog.length&&(s.play===undefined||typeof s.play==='string'&&s.play.length<100000)&&(s.conceptAnswers===undefined||s.conceptAnswers&&typeof s.conceptAnswers==='object'&&!Array.isArray(s.conceptAnswers)&&Object.values(s.conceptAnswers).every(a=>Array.isArray(a)&&a.length<=4&&a.every(v=>v===null||Number.isInteger(v)&&v>=0&&v<4)))&&(s.unlockedThrough===undefined||Number.isInteger(s.unlockedThrough)&&s.unlockedThrough>=0&&s.unlockedThrough<catalog.length)&&(s.freeExplore===undefined||typeof s.freeExplore==='boolean');
async function directory(){
  let statisticsPath=path.join(process.env.LOCALAPPDATA||path.join(homedir(),'AppData','Local'),'SQL Recall','statistics');
  try{({statisticsPath}=JSON.parse(await readFile(path.join(root,'recall-config.json'),'utf8')));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(typeof statisticsPath!=='string'||!path.isAbsolute(statisticsPath))throw new Error('Recall statistics path is not configured.');
  return path.join(statisticsPath,'modules','postgresql');
}
async function readJSON(file){for(const suffix of ['', '.bak'])try{return JSON.parse(await readFile(file+suffix,'utf8'));}catch{}return null;}
async function atomic(file,value){await writeFile(file+'.tmp',JSON.stringify(value,null,2),'utf8');try{JSON.parse(await readFile(file,'utf8'));await copyFile(file,file+'.bak');}catch{}await rename(file+'.tmp',file);}
export async function recallBridge(req,res){
  const pathname=new URL(req.url,'http://127.0.0.1').pathname;
  if(!pathname.startsWith('/api/recall/'))return false;
  const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  const hosts=['127.0.0.1:4173','localhost:4173'];
  if(!hosts.includes(req.headers.host)||req.headers.origin&&!hosts.map(h=>'http://'+h).includes(req.headers.origin)){send(403,{error:'Only the local course can sync progress.'});return true;}
  if(pathname==='/api/recall/status'&&req.method==='GET'){send(200,{recall:true,version:2});return true;}
  if(pathname==='/api/recall/progress'&&req.method==='GET'){
    try{await queue.catch(()=>{});const dir=await directory(),source=await readJSON(path.join(dir,'progress-source.json')),trainer=await readJSON(path.join(dir,'trainer-state.json'));send(200,{version:1,catalogVersion,completed:source?.catalogVersion===catalogVersion&&validCompleted(source.completed)?source.completed:[],trainerState:trainer?.catalogVersion===catalogVersion&&validState(trainer.state)?trainer.state:null});}catch(error){send(400,{error:error.message||'Could not read progress'});}return true;
  }
  if(pathname!=='/api/recall/progress'||req.method!=='POST'){send(404,{error:'Not found'});return true;}
  if(!String(req.headers['content-type']||'').startsWith('application/json')){send(415,{error:'JSON required'});return true;}
  try{
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;if(size>2000000){send(413,{error:'Progress too large'});return true;}chunks.push(chunk);}
    const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if(body.version!==1||body.catalogVersion!==catalogVersion||!validCompleted(body.completed)||body.trainerState!==undefined&&!validState(body.trainerState)){send(400,{error:'Incompatible course progress'});return true;}
    const snapshot={version:1,catalogVersion,completed:[...new Set(body.completed)],syncedAt:new Date().toISOString()};
    const dir=await directory();
    const save=queue.catch(()=>{}).then(async()=>{
      await mkdir(dir,{recursive:true});const file=path.join(dir,'progress-source.json'),prior=await readJSON(file);
      if(prior?.catalogVersion===catalogVersion&&validCompleted(prior.completed))snapshot.completed=[...new Set([...prior.completed,...snapshot.completed])];
      await atomic(file,snapshot);
      if(body.trainerState){const target=path.join(dir,'trainer-state.json'),old=await readJSON(target),previous=old?.catalogVersion===catalogVersion&&validState(old.state)?old.state:{};const state={...body.trainerState,completed:snapshot.completed,drafts:{...previous.drafts,...body.trainerState.drafts},conceptAnswers:{...previous.conceptAnswers,...body.trainerState.conceptAnswers}};await atomic(target,{version:1,catalogVersion,state,syncedAt:snapshot.syncedAt});}
    });
    queue=save;await save;send(200,{ok:true});
  }catch(error){send(400,{error:error.message||'Could not sync progress'});}
  return true;
}
