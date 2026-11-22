import {_electron as electron} from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const packaged=!!env.RECALL_TEST_EXE;
const app=await electron.launch({executablePath:env.RECALL_TEST_EXE||createRequire(import.meta.url)('electron'),args:[...(packaged?[]:['.']),'--smoke','--background'],env,timeout:60000});
const child=app.process();
try{
  const page=await app.firstWindow();await page.getByText('Зробимо повторення звичкою?',{exact:true}).waitFor();
  const boot=await page.evaluate(()=>window.recall.bootstrap());assert.ok(boot.settings.statisticsPath.includes('sql-recall-smoke-'));assert.equal(boot.settings.setupComplete,false);
  assert.deepEqual(Object.keys(boot.tracks),['postgresql','english','nodejs','git','vim']);
  assert.equal(await page.locator('#sidebar-tracks li').count(),5);
  await page.getByRole('button',{name:'Курси',exact:true}).click();
  await page.getByRole('heading',{name:'Курси',exact:true}).waitFor();
  const pilot=(await page.evaluate(()=>window.recall.folderCourses())).courses.find(course=>course.id==='docker-compose');
  if(pilot){
    await page.locator('[data-open-course="docker-compose"]').click();
    await page.getByRole('heading',{name:pilot.title,exact:true}).waitFor();
    const question=page.locator('form[data-activity="database-host"]');
    await question.getByRole('textbox').fill('db');
    await question.getByRole('button',{name:'Перевірити'}).click();
    await question.getByText('✓ Зараховано',{exact:true}).waitFor();
    assert.equal((await page.evaluate(()=>window.recall.folderCourses())).courses.find(course=>course.id==='docker-compose').lessons[0].activities[0].passed,true);
  }
  const preferences=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().map(w=>w.webContents.getLastWebPreferences()));
  assert.equal(preferences.length,1);assert.equal(preferences[0].nodeIntegration,false);assert.equal(preferences[0].contextIsolation,true);assert.equal(preferences[0].sandbox,true);
  assert.equal(await page.evaluate(()=>typeof window.require),'undefined');
  const closed=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('Recall did not finish its native shutdown.')),15000);
    child.once('exit',code=>{
      clearTimeout(timeout);
      if(code===0)resolve();
      else reject(Error('Recall quit with exit code '+code));
    });
  });
  void app.evaluate(({app})=>{setTimeout(()=>{app.quit();app.quit();},0);}).catch(()=>{});
  await closed;
  console.log('PASS native desktop startup, secure preload, isolated smoke statistics and repeated native quit.');
}finally{
  if(child.exitCode===null&&child.signalCode===null)child.kill();
  await app.close().catch(()=>{});
}
