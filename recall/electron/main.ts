import {app,BrowserWindow,Menu,Tray,nativeImage,ipcMain,powerMonitor,Notification,screen,shell,dialog,protocol,net,globalShortcut} from 'electron';
import {readFile,stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Store,validSession} from './store';
import {SQLAI} from './sql-ai';
import {SQLChat} from './sql-chat';
import type {Bootstrap,ModuleState,ScheduleState,SessionRecord,Settings} from '../src/core/contracts';
import {getModule} from '../src/modules/registry';
import {tickSchedule,snoozeSchedule,WARNING_MS,needsWarning,automaticDayAllowed,hasFinishedToday,completeScheduleForDay} from '../src/core/scheduler';
import {createSession,updateHistory,canSurrender,addSpeedBonus,isStaleSessionUpdate,availableTopicIds,learnedTopics} from '../src/core/session';
import {dayKey,kyivDayKey,kyivParts} from '../src/core/calendar';
import {FocusClock} from '../src/core/learning';
import {EnglishHost} from './english-host';
import {EnglishSpeech} from './english-speech';
import AI from '../integration/english-ai.cjs';
import AIPrompts from '../integration/english-ai-prompts.cjs';
import Coaching from '../integration/english-coaching.cjs';
import Translation from '../integration/english-translation.cjs';
import * as EnglishCourse from '../src/modules/english/vendor/course';
import * as EnglishLearning from '../src/modules/english/vendor/learning';
import Language from '../integration/english-language.cjs';
import {englishSpeechText} from '../src/modules/english/speech-content';
import {eveningSchedule,tickEvening,snoozeEvening,type EveningSchedule} from '../src/core/evening';
import EnglishInstaller from '../integration/install-english.cjs';
import {WarningPanel} from './warning-panel';
import {FocusGuard} from './focus-guard';
import {NodeNight} from './node-night';
import {sharedStatisticsPath,resolveCoursePath,resolveEnglishPath,resolveNodePath,readRecallAiEnv,legacyStatisticsRoots,configureCourseStorage} from './locations';
import {migrateLegacyStatistics} from './migrate';
const demo=process.argv.includes('--demo');
const smoke=process.argv.includes('--smoke');
const projectRoot=path.resolve(__dirname,'..');
if(demo||smoke)app.setPath('userData',path.join(app.getPath('temp'),`sql-recall-browser-${process.pid}`));
protocol.registerSchemesAsPrivileged([{scheme:'recall',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
let store:Store,settings:Settings,moduleState:ModuleState,schedule:ScheduleState,sessions:SessionRecord[]=[];
let window:BrowserWindow|null=null,tray:Tray|null=null,overlays:BrowserWindow[]=[];
let activeSession:SessionRecord|null=null;let locked=false,suspended=false,quitting=false,tearingDown=false;
let returnSignal=true,previousIdle=0,sourceStamp=0,lastSourcePoll=0,lastPersist=0,lastScheduleSnap='',lastEnglishSnap='',tickBusy=false,sessionTick=Date.now();
let focusSurface=false;
let nodeNight:NodeNight;
let englishHost:EnglishHost,englishNative=false,englishSchedule:EveningSchedule;
let englishSpeech:EnglishSpeech;
let languageChecker:any;let englishAI:any;let translator:any;let sqlAI:SQLAI;
let sqlChat:SQLChat;
let warningModule:'postgresql'|'english'='postgresql',englishOptional=false,mediaUntil=0,waitingUntil=0;
const clock=new FocusClock();
const focusGuard=new FocusGuard();
let pendingFocusId:string|null=null,systemEnding=false;
let pendingFocusTimer:ReturnType<typeof setTimeout>|null=null;
function clearPendingFocus(){pendingFocusId=null;if(pendingFocusTimer)clearTimeout(pendingFocusTimer);pendingFocusTimer=null;}
function prepareFocusWindow(id=activeSession?.id){
  if(!id)return;
  clock.reset();clearPendingFocus();pendingFocusId=id;
  const pendingId=pendingFocusId;
  pendingFocusTimer=setTimeout(()=>{if(pendingFocusId===pendingId)failOpen();},35000);
  makeWindow().hide();disarmShortcut();updateTray();
}
function focusTaskActive(){return !!nodeNight?.protected||!!pendingFocusId||focusSurface&&(englishNative&&englishHost?.running()||!!activeSession&&!activeSession.endedAt&&!activeSession.paused);}
function nativeTaskBusy(){return englishNative||!!pendingFocusId||!!activeSession&&!activeSession.endedAt&&!activeSession.paused;}
function taskBusy(){return nativeTaskBusy()||!!nodeNight?.busy;}
function updateTray(){
  if(!tray)return;
  tray.setContextMenu(Menu.buildFromTemplate([{label:focusTaskActive()?'Повернутися до задачі':'Відкрити SQL Recall',click:showDashboard},{label:'Пара / демонстрація — відкласти на 30 хв',enabled:!focusTaskActive(),click:()=>void snoozeDaily()},{label:'Потренуватися зараз',enabled:!taskBusy(),click:()=>void begin('practice')},{label:'English · почати / продовжити',enabled:!taskBusy(),click:()=>void beginEnglish().catch(error=>{store.messages.push(String(error));showDashboard();})},{label:'Node.js · повернутися до уроку',visible:!!nodeNight?.canResume,click:()=>nodeNight.resume()},{label:'Нічний Node.js · налаштування',enabled:!taskBusy(),click:()=>nodeNight.openSettings()},{label:'Завершити програму',enabled:!focusTaskActive(),click:()=>app.quit()}]));
}
let warningPanel:WarningPanel,shortcutAvailable=false,warningPreview=false,previewUntil=0,snoozing=false;
const SNOOZE_SHORTCUT='Control+Shift+A';
const launchLock=demo||app.requestSingleInstanceLock();
if(!launchLock)app.quit();
app.on('second-instance',()=>showDashboard());
function emit(type:'daily'|'progress'|'practice'|'tick'|'pause'|'schedule'|'english',active?:boolean,clockValue?:{id:string;activeMs:number;taskElapsedMs:number[];breakRemainingMs?:number}){window?.webContents.send('recall:event',{type,active,clock:clockValue});}
function armShortcut(){
  if(globalShortcut.isRegistered(SNOOZE_SHORTCUT)){shortcutAvailable=true;return;}
  shortcutAvailable=globalShortcut.register(SNOOZE_SHORTCUT,()=>{void snoozeDaily().catch(()=>failOpen());});
}
function disarmShortcut(){globalShortcut.unregister(SNOOZE_SHORTCUT);shortcutAvailable=false;}
function warningStatus(){return {remainingSeconds:Math.ceil((warningPreview?Math.max(0,previewUntil-Date.now()):(warningModule==='english'?englishSchedule?.warningRemainingMs:schedule.warningRemainingMs)??WARNING_MS)/1000),shortcutAvailable,pausedSession:!!activeSession?.paused};}
function hideWarning(){warningPanel?.destroy();warningModule='postgresql';}
async function snoozeDaily():Promise<Bootstrap>{
  if(snoozing)return bootstrap();snoozing=true;
  try{
    if(warningPreview){warningPreview=false;hideWarning();disarmShortcut();return bootstrap();}
    if(focusTaskActive())return bootstrap();
    if(warningModule==='english'){englishSchedule=snoozeEvening(englishSchedule);hideWarning();disarmShortcut();await store.write('schedules/english.json',englishSchedule);warningModule='postgresql';emit('schedule');return bootstrap();}
    if(schedule.finished&&!(activeSession&&!activeSession.endedAt))return bootstrap();
    schedule=snoozeSchedule(schedule);
    if(activeSession&&!activeSession.endedAt){
      activeSession.paused=true;await store.saveSession(activeSession);
      window?.hide();tearingDown=true;clearOverlays();tearingDown=false;emit('pause');
    }
    hideWarning();disarmShortcut();await store.write('schedule.json',schedule);emit('schedule');
    if(!demo&&!smoke)new Notification({title:'SQL Recall відкладено',body:'Повернемося через 30 хвилин із новим попередженням. Прогрес збережено.'}).show();
    return bootstrap();
  }finally{snoozing=false;}
}
async function startDailyNow(){
  const target=warningModule;const preview=warningPreview;warningPreview=false;hideWarning();warningModule='postgresql';
  if(target==='english'&&!preview){englishSchedule.offered=false;await store.write('schedules/english.json',englishSchedule);await beginEnglish('daily');return;}
  if(preview){disarmShortcut();await begin(demo?'demo':'practice');return;}
  schedule={...schedule,snoozedUntil:undefined,warned:true,warningRemainingMs:0,triggered:true};
  await store.write('schedule.json',schedule);await begin('daily');emit('schedule');
}
function clearOverlays(){focusSurface=false;clearPendingFocus();focusGuard.leave(window);for(const overlay of overlays){if(!overlay.isDestroyed())overlay.destroy();}overlays=[];if(window&&!window.isDestroyed()){window.setSize(1280,880);window.center();}updateTray();}
function failOpen(){const wasEnglish=englishNative;hideWarning();disarmShortcut();clearOverlays();if(wasEnglish){try{if(englishHost.controller.snapshot()?.payload.extraPractice)englishHost.pause();else englishHost.finish('technical');}catch{}englishNative=false;if(englishSchedule){englishSchedule.finished=true;void store.write('schedules/english.json',englishSchedule).catch(()=>{});}emit('english');}else if(activeSession&&!activeSession.endedAt&&!activeSession.paused){activeSession.outcome='technical';activeSession.endedAt=new Date().toISOString();void finish(activeSession).catch(()=>{});} }
function configureWindow(win:BrowserWindow){
  win.setMenu(null);
  win.on('close',event=>{if(!quitting&&!systemEnding&&focusTaskActive()){event.preventDefault();if(focusGuard.active&&window)showDashboard();}});
  win.webContents.on('before-input-event',(event,input)=>{focusGuard.preventExitKey(event,input,systemEnding);});
  const restoreTask=()=>{if(focusGuard.active&&!locked&&!suspended&&!systemEnding&&!quitting&&window&&!window.isDestroyed()){if(window.isMinimized())window.restore();window.show();window.focus();}};
  win.on('minimize',()=>{if(focusGuard.active)setTimeout(restoreTask,0);});
  win.on('hide',()=>{if(focusGuard.active)setTimeout(restoreTask,0);});
  win.on('leave-full-screen',()=>{if(focusGuard.active&&!systemEnding&&!quitting)win.setFullScreen(true);});
  const allowSystemEnd=()=>{systemEnding=true;if(englishNative){try{englishHost.pause();}catch(error){store.messages.push(String(error));}finally{englishNative=false;}}if(activeSession&&!activeSession.endedAt){activeSession.paused=true;void store.saveSession(activeSession).catch(()=>{});}tearingDown=true;clearOverlays();tearingDown=false;emit('pause');};
  win.on('query-session-end',allowSystemEnd);win.on('session-end',allowSystemEnd);
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('recall://app/')&&!url.startsWith('http://127.0.0.1:5173/'))event.preventDefault();});
  win.webContents.on('render-process-gone',()=>failOpen());win.on('unresponsive',()=>{failOpen();win.destroy();});
}
function makeWindow(){
  if(window&&!window.isDestroyed())return window;
  window=new BrowserWindow({width:1280,height:880,minWidth:940,minHeight:680,show:false,backgroundColor:'#f5f4ee',autoHideMenuBar:true,title:'SQL Recall',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  configureWindow(window);
  const url=process.env.RECALL_DEV_URL||'recall://app/index.html';void window.loadURL(url);
  window.on('closed',()=>{window=null;if(englishNative&&!quitting&&!systemEnding){failOpen();}if(!quitting&&!systemEnding&&(focusSurface||activeSession&&!activeSession.endedAt&&!activeSession.paused)){clearOverlays();if(activeSession){activeSession.outcome='interrupted';activeSession.endedAt=new Date().toISOString();void finish(activeSession).catch(()=>{});}}if(demo&&!quitting)app.quit();});
  window.once('ready-to-show',()=>{if(!pendingFocusId&&(!process.argv.includes('--background')||demo))window?.show();});
  return window;
}
function showDashboard(){if(nodeNight?.protected){nodeNight.resume();return;}const win=makeWindow();if(win.isMinimized())win.restore();win.show();win.focus();}
function applyOverlays(){
  if(!window||!focusSurface)return;
  for(const overlay of overlays)if(!overlay.isDestroyed())overlay.destroy();overlays=[];
  const primary=screen.getPrimaryDisplay();window.setBounds(primary.bounds);focusGuard.enter(window);
  for(const display of screen.getAllDisplays().filter(d=>d.id!==primary.id)){
    const overlay=new BrowserWindow({...display.bounds,title:'SQL Recall · monitor',frame:false,show:false,resizable:false,maximizable:false,closable:false,minimizable:false,focusable:false,alwaysOnTop:true,skipTaskbar:true,backgroundColor:'#102d29',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
    overlay.on('close',event=>{focusGuard.preventClose(event,systemEnding||tearingDown||quitting);});
    overlay.setAlwaysOnTop(true,'screen-saver');overlay.once('ready-to-show',()=>{if(!overlay.isDestroyed())overlay.showInactive();});
    void overlay.loadURL('recall://app/cover.html');overlay.on('closed',()=>{if(focusSurface&&!tearingDown&&!quitting&&!systemEnding)failOpen();});overlays.push(overlay);
  }
  window.show();window.focus();updateTray();
}
async function begin(mode:SessionRecord['mode'],notify=true){
  if(nodeNight?.busy){nodeNight.resume();return;}
  if(englishNative){showDashboard();return;}
  if(activeSession&&!activeSession.endedAt){
    if(activeSession.paused){
      activeSession.paused=false;await store.saveSession(activeSession);
      if(activeSession.paused)return;
      prepareFocusWindow();emit('daily');
    }else showDashboard();return;
  }
  const module=getModule(settings.activeModuleId);
  if(!availableTopicIds(moduleState).length){showDashboard();return;}
  activeSession=createSession(module,moduleState,sessions,dayKey(new Date()),mode);
  const tasks=activeSession.tasks;
  tasks.forEach((task,index)=>{tasks[index]=sqlAI.take(task,availableTopicIds(moduleState),sessions,tasks.filter((_,other)=>other!==index));});
  activeSession.answers=tasks.map(t=>t.starter);
  await store.saveSession(activeSession);sessions.push(activeSession);sessionTick=Date.now();
  if(activeSession.paused)return;
  prepareFocusWindow();
  if(notify)emit(mode==='daily'?'daily':'practice');
}
async function finish(session:SessionRecord){
  if(!validSession(session))throw new Error('Некоректна сесія.');
  if(!activeSession||activeSession.id!==session.id)return;
  if(activeSession.endedAt&&sessions.some(s=>s.id===session.id&&s.endedAt)&&activeSession!==session)return;
  activeSession=session;await store.saveSession(session);
  moduleState=updateHistory(moduleState,session);await store.write(`modules/${session.moduleId}/state.json`,moduleState);
  sessions=sessions.filter(s=>s.id!==session.id);sessions.push(session);
  if(session.mode==='daily'||session.mode!=='demo'&&(focusSurface||['completed','surrendered'].includes(session.outcome||''))){schedule=completeScheduleForDay(schedule);hideWarning();disarmShortcut();await store.write('schedule.json',schedule);}
  tearingDown=true;clearOverlays();tearingDown=false;
}
async function pollProgress(){
  if(demo)return;const file=path.join(store.root,`modules/${settings.activeModuleId}/progress-source.json`);
  let stamp:number;try{stamp=(await stat(file)).mtimeMs;}catch{return;}if(stamp===sourceStamp)return;
  const source=await store.source(settings.activeModuleId);if(!source)return;
  try{const progress=getModule(settings.activeModuleId).progressAdapter.parse(source);moduleState={...moduleState,progress};await store.write(`modules/${settings.activeModuleId}/state.json`,moduleState);sourceStamp=stamp;emit('progress');}
  catch(error){const message=String(error);if(!store.messages.includes(message))store.messages.push(message);sourceStamp=stamp;emit('progress');}
}
async function bootstrap():Promise<Bootstrap>{await pollProgress();return {settings,module:moduleState,schedule,sessions,demo,sqlAI:sqlAI?.status(),recoveryMessages:store.messages,activeSession:activeSession&&!activeSession.endedAt?activeSession:null,shortcutAvailable,english:englishHost?{...englishHost.view(),aiSettings:englishAI?.settings()}:undefined,activeLearningSession:englishNative?englishHost.controller.snapshot():activeSession&&!activeSession.endedAt?getModule(activeSession.moduleId).controller?.restore(activeSession).snapshot():null};}
async function beginEnglish(mode:'daily'|'practice'|'demo'='practice',notify=true,extend=false){
  if(nodeNight?.busy)throw Error('Нічний Node.js уже відкрито.');
  if(activeSession&&!activeSession.endedAt&&!activeSession.paused){showDashboard();throw new Error('Спочатку заверши або збережи SQL-сесію.');}
  if(englishHost.readonly()){showDashboard();throw new Error('English зараз відкрито в браузері. Постав його там на паузу.');}
  if(englishNative&&englishHost.running()){showDashboard();return;}
  hideWarning();disarmShortcut();englishHost.start(demo?'demo':mode,extend);
  const run=englishHost.controller.snapshot();if(!run||run.endedAt||!englishHost.running()){englishHost.release();showDashboard();if(notify)emit('english');return;}
  englishNative=true;prepareFocusWindow(run.id);void languageChecker.check('This is a short English warm-up.').catch(()=>{});if(notify)emit('english');
}
function installEnglish(){if(!demo&&!smoke)try{EnglishInstaller.installEnglish(settings.englishCoursePath!,store.root,path.join(projectRoot,'integration'),path.join(app.isPackaged?process.resourcesPath:path.join(projectRoot,'resources'),'english-checker'));}catch(error){const message='English: '+String(error);if(!store.messages.includes(message))store.messages.push(message);}}
async function openEnglish(){
  installEnglish();try{let running=false;try{const result=await fetch('http://localhost:5500/api/recall/status',{signal:AbortSignal.timeout(1200)}).then(r=>r.json()) as any;running=result.moduleId==='english';}catch{}
    if(!running){const child=spawn(process.execPath,[path.join(settings.englishCoursePath!,'server.js')],{cwd:settings.englishCoursePath,detached:true,windowsHide:true,stdio:'ignore',env:{...process.env,ELECTRON_RUN_AS_NODE:'1'}});child.on('error',()=>{});child.unref();}
    await shell.openExternal('http://localhost:5500');return {ok:true,message:'English відкрито. Прогрес і записи синхронізуються з постійною папкою Recall. Якщо сервер щойно запускається, онови сторінку.'};
  }catch(error){return {ok:false,message:String(error)};}
}
async function openCourse(){
  const source=getModule(settings.activeModuleId).progressAdapter.source;
  if(!source)return {ok:false,message:'Для цього модуля доступний імпорт прогресу з JSON.'};
  if(!demo&&!smoke)try{await configureCourseStorage(getModule(settings.activeModuleId),settings.coursePath,store.root,path.join(projectRoot,'integration'));}catch{}
  const url=source.url;
  try{
    let running=false;try{const response=await fetch(url+'/api/recall/status',{signal:AbortSignal.timeout(1200)});const result=await response.json() as {recall?:boolean};running=result.recall===true;}catch{}
    if(!running){const child=spawn(process.execPath,[path.join(settings.coursePath,source.serverEntry)],{cwd:settings.coursePath,detached:true,windowsHide:true,stdio:'ignore',env:{...process.env,ELECTRON_RUN_AS_NODE:'1'}});child.on('error',()=>{});child.unref();}
    await shell.openExternal(url);return {ok:true,message:'Відкрито тренажер. Прогрес із цього браузера синхронізується автоматично. Якщо сервер щойно запустився, онови сторінку.'};
  }catch(error){return {ok:false,message:`Не вдалося відкрити тренажер: ${String(error)}`};}
}
async function installHandlers(){
  const handle=(name:string,handler:(...args:any[])=>unknown)=>ipcMain.handle(name,(event,...args)=>{const allowedWarning=['recall:warning-status','recall:snooze','recall:start-now'].includes(name)&&event.sender===warningPanel?.window?.webContents;if(event.sender!==window?.webContents&&!allowedWarning)throw new Error('Невідоме вікно.');return handler(...args);});
  handle('recall:bootstrap',bootstrap);
  handle('recall:sql-ai',async(request:any)=>{if(!request||!['settings','prepare','test'].includes(request.action))throw Error('Невідома SQL AI-дія.');if(request.action==='settings')return request.options?sqlAI.save(request.options):sqlAI.status();if(request.action==='test')return sqlAI.test();await sqlAI.prepare(moduleState,sessions,true);return sqlAI.status();});
  handle('recall:sql-chat',(request:unknown)=>sqlChat.ask(activeSession,request));
  handle('recall:configure',async(value:{autoStart:boolean;minPracticeMinutes?:number})=>{if(!value||typeof value.autoStart!=='boolean'||value.minPracticeMinutes!==undefined&&![5,7,10,15].includes(value.minPracticeMinutes))throw new Error('Некоректні налаштування.');if(!settings.setupComplete){returnSignal=true;settings.dailyEnabledAfterDay=dayKey(new Date());}settings={...settings,setupComplete:true,autoStart:demo||smoke?false:value.autoStart,minPracticeMinutes:value.minPracticeMinutes??settings.minPracticeMinutes};if(!demo&&!smoke)app.setLoginItemSettings({openAtLogin:settings.autoStart,path:process.execPath,args:['--background'],name:'SQL Recall'});await store.write('settings.json',settings);});
  handle('recall:session-ready',async(sessionId:unknown)=>{const sql=activeSession&&sessionId===activeSession.id&&!activeSession.paused&&!activeSession.endedAt,en=englishNative&&sessionId===englishHost.controller.snapshot()?.id&&englishHost.running();if(typeof sessionId!=='string'||sessionId!==pendingFocusId||!sql&&!en)return;clearPendingFocus();systemEnding=false;focusSurface=true;clock.reset();applyOverlays();});
  handle('recall:english-start',async(extend:unknown)=>{if(extend!==undefined&&typeof extend!=='boolean')throw Error('Некоректний режим English.');await beginEnglish('practice',false,extend===true);return englishHost.view();});
  handle('recall:english-pause-extension',()=>{
    if(!englishNative||!englishHost.running()||!englishHost.controller.snapshot()?.payload.extraPractice)throw Error('Допрацювання English не активне.');
    englishHost.pause();englishNative=false;tearingDown=true;clearOverlays();tearingDown=false;return englishHost.view();
  });
  handle('recall:english-action',async(action:any)=>{if(!action||typeof action.type!=='string'||action.type.length>60||action.key!==undefined&&typeof action.key!=='string'||action.value!==undefined&&typeof action.value!=='string'||action.flag!==undefined&&typeof action.flag!=='boolean'||action.area!==undefined&&typeof action.area!=='string')throw new Error('Некоректна дія English.');if(action.type==='snooze'){if(!focusTaskActive()){warningModule='english';await snoozeDaily();}return englishHost.view();}return englishHost.action(action);});
  handle('recall:english-finish',async(reason:unknown)=>{if(reason!=='surrendered'&&reason!=='completed')throw new Error('Некоректне завершення.');englishHost.finish(reason);englishNative=false;tearingDown=true;clearOverlays();tearingDown=false;englishSchedule.finished=true;await store.write('schedules/english.json',englishSchedule);emit('english');return englishHost.view();});
  handle('recall:english-configure',async(value:any)=>{if(!value||typeof value.enabled!=='boolean'||!Number.isInteger(value.startHour)||value.startHour<17||value.startHour>22)throw new Error('Некоректний розклад English.');if(value.enabled){const today=kyivDayKey(new Date());if(!settings.englishEnabledAfterDay||settings.englishEnabledAfterDay>=today){const previous=new Date(today+'T12:00:00Z');previous.setUTCDate(previous.getUTCDate()-1);settings.englishEnabledAfterDay=previous.toISOString().slice(0,10);}}const hour=kyivParts(new Date()).hour;if(warningModule==='english'&&(!value.enabled||hour>=5&&hour<value.startHour)){hideWarning();disarmShortcut();englishSchedule.offered=false;}settings.englishEnabled=value.enabled;settings.englishStartHour=value.startHour;await store.write('settings.json',settings);});
  handle('recall:english-open',openEnglish);
  handle('recall:english-import',async()=>{const result=await dialog.showOpenDialog(window!,{title:'Імпортувати English Daily',filters:[{name:'JSON',extensions:['json']}],properties:['openFile']});if(result.canceled)return {ok:false,message:'Імпорт скасовано.'};try{if((await stat(result.filePaths[0])).size>20000000)throw new Error('Файл перевищує 20 МБ.');englishHost.import(JSON.parse(await readFile(result.filePaths[0],'utf8')));emit('english');return {ok:true,message:'Прогрес English імпортовано. Резервну копію збережено.'};}catch(error){return {ok:false,message:String(error)};}});
  handle('recall:english-audio-save',(key:string,bytes:number[],mime:string)=>englishHost.saveAudio(key,bytes,mime));
  handle('recall:english-audio-load',(key:string)=>englishHost.loadAudio(key));
  handle('recall:english-translate',async(request:any)=>translator.handle(request));
  handle('recall:english-speech',async request=>{const l=englishHost.view().lesson,text=englishSpeechText(l,request);try{return await englishAI.voice(request.kind==='dialogue'?l.listening.dialogue:[{speaker:'Narrator',text}]);}catch{return {...await englishSpeech.synthesize(text),provider:'local',fallbackReason:'Cloud voice unavailable; local Windows voice.'};}});

  handle('recall:english-ai',async(request:any)=>{
    if(!request||typeof request.action!=='string')throw Error('Invalid AI request.');
    if(request.action==='settings')return {settings:request.options?englishAI.save(request.options):englishAI.settings()};
    if(request.action==='test')return englishAI.testConnection(request.provider);
    if(request.action==='models')return {models:await englishAI.models(request.provider)};
    const s=englishHost.controller.document.course.activeSession,practice=englishHost.controller.snapshot()?.payload.phase==='reinforcement';if(!s&&!practice)throw Error('Start or resume an English lesson first.');const area=request.area||(practice?'practice':s!.lesson.blocks[s!.blockIndex].id),lesson=s?.lesson||englishHost.view().lesson;
    if(request.action==='transcribe'){if(!s)throw Error('Record a lesson first.');const transcripts:any={};for(const key of ['monologue','turn-0','turn-1','turn-2','retry']){const audio=englishHost.loadAudio(s.id+':'+key);if(audio){try{const r=await englishAI.transcribe({audio:Buffer.from(audio.bytes).toString('base64'),mimeType:audio.mime});transcripts[key]=r.transcript;}catch(e){transcripts[key]={text:'',error:String(e),provider:'none',confirmed:false};}}}if(!Object.keys(transcripts).length)throw Error('Record your replies first.');return {view:englishHost.aiChange(c=>{(c.document.course.activeSession as any).proposedTranscripts=transcripts;})};}
    const items=area==='practice'?englishHost.controller.assessmentBundle('practice').answers:(EnglishLearning as any).areaItems(s,area).map((a:any)=>({...a,text:s!.answers[a.key]||''})),answers=items,bundle=AIPrompts.context(lesson,area,answers);
    if(request.action==='hint'){const result=await englishAI.hint(Coaching.tutorContext(bundle,s||{lastAnswerKey:'practice',aiAssessments:{practice:englishHost.controller.snapshot()?.payload.practice?.aiAssessment}},request.targetKey),request.question);return {...result,view:englishHost.aiChange(c=>{const a=(c.document.course.activeSession||c.snapshot()?.payload.practice) as any;a.aiHints=[...(a.aiHints||[]),{area,...result.hint,at:new Date().toISOString()}].slice(-50);})};}
    if(request.action==='conclusion'){if(!s)throw Error('Resume your lesson first.');bundle.evidenceMode=['grammar','listening'].includes(area)&&!(s.aiAssessments as any)?.[area]?'closed-choice':'original-responses';bundle.listeningUnavailable=!!s.listeningUnavailable;const result=await englishAI.conclude(bundle,Coaching.summaryRows(bundle,s));return {...result,view:englishHost.aiChange(c=>{const current=c.document.course.activeSession;if(!current||current.id!==s.id)throw Error('The active lesson changed.');const latest=(EnglishLearning as any).areaItems(current,area).map((a:any)=>({...a,text:current.answers[a.key]||''}));Coaching.attachSummary(current,area,result.blockSummary,latest);},true)};}
    if(request.action==='grade'){
englishHost.controller.assessmentBundle(area);const result=await englishAI.grade(bundle);await store.write('modules/english/ai-reports/'+Date.now()+'-'+area+'.json',result.assessment);return {...result,view:englishHost.aiChange(c=>c.acceptAI(result.assessment),true)};}throw Error('Unknown AI action.');
  });

  handle('recall:english-language-check',async(request:any)=>{if(!request||typeof request.key!=='string'||request.attemptId!==undefined&&(typeof request.attemptId!=='string'||! /^[\w-]{1,150}$/.test(request.attemptId)))throw new Error('Invalid language-check request.');const target=englishHost.controller.languageTarget(request.key,request.attemptId);const report=await languageChecker.check(target.text);await store.write(`modules/english/language-checks/${Date.now()}-${Math.random().toString(36).slice(2,9)}.json`,{version:1,moduleId:'english',...target,report});if(englishHost.running()&&englishHost.controller.document.course.activeSession?.id===target.attemptId)englishHost.acceptLanguageCheck(target.key,report);return {view:englishHost.view(),report};});
  handle('recall:activity',(kind:unknown)=>{if(kind==='playback'||kind==='recording')mediaUntil=Date.now()+10000;else if(kind==='waiting')waitingUntil=Date.now()+10000;else if(kind==='idle'){mediaUntil=0;waitingUntil=0;}else if(kind==='interaction')waitingUntil=0;});
  handle('recall:warning-status',warningStatus);
  handle('recall:snooze',snoozeDaily);
  handle('recall:start-now',startDailyNow);
  handle('recall:resume-daily',async()=>{warningModule='postgresql';await startDailyNow();return bootstrap();});
  handle('recall:preview-warning',()=>{if(focusTaskActive())return;warningModule='postgresql';warningPreview=true;previewUntil=Date.now()+WARNING_MS;armShortcut();warningPanel.show(warningStatus());});
  handle('recall:course',openCourse);
  handle('recall:statistics',async()=>{await shell.openPath(store.root);});
  handle('recall:import',async()=>{
    const result=await dialog.showOpenDialog(window!,{title:'Імпортувати прогрес Postgres Path',filters:[{name:'JSON',extensions:['json']}],properties:['openFile']});if(result.canceled)return {ok:false,message:'Імпорт скасовано.'};
    try{const file=result.filePaths[0];if((await stat(file)).size>2000000)throw new Error('Файл завеликий.');const source=JSON.parse(await readFile(file,'utf8'));const progress=getModule(settings.activeModuleId).progressAdapter.parse(source);moduleState={...moduleState,progress};await store.write(`modules/${settings.activeModuleId}/state.json`,moduleState);emit('progress');return {ok:true,message:'Прогрес імпортовано.'};}catch(error){return {ok:false,message:String(error)};}
  });
  handle('recall:start',async(mode:unknown)=>{if(mode!=='practice'&&mode!=='demo')throw new Error('Некоректний режим.');await begin(demo?'demo':'practice',false);return bootstrap();});
  handle('recall:sql-draft',(id:unknown,index:unknown,answer:unknown)=>{if(typeof id!=='string'||id!==activeSession?.id||activeSession.endedAt||!Number.isInteger(index)||typeof index!=='number'||index<0||index>=activeSession.tasks.length||typeof answer!=='string'||answer.length>100000)throw new Error('Некоректна SQL-чернетка.');activeSession.answers[index]=answer;});
  handle('recall:save-session',async(session:SessionRecord)=>{if(!validSession(session)||session.id!==activeSession?.id||session.moduleId!==activeSession.moduleId||activeSession.endedAt)throw new Error('Сесія недоступна.');if(isStaleSessionUpdate(activeSession,session))return;session.activeMs=activeSession.activeMs;session.taskElapsedMs=[...activeSession.taskElapsedMs];session.paused=activeSession.paused;activeSession=session;await store.saveSession(session);});
  handle('recall:extend-session',async(session:SessionRecord)=>{
    if(!validSession(session)||session.id!==activeSession?.id||session.moduleId!==activeSession.moduleId||activeSession.endedAt)throw new Error('Сесія недоступна.');
    if(isStaleSessionUpdate(activeSession,session))return activeSession;
    session.activeMs=activeSession.activeMs;session.taskElapsedMs=[...activeSession.taskElapsedMs];session.paused=activeSession.paused;
    addSpeedBonus(getModule(session.moduleId),moduleState,sessions,session,settings.minPracticeMinutes,new Date(),Math.floor(Math.random()*0xffffffff),settings.sqlLearningBonus!==false);
    if(session.tasks.length>activeSession.tasks.length){const i=session.tasks.length-1;session.tasks[i]=sqlAI.take(session.tasks[i],availableTopicIds(moduleState),sessions,session.tasks.slice(0,i));session.answers[i]=session.tasks[i].starter;}
    activeSession=session;await store.saveSession(session);return session;
  });
  handle('recall:finish-session',async(session:SessionRecord)=>{
    if(!validSession(session)||session.id!==activeSession?.id||session.moduleId!==activeSession.moduleId||!['completed','surrendered','technical'].includes(session.outcome||''))throw new Error('Некоректне завершення.');
    session.activeMs=activeSession.activeMs;session.taskElapsedMs=[...activeSession.taskElapsedMs];
    if(session.outcome==='completed'&&!session.solved.every(Boolean))throw new Error('Ще не всі вправи завершені.');
    if(session.outcome==='completed'&&session.tasks.length!==activeSession.tasks.length)throw new Error('Онови поточну вправу перед завершенням.');
    if(session.outcome==='surrendered'&&!canSurrender(session))throw new Error('Завершення без виконання стане доступним через 15 хвилин.');
    if(!session.endedAt)session.endedAt=new Date().toISOString();await finish(session);
  });
}
async function tick(){
  if(tickBusy||quitting)return;tickBusy=true;
  try{
    const now=new Date();const idle=powerMonitor.getSystemIdleTime();const active=!locked&&!suspended&&(idle<300||mediaUntil>Date.now());
    void nodeNight?.tick(now,!locked&&!suspended&&idle<300);
    const elapsed=clock.sample(performance.now(),active&&!pendingFocusId&&!!window?.isFocused()&&waitingUntil<Date.now());
    if(englishNative){const before=englishHost.controller.snapshot();const oldPhase=before?.payload.phase;englishHost.tick(elapsed,active);const run=englishHost.controller.snapshot();if(run?.endedAt){englishHost.release();englishNative=false;tearingDown=true;clearOverlays();tearingDown=false;englishSchedule.finished=true;await store.write('schedules/english.json',englishSchedule);emit('english');}else if(oldPhase!==run?.payload.phase)emit('english');}
    else if(activeSession&&!activeSession.endedAt&&!activeSession.paused)getModule(activeSession.moduleId).controller?.restore(activeSession).tick(elapsed,{active});
    const returned=returnSignal||previousIdle>=1800&&idle<5;returnSignal=false;previousIdle=idle;
    if(warningPreview){
      if(Date.now()>=previewUntil){warningPreview=false;hideWarning();disarmShortcut();}
      else warningPanel.update(warningStatus());
    }else if(!demo&&settings.setupComplete){
      if(hasFinishedToday(sessions,now)&&!focusTaskActive())schedule=completeScheduleForDay(schedule,now);
      if(!taskBusy()&&!locked&&!suspended)void sqlAI.prepare(moduleState,sessions);
      const canSchedule=!nodeNight?.busy&&!englishNative&&automaticDayAllowed(now,settings.dailyEnabledAfterDay)&&!!availableTopicIds(moduleState).length&&(!activeSession||!!activeSession.endedAt||!!activeSession.paused);
      const result=tickSchedule(schedule,{now,active,returned,hasProgress:canSchedule,warningVisible:warningPanel.visible&&warningModule==='postgresql'});schedule=result.state;
      if(!englishNative&&active&&canSchedule&&warningModule!=='english'&&needsWarning(now)&&schedule.warned&&!schedule.triggered&&!schedule.finished&&!schedule.snoozedUntil){armShortcut();warningPanel.show(warningStatus());warningPanel.update(warningStatus());}
      else if(!focusSurface&&warningModule!=='english'){hideWarning();disarmShortcut();}
      if(result.action==='start'){hideWarning();await store.write('schedule.json',schedule);if(schedule.triggered&&!schedule.snoozedUntil&&!locked&&!suspended&&!englishNative)await begin('daily');}
    }
    if(!nodeNight?.busy&&!demo&&settings.setupComplete&&settings.englishEnabled&&englishAI.settings().configured){
      const result=tickEvening(englishSchedule,{now,active,busy:taskBusy()||englishHost.readonly()||warningPanel.visible&&warningModule==='postgresql',enabledAfterDay:settings.englishEnabledAfterDay!,done:englishHost.done(),warningVisible:warningPanel.visible&&warningModule==='english',returned,startHour:settings.englishStartHour});englishSchedule=result.state;englishOptional=result.optional;
      if(result.action==='warn'){warningModule='english';armShortcut();warningPanel.show(warningStatus());warningPanel.update(warningStatus());}
      if(result.action==='start'){hideWarning();disarmShortcut();await beginEnglish('daily');}
      if(warningModule==='english'&&(!active||taskBusy()||englishHost.readonly()||englishSchedule.finished||!englishSchedule.offered||englishSchedule.snoozedUntil)){hideWarning();disarmShortcut();}
    }else if(warningModule==='english'){hideWarning();disarmShortcut();}
    if(englishNative){const run=englishHost.controller.snapshot()!;emit('tick',active,{id:run.id,activeMs:run.payload.extraPractice?run.activeMs:englishHost.controller.day().activeMs,taskElapsedMs:[],breakRemainingMs:run.payload.breakRemainingMs});}
    else if(activeSession&&!activeSession.endedAt){emit('tick',!locked&&!suspended&&!activeSession.paused,{id:activeSession.id,activeMs:activeSession.activeMs,taskElapsedMs:[...activeSession.taskElapsedMs]});sessionTick=now.getTime();}
    if(now.getTime()-lastPersist>15000){
      lastPersist=now.getTime();
      const nextScheduleSnap=JSON.stringify({...schedule,lastTick:0});if(nextScheduleSnap!==lastScheduleSnap){await store.write('schedule.json',schedule);lastScheduleSnap=nextScheduleSnap;}
      const nextEnglishSnap=JSON.stringify({...englishSchedule,lastTick:0});if(nextEnglishSnap!==lastEnglishSnap){await store.write('schedules/english.json',englishSchedule);lastEnglishSnap=nextEnglishSnap;}
      await store.write('day-plans/'+kyivDayKey(now)+'.json',{version:1,dayKey:kyivDayKey(now),postgresql:{finished:schedule.finished},english:englishHost.controller.day()});
      if(activeSession&&!activeSession.endedAt){await store.saveSession(activeSession);await store.write('modules/postgresql/sessions/'+activeSession.id+'.json',getModule('postgresql').controller!.restore(activeSession).snapshot());}
    }
    if(now.getTime()-lastSourcePoll>3000){lastSourcePoll=now.getTime();await pollProgress();}
  }catch(error){store.messages.push(String(error));failOpen();}finally{tickBusy=false;}
}
app.on('before-quit',event=>{
  if(!quitting&&!systemEnding&&focusTaskActive()){event.preventDefault();if(focusGuard.active)showDashboard();return;}
  if(quitting)return;event.preventDefault();quitting=true;
  hideWarning();disarmShortcut();nodeNight?.stop();
  void (async()=>{englishHost?.release();await languageChecker?.stop();if(activeSession&&!activeSession.endedAt){if(activeSession.paused)await store.saveSession(activeSession);else{activeSession.outcome='interrupted';activeSession.endedAt=new Date().toISOString();await finish(activeSession);}}await store.flush();tray?.destroy();app.quit();})().catch(()=>app.exit());
});
app.on('window-all-closed',()=>{if(demo)app.quit();});
if(launchLock)void app.whenReady().then(async()=>{
  protocol.handle('recall',request=>{const url=new URL(request.url);const target=path.resolve(projectRoot,'dist','.'+decodeURIComponent(url.pathname));const root=path.join(projectRoot,'dist')+path.sep;if(url.hostname!=='app'||!target.startsWith(root))return new Response('Forbidden',{status:403});return net.fetch(pathToFileURL(target).toString());});
  let runtime:{statisticsPath?:string;coursePath?:string}={};try{runtime=JSON.parse(await readFile(app.isPackaged?path.join(process.resourcesPath,'runtime.json'):path.join(projectRoot,'resources/runtime.json'),'utf8'));}catch{}
  const demoData=demo&&process.env.RECALL_DEMO_DATA_DIR?path.resolve(process.env.RECALL_DEMO_DATA_DIR):undefined;
  store=new Store(demoData||(demo||smoke?path.join(app.getPath('temp'),`sql-recall-${demo?'demo':'smoke'}-${process.pid}`):sharedStatisticsPath()));
  if(!demo&&!smoke)await migrateLegacyStatistics(store,legacyStatisticsRoots(projectRoot,app.isPackaged,runtime.statisticsPath));
  const coursePath=await resolveCoursePath(projectRoot,app.isPackaged,runtime.coursePath);
  const aiEnv=demo||smoke?{}:readRecallAiEnv(projectRoot,app.isPackaged);
  sessions=await store.sessions();
  settings=await store.settings(coursePath);settings.statisticsPath=store.root;settings.coursePath=coursePath;settings.englishCoursePath=await resolveEnglishPath(projectRoot,app.isPackaged,settings.englishCoursePath);
  const checkerRoot=path.join(app.isPackaged?process.resourcesPath:path.join(projectRoot,'resources'),'english-checker');englishAI=new AI.EnglishAI({statisticsPath:store.root,legacyConfigPath:demo||smoke?undefined:path.join(settings.englishCoursePath!,'.english-daily-private.json'),env:aiEnv});translator=new Translation.EnglishTranslation({root:store.root,ai:englishAI,glossary:EnglishCourse.lessons.flatMap((l:any)=>l.vocabulary)});languageChecker=new Language.OfflineEnglishChecker({root:checkerRoot,workerFile:app.isPackaged?path.join(checkerRoot,'service-worker.cjs'):path.join(projectRoot,'integration','english-language.cjs'),nodePath:process.execPath});
  englishHost=new EnglishHost(store.root);englishHost.recover();englishSpeech=new EnglishSpeech(path.join(store.root,'modules','english','speech-cache'));englishSchedule=await store.read('schedules/english.json',eveningSchedule(new Date()),(v:any)=>v?.version===1&&/^\d{4}-\d{2}-\d{2}$/.test(v.dayKey)&&typeof v.finished==='boolean'&&typeof v.offered==='boolean'&&Number.isFinite(v.lastTick)&&Number.isFinite(v.warningRemainingMs)&&v.warningRemainingMs>=0&&v.warningRemainingMs<=WARNING_MS&&(v.snoozedUntil===undefined||Number.isFinite(v.snoozedUntil)));installEnglish();
  if(!demo&&!smoke){
    try{await configureCourseStorage(getModule(settings.activeModuleId),coursePath,store.root,path.join(projectRoot,'integration'));}catch(error){store.messages.push('Не вдалося підключити тренажер: '+String(error));}
    if(settings.setupComplete)app.setLoginItemSettings({openAtLogin:settings.autoStart,path:process.execPath,args:['--background'],name:'SQL Recall'});
  }
  await store.write('settings.json',settings);
  moduleState=await store.module(settings.activeModuleId);schedule=await store.schedule();
  const catalogIds=new Set(getModule(settings.activeModuleId).catalog.map(topic=>topic.id));
  const learned=[...new Set([...(moduleState.learnedTopicIds||[]),...sessions.filter(session=>session.moduleId===moduleState.moduleId).flatMap(learnedTopics)])].filter(id=>catalogIds.has(id));
  if(learned.length!==(moduleState.learnedTopicIds||[]).length){moduleState={...moduleState,learnedTopicIds:learned};await store.write(`modules/${moduleState.moduleId}/state.json`,moduleState);}
  sqlAI=new SQLAI(store,englishAI,()=>settings);await sqlAI.load();if(!demo&&!smoke)setTimeout(()=>void sqlAI.prepare(moduleState,sessions),2000);
  const sqlChatClient=new AI.EnglishAI({statisticsPath:store.root,env:{},fetchImpl:(url:string,options:RequestInit)=>fetch(url,{...options,signal:AbortSignal.timeout(12_000)})});
  sqlChat=new SQLChat(sqlChatClient,()=>englishAI.config(),()=>settings.sqlAIFallback!==false,demo||smoke);
  warningPanel=new WarningPanel(__dirname,()=>{void snoozeDaily().catch(()=>failOpen());});
  nodeNight=new NodeNight({
    store, coursePath:await resolveNodePath(projectRoot,app.isPackaged,settings.coursePath), preloadRoot:__dirname, englishAI,
    separateApiKey:aiEnv.NODE_OPENAI_API_KEY,
    isolated:demo||smoke,
    testPort:demo&&process.env.RECALL_TEST_CLOCK==='1'?Number(process.env.RECALL_TEST_NODE_PORT):undefined,
    exerciseGuard:demo&&process.env.RECALL_TEST_NODE_GUARD==='1',
    shutdown:demo&&process.env.RECALL_TEST_CLOCK==='1' ? async()=>{const test=globalThis as any;test.__recallNodeSleepCount=(test.__recallNodeSleepCount||0)+1;} : undefined,
    isAvailable:()=>!locked&&!suspended&&!quitting&&!nativeTaskBusy()&&!warningPreview,
    beforeOffer:()=>{hideWarning();disarmShortcut();warningModule='postgresql';},
    onStatus:updateTray,
    report:message=>{store.messages.push(message);if(!demo&&!smoke)new Notification({title:'Нічний Node.js',body:message}).show();},
  });
  await nodeNight.init();
  if(demo&&process.env.RECALL_TEST_CLOCK==='1')Object.assign(globalThis,{__recallNodeSettings:()=>nodeNight.openSettings(),__recallNodeResume:()=>nodeNight.resume(),__recallNodeTick:(now:number)=>nodeNight.tick(new Date(now),true)});
  // An explicit OS pause may resume; an abrupt crash never re-locks this day.
  for(const stale of sessions.filter(s=>!s.endedAt)){
    if(stale.paused&&!activeSession){activeSession=stale;schedule.triggered=false;schedule.finished=false;schedule.eligible=true;schedule.activeMs=Math.max(schedule.activeMs,schedule.delayMs);continue;}
    stale.outcome='interrupted';stale.endedAt=new Date().toISOString();await store.saveSession(stale);moduleState=updateHistory(moduleState,stale);
    if(stale.mode!=='demo'&&stale.dayKey===dayKey(new Date()))schedule=completeScheduleForDay(schedule);
  }
  await store.write('schedule.json',schedule);
  await store.write('schedules/english.json',englishSchedule);
  await store.write(`modules/${settings.activeModuleId}/state.json`,moduleState);
  if(demo){settings.setupComplete=true;moduleState.progress=getModule('postgresql').progressAdapter.parse({completed:Array.from({length:14},(_,i)=>i),index:14,drafts:{}});}
  powerMonitor.on('lock-screen',()=>{locked=true;clock.reset();});powerMonitor.on('unlock-screen',()=>{locked=false;returnSignal=true;});
  powerMonitor.on('suspend',()=>{suspended=true;clock.reset();});powerMonitor.on('resume',()=>{suspended=false;returnSignal=true;});
  screen.on('display-added',()=>{nodeNight?.displaysChanged();if(focusSurface){tearingDown=true;applyOverlays();tearingDown=false;}});
  screen.on('display-removed',()=>{nodeNight?.displaysChanged();if(focusSurface){tearingDown=true;applyOverlays();tearingDown=false;}});
  await installHandlers();makeWindow();
  window!.webContents.session.setPermissionRequestHandler((contents,permission,callback,details)=>{if(contents!==window?.webContents||permission!=='media'||!contents.getURL().startsWith('recall://app/')){callback(false);return;}const media=(details as any).mediaTypes||[];if(media.includes('video')){callback(false);return;}void dialog.showMessageBox(window!,{type:'question',message:'Дозволити запис голосу для English?',detail:'Запис збережеться локально. Камера не використовується.',buttons:['Дозволити','Ні'],defaultId:1,cancelId:1}).then(result=>callback(result.response===0));});
  if(demo&&process.env.RECALL_TEST_CLOCK==='1')Object.assign(globalThis,{__recallAdvance:(ms:number)=>{for(let left=ms;left>0;left-=5000){const delta=Math.min(left,5000);if(englishNative)englishHost.tick(delta,true);else if(activeSession&&!activeSession.endedAt)getModule('postgresql').controller!.restore(activeSession).tick(delta,{active:true});}if(englishNative){englishHost.save();if(englishHost.controller.snapshot()?.endedAt){englishHost.release();englishNative=false;clearOverlays();emit('english');}}}});
  if(!demo){
    const icon=nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGUlEQVR42mMQ0NX8TwlmGDVg1IBRA0YNAOcGAJqEnwEiEb2gAAAAAElFTkSuQmCC');
    tray=new Tray(icon);tray.setToolTip('SQL Recall · щоденне повторення');updateTray();tray.on('double-click',showDashboard);
  }
  await pollProgress();setInterval(()=>void tick(),1000);if(smoke)setTimeout(()=>app.quit(),12000);
}).catch(error=>{console.error(error);app.exit(1);});
