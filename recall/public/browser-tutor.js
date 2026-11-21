'use strict';
const api=window.recallTutor,$=id=>document.getElementById(id);
async function send(action,button){
  $('result').hidden=true;
  button.disabled=true;
  try{await api.action(action);}
  catch(error){
    $('result').textContent=error.message.replace(/^Error invoking remote method .*?: Error: /,'');
    $('result').hidden=false;
  }finally{button.disabled=false;}
}
void api.state().then(state=>{
  if(state.mode==='invite'){
    $('invite-title').textContent=state.title;
    $('invite').hidden=false;
    $('begin').onclick=()=>void send('start',$('begin'));
    $('later').onclick=()=>void send('snooze',$('later'));
    return;
  }
  $('title').textContent=state.title;
  $('bar').hidden=false;
  $('finish').onclick=()=>void send('finish',$('finish'));
  const renderClock=()=>{
    const left=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
    $('clock').textContent=left?Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'Час вийшов';
  };
  renderClock();setInterval(renderClock,1000);
}).catch(error=>{$('result').textContent=error.message;$('result').hidden=false;});
