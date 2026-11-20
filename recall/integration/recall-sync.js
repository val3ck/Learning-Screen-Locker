import {lessons} from './course.js';
import {projectSteps} from './project.js';
import {conceptLessons} from './concepts.js';
import {checkpoint} from './checkpoint.js';
const catalogVersion=JSON.stringify([...lessons,...projectSteps,...conceptLessons,checkpoint].map(l=>({title:l.title,module:l.module})));
let timer,last='',pending=null,busy=false;
export function queueRecallProgress(completed,trainerState){pending={version:1,catalogVersion,completed:[...completed],...(trainerState?{trainerState:structuredClone(trainerState)}:{})};clearTimeout(timer);timer=setTimeout(flush,500);}
export async function restoreRecallProgress(local){
  try{const response=await fetch('/api/recall/progress',{signal:AbortSignal.timeout(5000)});if(!response.ok)return local;const saved=await response.json();if(saved.version!==1||saved.catalogVersion!==catalogVersion||!Array.isArray(saved.completed)||!saved.completed.every(i=>Number.isInteger(i)&&i>=0&&i<JSON.parse(catalogVersion).length))return local;
    const remote=saved.trainerState||{},hasLocal=local.completed.length||Object.keys(local.drafts).length||local.index>0;
    return {...(hasLocal?local:{...remote,...local,index:remote.index??local.index,play:remote.play??local.play}),completed:[...new Set([...saved.completed,...local.completed])],drafts:{...remote.drafts,...local.drafts},conceptAnswers:{...remote.conceptAnswers,...local.conceptAnswers}};
  }catch{return local;}
}
async function flush(){
  if(busy||!pending)return;
  const serialized=JSON.stringify(pending);if(serialized===last)return;
  busy=true;
  try{const result=await fetch('/api/recall/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:serialized,signal:AbortSignal.timeout(5000)});if(result.ok)last=serialized;}
  catch{}finally{busy=false;if(pending&&JSON.stringify(pending)!==last){clearTimeout(timer);timer=setTimeout(flush,30000);}}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void flush();});
