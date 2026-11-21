const endpoint='/api/recall/progress';

export async function connectProgress(local,key,chapters){
  let remote;
  try{
    const result=await fetch(endpoint,{signal:AbortSignal.timeout(2000),cache:'no-store'});
    if(!result.ok)return {state:local,enqueue:()=>{},flush:async()=>false};
    remote=await result.json();
    if(remote.version!==1||!Number.isSafeInteger(remote.revision)||!/^[a-f0-9]{48}$/.test(remote.token))throw Error('Incompatible progress');
  }catch{return {state:local,enqueue:()=>{},flush:async()=>false};}
  let marked=false,unsynced=null;
  try{
    marked=localStorage.getItem(key+'-shared')==='1';
    unsynced=JSON.parse(localStorage.getItem(key+'-unsynced')||'null');
  }catch{}
  const normalize=value=>({
    ...value,
    progress:chapters.map((c,i)=>Math.min(c.missions.length,Math.max(0,Math.trunc(Number(value.progress?.[i])||0)))),
    examCompleted:chapters.map((_,i)=>[0,1,2].map(j=>Array.isArray(value.examCompleted?.[i])?value.examCompleted[i][j]===true:j<(Number(value.examProgress?.[i])||0))),
  });
  let state=normalize(remote.state||local);
  const incoming=unsynced||(!marked&&Object.keys(local).length?local:null);
  if(remote.state&&incoming){
    const legacy=normalize(incoming),shared=normalize(remote.state);
    try{localStorage.setItem(key+(unsynced?'-draft-before-sync':'-before-recall'),JSON.stringify(incoming));}catch{}
    const hasWork=value=>value.progress.some(Boolean)||value.examCompleted.some(row=>row.some(Boolean))||value.session?.sandbox||value.practice;
    if(!hasWork(shared)&&hasWork(legacy))state={...legacy};
    else if(!shared.practice&&legacy.practice)state={...shared,practice:legacy.practice,session:legacy.session};
    state.progress=shared.progress.map((n,i)=>Math.max(n,legacy.progress[i]));
    state.examCompleted=shared.examCompleted.map((row,i)=>row.map((n,j)=>n||legacy.examCompleted[i][j]));
  }
  let revision=remote.revision,pending=null,committed=remote.state?JSON.stringify(remote.state):'',timer,operation,conflict=false;
  function notify(message){
    let status=document.querySelector('#recall-sync-status');
    if(!status){
      status=document.createElement('p');status.id='recall-sync-status';status.setAttribute('role','status');
      status.style.cssText='position:fixed;z-index:40;top:5px;left:8px;margin:0;padding:5px 8px;color:#e9f3e4;background:#29352d;font:12px system-ui;pointer-events:none';
      document.body.append(status);
    }
    status.textContent=message;
  }
  async function flush(){
    clearTimeout(timer);
    if(operation)await operation;
    if(conflict)return false;
    if(!pending||pending===committed)return true;
    const body=pending;pending=null;
    operation=(async()=>{
      try{
        const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Vim-Tutor-Token':remote.token},
          body:JSON.stringify({revision,state:JSON.parse(body)}),keepalive:body.length<35000,signal:AbortSignal.timeout(5000)});
        if(response.status===409){
          conflict=true;
          try{localStorage.setItem(key+'-unsynced',body);}catch{}
          notify('Зміни збережено в цьому вікні. У спільному збереженні є новіший прогрес.');
          return false;
        }
        if(!response.ok)throw Error('Save failed');
        revision=(await response.json()).revision;committed=body;
        try{localStorage.setItem(key+'-shared','1');localStorage.removeItem(key+'-unsynced');}catch{}
        document.querySelector('#recall-sync-status')?.remove();
        return true;
      }catch{
        pending??=body;
        notify('Чернетка збережена локально. Не вдалося синхронізувати з Recall.');
        return false;
      }
    })();
    const ok=await operation;operation=null;
    return ok;
  }
  function enqueue(next){
    pending=JSON.stringify(next);
    clearTimeout(timer);timer=setTimeout(()=>void flush(),200);
  }
  if(incoming){
    enqueue(state);
    await flush();
  }
  return {state,enqueue,flush};
}
