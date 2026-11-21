import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chapters } from './dist/course.js';

export const maxSnapshotBytes=2_000_000;
const total=chapters.reduce((sum,chapter)=>sum+chapter.missions.length+3,0);
function validSnapshot(state){
  return !!state&&typeof state==='object'&&!Array.isArray(state)&&
    Array.isArray(state.progress)&&state.progress.length===chapters.length&&state.progress.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=chapters[i].missions.length)&&
    Array.isArray(state.examCompleted)&&state.examCompleted.length===chapters.length&&state.examCompleted.every(row=>Array.isArray(row)&&row.length===3&&row.every(done=>typeof done==='boolean'));
}
function summary(state){
  return {done:state?state.progress.reduce((sum,n)=>sum+n,0)+state.examCompleted.flat().filter(Boolean).length:0,total};
}
const fresh=()=>({version:1,revision:0,state:null,summary:summary(null)});
export function progressStore(directory){
  const file=path.join(directory,'progress-v1.json');
  let tail=Promise.resolve();
  async function read(){
    let invalid=false;
    for(const suffix of ['', '.bak'])try{
      const doc=JSON.parse(await readFile(file+suffix,'utf8'));
      if(doc.version!==1||!Number.isSafeInteger(doc.revision)||doc.revision<1||!validSnapshot(doc.state))throw Error('Invalid progress');
      return {...doc,summary:summary(doc.state),recovered:!!suffix};
    }catch(error){if(error.code!=='ENOENT')invalid=true;}
    if(invalid)throw Error('Збереження Neovim Quest пошкоджене.');
    return fresh();
  }
  function write(input){
    const operation=tail.then(async()=>{
      if(!Number.isSafeInteger(input?.revision)||input.revision<0||!validSnapshot(input.state))throw Error('Некоректний прогрес.');
      const old=await read();
      if(old.revision!==input.revision)return {status:409,body:{revision:old.revision,error:'Прогрес оновився в іншому вікні.'}};
      const next={version:1,revision:old.revision+1,state:input.state,summary:summary(input.state)};
      await mkdir(directory,{recursive:true});
      const temporary=file+'.'+randomUUID()+'.tmp';
      try{
        await writeFile(temporary,JSON.stringify(next),{flag:'wx'});
        if(old.revision&&!old.recovered)await copyFile(file,file+'.bak');
        await rename(temporary,file);
      }finally{await rm(temporary,{force:true}).catch(()=>{});}
      return {status:200,body:{revision:next.revision,summary:next.summary}};
    });
    tail=operation.then(()=>{},()=>{});
    return operation;
  }
  return {read,write};
}
