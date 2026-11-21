import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { _electron as electron, chromium } from 'playwright';

const require = createRequire(import.meta.url);
const course = path.resolve('../nodejs');
const data = await mkdtemp(path.join(os.tmpdir(),'recall-node-e2e-'));
const courseServer = spawn(process.execPath, [path.join(course,'dist-server','recall.cjs')], {
  env: {...process.env, BACKEND_PATH_DATA_DIR:path.join(data,'website'), BACKEND_PATH_PORT:'0'},
  cwd:course, windowsHide:true, stdio:['ignore','pipe','inherit'],
});
let web, app;
const port = await new Promise((resolve,reject)=>{
  const timeout = setTimeout(()=>reject(Error('Test server did not announce its port')),15000);
  courseServer.stdout.on('data', value=>{
    const match = String(value).match(/listening on (\d+)/);
    if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
  });
  courseServer.once('error',reject);
  courseServer.once('exit',code=>{clearTimeout(timeout); reject(Error('Test server exited '+code));});
});
const origin = 'http://127.0.0.1:' + port;
const snapshot = () => fetch(origin+'/api/backend-path/progress').then(r=>r.json());
const waitFor = async (fn, description) => {
  for (let n=0; n<100; n++) {
    if (await fn()) return;
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  throw Error('Timed out: '+description);
};
async function findWindow(value) {
  await waitFor(()=>app.windows().some(w=>w.url().includes(value)),value);
  return app.windows().find(w=>w.url().includes(value));
}
async function counts() {
  return app.evaluate(({ BrowserWindow })=>({
    covers:BrowserWindow.getAllWindows().filter(w=>w.webContents.getURL().endsWith('/cover.html')).length,
    locked:BrowserWindow.getAllWindows().some(w=>w.webContents.getURL().includes('/#/lesson/')&&!w.isClosable()),
    powerOff:globalThis.__recallNodeSleepCount||0,
  }));
}
try {
  web = await chromium.launch({channel:'msedge',headless:true});
  const normal = await web.newPage();
  await normal.addInitScript(()=>{
    const key='backend-path.strong-junior.v1';
    if (!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify({
      version:1,lastLessonId:'setup-tools',duration:60,activity:[],projects:{},
      lessons:{'setup-tools':{read:false,checks:[],quizPassed:false,notes:'Збережена нотатка з браузера',
        step:'lecture',completedAt:null,nextReviewAt:null,reviewCount:0}},
    }));
  });
  await normal.goto(origin+'/#/lesson/setup-tools');
  await waitFor(async()=>!!(await snapshot()).progress?.lessons['setup-tools']?.notes,'original browser import');
  assert.equal(await normal.evaluate(()=>typeof window.recallNode),'undefined');
  console.log('PASS original browser import, ordinary site with Recall closed');

  const env = {...process.env,RECALL_TEST_CLOCK:'1',RECALL_TEST_NODE_GUARD:'1',RECALL_TEST_NODE_PORT:String(port),RECALL_DEMO_DATA_DIR:path.join(data,'recall')};
  delete env.ELECTRON_RUN_AS_NODE;
  app = await electron.launch({executablePath:env.RECALL_TEST_EXE||require('electron'),args:[...(env.RECALL_TEST_EXE?[]:['.']),'--demo'],env,timeout:60000});
  const dashboard = await app.firstWindow();
  await dashboard.locator('#nav-english').waitFor();
  const tracks=await dashboard.evaluate(()=>window.recall.trackProgress());
  assert.equal(tracks.english.total,84);
  assert.equal(tracks.nodejs.done,0);assert.ok(tracks.nodejs.total>0);
  assert.equal(await dashboard.locator('#sidebar-tracks li').count(),3);
  await dashboard.locator('#nav-settings').click();
  for(const [id,minutes] of Object.entries({postgresql:'15',english:'55',nodejs:'40'})){
    assert.equal(await dashboard.locator('#duration-'+id).inputValue(),minutes);
  }
  await dashboard.locator('#duration-nodejs').fill('30');
  await dashboard.getByRole('button',{name:'Зберегти тривалість'}).click();
  await dashboard.getByText('Тривалість наступних занять збережено.').waitFor();
  const configured=await dashboard.evaluate(()=>window.recall.bootstrap());
  assert.deepEqual(configured.settings.durationMinutes,{postgresql:15,english:55,nodejs:30});
  await app.evaluate(({BrowserWindow,screen})=>{
    BrowserWindow.prototype.setKiosk=function(){};
    BrowserWindow.prototype.setFullScreen=function(){};
    BrowserWindow.prototype.setAlwaysOnTop=function(){};
    const inactive=BrowserWindow.prototype.showInactive;
    BrowserWindow.prototype.showInactive=function(){if(!this.webContents.getURL().endsWith('/cover.html'))inactive.call(this);};
    const primary=screen.getPrimaryDisplay();
    screen.getAllDisplays=()=>[primary,{...primary,id:primary.id+1234,bounds:{x:primary.bounds.width,y:0,width:800,height:600}}];
    globalThis.__recallNodeSettings();
  });
  const settings = await findWindow('node-night-settings.html');
  assert.equal(await settings.locator('#key').getAttribute('type'),'password');
  assert.equal(await settings.locator('#key').inputValue(),'');
  await settings.locator('#preview').click();
  let prompt = await findWindow('app/node-night.html');
  await prompt.getByText(/до 30 хв/).waitFor();
  await prompt.locator('#sleep').click();
  await waitFor(async()=> (await counts()).powerOff===1,'mock shutdown request');
  await settings.locator('#preview').click();
  prompt = await findWindow('app/node-night.html');
  await prompt.locator('#learn').click();
  const study = await findWindow(origin+'/#/lesson/setup-tools');
  study.on('close',()=>console.log('study window closed'));
  study.on('pageerror',e=>console.log('study error',e.message));
  await study.locator('.night-bar').waitFor();
  console.log('opened protected study with mocked presentation');
  assert.equal(await study.evaluate(()=>typeof window.require),'undefined');
  await waitFor(async()=> (await counts()).covers===1,'additional display cover');
  assert.equal((await counts()).locked,true);
  assert.equal(await study.locator('.notes-label textarea').inputValue(),'Збережена нотатка з браузера');
  const lunaLauncher=study.locator('.node-chat-launcher');
  await lunaLauncher.click();
  await study.locator('#node-chat-question').fill('Що в цьому уроці треба перевірити?');
  await study.locator('.node-chat-actions button[type=submit]').click();
  const lunaReply=study.locator('.node-chat-assistant');
  await lunaReply.waitFor();
  assert.match(await lunaReply.textContent(),/Демо Luna/);
  await lunaLauncher.click();
  await study.getByRole('button',{name:'Переходжу до практики'}).click();
  await study.getByRole('button',{name:/Ще один крок/}).click();
  await study.getByRole('button',{name:'Практика в редакторі',exact:true}).click();
  await waitFor(async()=>(await counts()).covers===0,'editor exit removed covers');
  assert.equal((await counts()).locked,false);
  console.log('editor available');
  await normal.reload();
  await normal.locator('.notes-label textarea').fill('Після редактора: тест пройшов.');
  await waitFor(async()=> (await snapshot()).progress.lessons['setup-tools'].notes==='Після редактора: тест пройшов.','new note on normal site');
  // Re-enter through the same hook as the tray action.
  await app.evaluate(()=>globalThis.__recallNodeResume());
  await study.locator('.night-criterion input').first().check();
  await waitFor(async()=> (await snapshot()).progress.lessons['setup-tools'].checks.includes(0),'desktop practice written to course');
  assert.equal((await snapshot()).progress.lessons['setup-tools'].completedAt,null);
  console.log('saved practice', await counts());
  await app.evaluate(()=>globalThis.__recallNodeTick(Date.now()+31*60_000));
  console.log('clock advanced',await counts(),study.isClosed());
  console.log('updated bar', await study.locator('.night-bar').innerText());
  await study.locator('.night-bar strong').filter({hasText:/Час минув|Підхід завершено/}).waitFor({timeout:10000});
  await waitFor(async()=>(await counts()).covers===0,'time limit removed covers');
  assert.equal((await counts()).powerOff,1);
  await study.getByRole('button',{name:'Зберегти й вийти'}).click();
  await waitFor(()=>study.isClosed(),'close after the time cap');
  await normal.reload();
  await normal.getByRole('tab',{name:'Перевірка'}).click();
  assert.equal(await normal.locator('.lesson-criteria input').first().isChecked(),true);
  assert.equal(await normal.locator('.notes-label textarea').inputValue(),'Після редактора: тест пройшов.');
  console.log('PASS permission boundary, mock power-off, two display covers, original course, Luna demo, editor, shared practice, configured 30-minute release');
} finally {
  if (app) {
    await app.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())if(w.webContents.getURL().includes('/#/lesson/'))w.emit('query-session-end',{});}).catch(()=>{});
    await app.close();
  }
  if (web) await web.close();
  courseServer.kill();
}
