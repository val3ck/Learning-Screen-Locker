import {_electron as electron} from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const packaged=!!env.RECALL_TEST_EXE;
const app=await electron.launch({executablePath:env.RECALL_TEST_EXE||createRequire(import.meta.url)('electron'),args:[...(packaged?[]:['.']),'--smoke'],env,timeout:60000});
try{
  const page=await app.firstWindow();await page.getByText('Зробимо повторення звичкою?',{exact:true}).waitFor();
  const boot=await page.evaluate(()=>window.recall.bootstrap());assert.ok(boot.settings.statisticsPath.includes('sql-recall-smoke-'));assert.equal(boot.settings.setupComplete,false);
  const preferences=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().map(w=>w.webContents.getLastWebPreferences()));
  assert.equal(preferences.length,1);assert.equal(preferences[0].nodeIntegration,false);assert.equal(preferences[0].contextIsolation,true);assert.equal(preferences[0].sandbox,true);
  assert.equal(await page.evaluate(()=>typeof window.require),'undefined');
  console.log('PASS native desktop startup, tray initialization, secure preload, first-run setup, isolated smoke statistics.');
}finally{await app.close();}
