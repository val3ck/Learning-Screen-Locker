import {_electron as electron} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import os from 'node:os';
await fs.mkdir('artifacts',{recursive:true});
const env={...process.env,RECALL_TEST_CLOCK:'1'};delete env.ELECTRON_RUN_AS_NODE;
env.RECALL_DEMO_DATA_DIR=await fs.mkdtemp(path.join(os.tmpdir(),'sql-recall-demo-ui-'));
const executable=process.env.RECALL_TEST_EXE||createRequire(import.meta.url)('electron');
const packaged=!!process.env.RECALL_TEST_EXE;
const launch=()=>electron.launch({executablePath:executable,args:[...(packaged?[]:['.']),'--demo'],env,timeout:60000});
let app=await launch();
const errors=[];
const suppressPresentation=()=>app.evaluate(({BrowserWindow,screen})=>{
  const win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('/index.html'));
  win.__focusCalls=[];for(const method of ['setKiosk','setFullScreen','setAlwaysOnTop','setBounds'])win[method]=(...args)=>win.__focusCalls.push([method,...args]);
  const original=BrowserWindow.prototype.showInactive;
  if(!BrowserWindow.prototype.__recallTest){BrowserWindow.prototype.__recallTest=true;BrowserWindow.prototype.showInactive=function(){if(!this.webContents.getURL().includes('/cover.html'))return original.call(this);};}
  const primary=screen.getPrimaryDisplay();const bounds={x:primary.bounds.x+primary.bounds.width,y:primary.bounds.y,width:800,height:600};screen.getAllDisplays=()=>[primary,{...primary,id:primary.id+999,bounds,workArea:bounds}];
});
try{
  const page=await app.firstWindow({timeout:60000});page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')console.log('BROWSER:',message.text());});
  await page.getByRole('button',{name:'Потренуватися зараз'}).waitFor();
  await page.screenshot({path:'artifacts/home.png',fullPage:true});
  await page.getByRole('button',{name:'Історія повторень'}).click();await page.getByRole('heading',{name:'Повернення до знань.'}).waitFor();
  await page.screenshot({path:'artifacts/statistics.png',fullPage:true});
  await page.getByRole('button',{name:'Сьогодні',exact:false}).click();
  await page.getByRole('button',{name:'Налаштування'}).click();
  const scheduleBefore=(await page.evaluate(()=>window.recall.bootstrap())).schedule;
  const warningPromise=app.waitForEvent('window');
  await page.getByRole('button',{name:'Перевірити попередження',exact:true}).click();
  const warning=await warningPromise;await warning.getByRole('button',{name:'Ні (відкласти на 30 хв)',exact:true}).waitFor();
  const panelState=await app.evaluate(({BrowserWindow,globalShortcut})=>{const win=BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('попередження'));return {focusable:win.isFocusable(),focused:win.isFocused(),registered:globalShortcut.isRegistered('Control+Shift+A')};});
  assert.equal(panelState.focusable,false);assert.equal(panelState.focused,false);
  const status=await warning.evaluate(()=>window.recallWarning.status());assert.equal(status.shortcutAvailable,panelState.registered);assert.ok(status.remainingSeconds>100);
  assert.equal(await warning.getByRole('heading',{name:'Готовий?',exact:true}).count(),1);assert.equal(await warning.getByRole('button').count(),2);
  await warning.screenshot({path:'artifacts/warning.png'});
  const warningClosed=warning.waitForEvent('close');
  await warning.getByRole('button',{name:'Ні (відкласти на 30 хв)',exact:true}).click();
  await warningClosed;
  const scheduleAfter=(await page.evaluate(()=>window.recall.bootstrap())).schedule;assert.deepEqual(scheduleAfter,scheduleBefore,'Preview must not change the real schedule');
  await page.getByRole('button',{name:'Сьогодні',exact:false}).click();
  await page.getByRole('button',{name:'Пара / демонстрація · 30 хв',exact:true}).click();
  const deferred=await page.evaluate(()=>window.recall.bootstrap());assert.ok(deferred.schedule.snoozedUntil>Date.now()+29*60000);
  await suppressPresentation();
  await page.getByRole('button',{name:'Потренуватися зараз'}).click();
  await page.getByText('PostgreSQL готовий',{exact:true}).waitFor({timeout:60000});
  assert.equal(await page.locator('.sidebar').isVisible(),false);
  const focusState=await app.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('/index.html')),cover=BrowserWindow.getAllWindows().find(w=>w.getTitle()==='SQL Recall · monitor');return {calls:win.__focusCalls,closable:win.isClosable(),cover:cover&&{closable:cover.isClosable(),focusable:cover.isFocusable(),bounds:cover.getBounds()}};});
  assert.ok(focusState.calls.some(c=>c[0]==='setKiosk'&&c[1]===true));assert.ok(focusState.calls.some(c=>c[0]==='setFullScreen'&&c[1]===true));assert.equal(focusState.closable,false);assert.equal(focusState.cover.closable,false);assert.equal(focusState.cover.focusable,false);assert.ok(focusState.cover.bounds.width>=800);assert.ok(focusState.cover.bounds.height>=600);
  await page.screenshot({path:'artifacts/exercise.png',fullPage:true});
  for(let index=0;index<5;index++){
    const session=await page.evaluate(()=>window.recall.bootstrap().then(data=>data.activeSession));assert.ok(session);
    assert.equal(session.currentIndex,index);
    if(index===0){
      await page.getByRole('textbox',{name:'Твій SQL'}).fill('SELECT 999 AS wrong;');
      await page.getByRole('button',{name:'Перевірити ↗',exact:true}).click();
      await page.locator('#feedback.incorrect').waitFor({timeout:60000});
      await page.locator('#hint').click();assert.ok((await page.locator('#hint-content').innerText()).includes('ПІДКАЗКА 1'));
    }
    await page.getByRole('textbox',{name:'Твій SQL'}).fill(session.tasks[index].payload.solution);
    await page.getByRole('button',{name:'Перевірити ↗',exact:true}).click();
    if(index<2){
      await page.locator('#feedback.correct').waitFor({timeout:60000});
      if(index===0){
        await page.getByRole('button',{name:'Розбір і варіанти',exact:true}).click();
        await page.locator('.solution-review .recommended').waitFor();
        assert.ok(await page.locator('.solution-review .alternative').count()>=1);
        await page.locator('.solution-review .alternative > summary').first().click();
        await page.locator('.solution-review').screenshot({path:'artifacts/review-during-practice.png'});
      }
      await page.getByRole('button',{name:'Наступна вправа ↗',exact:true}).click();
    }
    if(index<4)await page.getByText(new RegExp(`ВПРАВА ${index+2} ІЗ`)).waitFor();
  }
  await page.getByRole('heading',{name:'Практику завершено.'}).waitFor();
  await page.locator('.summary-solutions > summary').click();
  assert.equal(await page.locator('.summary-task .recommended').count(),5);
  await page.locator('.summary-task .alternative > summary').first().click();
  assert.ok((await page.locator('.summary-solutions').innerText()).includes('Типова пастка'));
  await page.locator('.summary-task').first().screenshot({path:'artifacts/solution-review.png'});
  await page.screenshot({path:'artifacts/summary.png',fullPage:true});
  const final=await page.evaluate(()=>window.recall.bootstrap());assert.equal(final.sessions.at(-1).outcome,'completed');assert.equal(final.sessions.at(-1).solved.filter(Boolean).length,5);
  await page.locator('.next-lesson > summary').click();assert.ok((await page.locator('.next-lesson').innerText()).includes('Зв’язки таблиць'));
  assert.equal(final.settings.autoStart,false);assert.ok(final.settings.statisticsPath.includes('sql-recall-demo-'));
  await page.getByRole('button',{name:'На головну ↗',exact:true}).click();
  await page.getByRole('button',{name:'Історія повторень'}).click();
  await page.getByRole('button',{name:'Розбір ↗',exact:true}).click();
  await page.locator('.summary-solutions > summary').click();
  assert.equal(await page.locator('.summary-task .recommended').count(),5);
  const restored=await page.evaluate(()=>window.recall.bootstrap());
  assert.deepEqual(restored.module,final.module,'Review must not update mastery or scheduling');
  // Exercise the actual daily focus lifecycle, while replacing only window
  // presentation so this test cannot cover the user's desktop or monitors.
  await suppressPresentation();
  await page.evaluate(()=>window.recall.resumeDaily());
  await page.getByText('PostgreSQL готовий',{exact:true}).waitFor({timeout:60000});
  await page.getByRole('textbox',{name:'Твій SQL'}).fill('-- draft preserved through meeting pause\nSELECT 123;');
  const beforeSnooze=await page.evaluate(()=>window.recall.bootstrap());
  await page.evaluate(()=>window.recall.snooze());
  const locked=await page.evaluate(()=>window.recall.bootstrap());assert.equal(!!locked.activeSession.paused,false);assert.equal(locked.activeSession.id,beforeSnooze.activeSession.id);
  assert.equal(await page.locator('.sidebar').isVisible(),false);assert.equal(await page.locator('#snooze-session').count(),0);
  await page.screenshot({path:'artifacts/focus-exercise.png',fullPage:true});
  const native=await app.evaluate(({BrowserWindow,globalShortcut})=>{const win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('/index.html'));win.close();return {id:win.id,destroyed:win.isDestroyed(),closable:win.isClosable(),minimizable:win.isMinimizable(),hotkey:globalShortcut.isRegistered('Control+Shift+A')};});
  assert.equal(native.destroyed,false);assert.equal(native.closable,false);assert.equal(native.minimizable,false);assert.equal(native.hotkey,false);
  await app.evaluate(({app})=>app.quit());assert.ok((await page.evaluate(()=>window.recall.bootstrap())).activeSession);
  await assert.rejects(()=>page.evaluate(async()=>{const data=await window.recall.bootstrap();const s=data.activeSession;s.outcome='surrendered';s.endedAt=new Date().toISOString();await window.recall.finishSession(s);}));
  // System session-end is the OS-controlled escape path, never cancelled by us.
  const pausedId=locked.activeSession.id;
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('/index.html')).emit('query-session-end',{}));
  await app.close();
  app=await launch();const resumedPage=await app.firstWindow({timeout:60000});
  await resumedPage.getByRole('heading',{name:'Практику відкладено.'}).waitFor();
  const afterRestart=await resumedPage.evaluate(()=>window.recall.bootstrap());
  assert.equal(afterRestart.activeSession.id,pausedId);assert.equal(afterRestart.activeSession.paused,true);assert.equal(afterRestart.activeSession.endedAt,undefined);assert.ok(afterRestart.activeSession.answers[0].includes('draft preserved'));
  await suppressPresentation();
  await resumedPage.getByRole('button',{name:'Продовжити зараз ↗',exact:true}).click();
  await resumedPage.getByText('PostgreSQL готовий',{exact:true}).waitFor({timeout:60000});
  assert.ok((await resumedPage.getByRole('textbox',{name:'Твій SQL'}).inputValue()).includes('draft preserved'));
  const continued=await resumedPage.evaluate(()=>window.recall.bootstrap());assert.equal(continued.activeSession.id,pausedId);assert.equal(continued.activeSession.paused,false);
  await app.evaluate(()=>globalThis.__recallAdvance(15*60000));
  await resumedPage.evaluate(async()=>{const data=await window.recall.bootstrap();const s=data.activeSession;s.outcome='surrendered';s.endedAt=new Date().toISOString();await window.recall.finishSession(s);});
  const unlocked=await app.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('/index.html'));return {closable:win.isClosable(),minimizable:win.isMinimizable()};});assert.equal(unlocked.closable,true);assert.equal(unlocked.minimizable,true);
  // A genuinely abrupt exit has no explicit OS-pause flag. Recover its data,
  // mark the day finished, and never bring the fullscreen task back today.
  await app.close();
  const crash={...continued.activeSession,id:`${Date.now()}-crash-recovery`,paused:false};delete crash.endedAt;delete crash.outcome;
  await fs.writeFile(path.join(env.RECALL_DEMO_DATA_DIR,'sessions',`${crash.id}.json`),JSON.stringify(crash));
  app=await launch();const recoveredPage=await app.firstWindow({timeout:60000});
  await recoveredPage.getByRole('button',{name:'Потренуватися зараз'}).waitFor();
  const recovered=await recoveredPage.evaluate(()=>window.recall.bootstrap());
  assert.equal(recovered.activeSession,null);assert.equal(recovered.sessions.find(s=>s.id===crash.id).outcome,'interrupted');assert.equal(recovered.schedule.finished,true);
  assert.deepEqual(errors,[]);console.log('PASS Electron UI: two-button notification, manual fullscreen on two monitors, bounded bonuses, task-only view, blocked close/quit/snooze, 15-minute surrender, OS shutdown preservation, draft recovery, crash without re-lock.');
}finally{try{await app.evaluate(({BrowserWindow})=>{for(const win of BrowserWindow.getAllWindows())win.emit('query-session-end',{});});}catch{}await app.close();}
