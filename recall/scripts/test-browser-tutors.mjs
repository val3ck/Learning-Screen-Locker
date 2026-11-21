import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {_electron as electron,chromium} from 'playwright';

const executablePath=process.env.RECALL_TEST_EXE;
if(!executablePath)throw Error('Set RECALL_TEST_EXE to the packaged build.');
const data=await mkdtemp(path.join(os.tmpdir(),'recall-browser-tutor-ui-'));
const env={...process.env,RECALL_DEMO_DATA_DIR:data,RECALL_TEST_BROWSER_TUTORS:'1',RECALL_TEST_BROWSER_GUARD:'1'};
delete env.ELECTRON_RUN_AS_NODE;
const app=await electron.launch({executablePath,args:['--demo'],env,timeout:60000});
let browser;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn,label){
  for(let i=0;i<110;i++){
    const result=await fn();
    if(result)return result;
    await pause(125);
  }
  throw Error('Timed out: '+label);
}
async function endpoint(id){
  const file=path.join(data,'browser-tutors',id,'recall-endpoint.json');
  return until(()=>readFile(file,'utf8').then(JSON.parse).catch(()=>null),id+' endpoint');
}
function site(origin,code){
  return app.evaluate(async({webContents},{origin,code})=>{
    const target=webContents.getAllWebContents().find(w=>w.getURL().startsWith(origin+'/'));
    return target?target.executeJavaScript(code):null;
  },{origin,code});
}
async function verifyLuna(origin,menu,tab){
  await until(()=>site(origin,`(() => {
    const button=document.querySelector(${JSON.stringify(tab)});
    if(!button||button.hidden)return false;
    if(!button.getClientRects().length)document.querySelector(${JSON.stringify(menu)}).click();
    if(!button.getClientRects().length)return false;
    button.click();
    return !!document.querySelector('.tutor-luna textarea');
  })()`),'Luna tab');
  await site(origin,`(() => {
    const form=document.querySelector('.tutor-luna form');
    const limit=form.querySelector('select');
    limit.value='20';limit.dispatchEvent(new Event('change'));
    form.querySelector('[data-chat="minimal"]').click();
    form.querySelector('textarea').value='How should I start?';
    form.requestSubmit();
  })()`);
  await until(()=>site(origin,'document.querySelectorAll(".tutor-luna-log > div").length===2'),'Luna main reply');
  await site(origin,`(() => {
    const form=document.querySelector('.tutor-luna form');
    form.querySelector('textarea').value='/btw What does this command do?';
    form.requestSubmit();
  })()`);
  await until(()=>site(origin,'!document.querySelector(".tutor-luna-side").hidden'),'Luna side reply');
  assert.equal(await site(origin,'document.querySelectorAll(".tutor-luna-log > div").length'),2);
  assert.deepEqual(await site(origin,'window.recallTutorChat.preferences()'),{limit:20,minimal:false});
  await site(origin,'document.querySelector(".tutor-luna [data-chat=clear]").click()');
  assert.equal(await site(origin,'document.querySelector(".tutor-luna-log").hidden && document.querySelector(".tutor-luna-side").hidden'),true);
}
const control=()=>until(()=>app.windows().find(w=>w.url()==='recall://app/browser-tutor.html'),'tutor controls');
try{
  const dashboard=await app.firstWindow();
  await dashboard.locator('#start-git').waitFor();
  const settings=await dashboard.evaluate(()=>window.recall.bootstrap());
  assert.equal(settings.startTimes.git,null);assert.equal(settings.startTimes.vim,null);
  assert.deepEqual(settings.tracks.git,{done:0,total:22});
  assert.deepEqual(settings.tracks.vim,{done:0,total:58});
  await app.evaluate(({BrowserWindow})=>{
    BrowserWindow.prototype.setKiosk=function(){};
    BrowserWindow.prototype.setFullScreen=function(){};
    BrowserWindow.prototype.setAlwaysOnTop=function(){};
  });
  await dashboard.locator('#start-git').click();
  const git=await endpoint('git'),gitControls=await control();
  await until(()=>site(git.origin,'!document.querySelector("#command")?.disabled && !!window.recallSaveTutor'),'Git editor ready');
  assert.equal(await site(git.origin,'typeof window.require'), 'undefined');
  assert.equal(await site(git.origin,'typeof window.recallTutor'), 'undefined');
  await verifyLuna(git.origin,'#menu','[data-drawer-tab="luna"]');
  const gitApi=async input=>{
    const response=await fetch(git.origin+'/api',{method:'POST',headers:{Origin:git.origin,'Content-Type':'application/json','X-Git-Tutor-Token':git.token},body:JSON.stringify(input)});
    const result=await response.json();assert.equal(response.status,200,result.error);return result;
  };
  await gitApi({type:'state'});
  await gitApi({type:'run',command:'git init -b main'});
  await gitApi({type:'run',command:'git status -sb'});
  const checked=await gitApi({type:'check'});
  assert.equal(checked.done,true);
  assert.equal((await dashboard.evaluate(()=>window.recall.trackProgress())).git.done,1);
  await gitControls.getByRole('button',{name:'Зберегти й вийти'}).click();
  await until(()=>gitControls.isClosed(),'Git saved and closed');

  await dashboard.locator('#start-vim').click();
  const vim=await endpoint('vim'),vimControls=await control();
  await until(()=>site(vim.origin,'typeof window.recallSaveTutor === "function"'),'Vim editor ready');
  assert.equal(await site(vim.origin,'typeof window.require'),'undefined');
  await verifyLuna(vim.origin,'#menu-toggle','[data-tab="luna"]');
  await vimControls.getByRole('button',{name:'Зберегти й вийти'}).click();
  await until(()=>vimControls.isClosed(),'Vim saved and closed');

  browser=await chromium.launch({channel:'msedge',headless:true});
  const original=await browser.newPage();
  await original.addInitScript(()=>{
    localStorage.setItem('neovim-quest-v1',JSON.stringify({
      progress:[1,0,0,0,0,0,0,0,0],examCompleted:Array.from({length:9},()=>[false,false,false]),
      sandbox:'Browser lesson draft',experience:4,session:{sandbox:true},
    }));
  });
  await original.goto(vim.origin);
  await until(async()=>{const summary=await fetch(vim.origin+'/api/recall/status').then(r=>r.json());return summary.done===1;},'legacy browser progress synchronized');
  await original.close();
  assert.equal((await dashboard.evaluate(()=>window.recall.trackProgress())).vim.done,1);
  await dashboard.locator('#start-vim').click();
  const resumed=await control();
  await until(()=>site(vim.origin,'typeof window.recallSaveTutor === "function"'),'Vim reopened');
  const saved=await fetch(vim.origin+'/api/recall/progress').then(r=>r.json());
  assert.equal(saved.state.sandbox,'Browser lesson draft');
  await app.evaluate(()=>globalThis.__recallTutorExpire());
  await resumed.getByRole('button',{name:'Зберегти й вийти'}).click();
  await until(()=>resumed.isClosed(),'Vim saved and closed again');
  assert.equal((await dashboard.evaluate(()=>window.recall.trackProgress())).vim.done,1);
  console.log('PASS Git and Vim Luna tabs, /btw, clear, context, concise toggle, real Git grading, Vim browser migration and safe exit.');
}finally{
  if(browser)await browser.close();
  await app.evaluate(({BrowserWindow,app})=>{
    for(const window of BrowserWindow.getAllWindows())if(window.webContents.getURL()==='recall://app/browser-tutor.html')window.emit('query-session-end',{});
    setTimeout(()=>app.exit(0),7000).unref();
  }).catch(()=>{});
  await app.close();
}
