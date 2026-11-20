import {contextBridge,ipcRenderer} from 'electron';
import type {DesktopAPI} from '../src/core/contracts';
const api:DesktopAPI={
  bootstrap:()=>ipcRenderer.invoke('recall:bootstrap'),configure:settings=>ipcRenderer.invoke('recall:configure',settings),
  openCourse:()=>ipcRenderer.invoke('recall:course'),importProgress:()=>ipcRenderer.invoke('recall:import'),
  openStatistics:()=>ipcRenderer.invoke('recall:statistics'),start:mode=>ipcRenderer.invoke('recall:start',mode),
  saveSession:session=>ipcRenderer.invoke('recall:save-session',session),finishSession:session=>ipcRenderer.invoke('recall:finish-session',session),
  sqlDraft:(id,index,answer)=>ipcRenderer.invoke('recall:sql-draft',id,index,answer),
  extendSession:session=>ipcRenderer.invoke('recall:extend-session',session),snooze:()=>ipcRenderer.invoke('recall:snooze'),previewWarning:()=>ipcRenderer.invoke('recall:preview-warning'),resumeDaily:()=>ipcRenderer.invoke('recall:resume-daily'),
  sessionReady:sessionId=>ipcRenderer.invoke('recall:session-ready',sessionId),
  englishStart:extend=>ipcRenderer.invoke('recall:english-start',extend),englishAction:action=>ipcRenderer.invoke('recall:english-action',action),englishFinish:reason=>ipcRenderer.invoke('recall:english-finish',reason),
  englishPauseExtension:()=>ipcRenderer.invoke('recall:english-pause-extension'),
  englishConfigure:value=>ipcRenderer.invoke('recall:english-configure',value),englishOpen:()=>ipcRenderer.invoke('recall:english-open'),englishImport:()=>ipcRenderer.invoke('recall:english-import'),
  englishSaveAudio:(key,bytes,mime)=>ipcRenderer.invoke('recall:english-audio-save',key,bytes,mime),englishLoadAudio:key=>ipcRenderer.invoke('recall:english-audio-load',key),activity:kind=>ipcRenderer.invoke('recall:activity',kind),
  englishSpeech:request=>ipcRenderer.invoke('recall:english-speech',request),
  englishTranslate:request=>ipcRenderer.invoke('recall:english-translate',request),
  englishAI:request=>ipcRenderer.invoke('recall:english-ai',request),
  sqlAI:request=>ipcRenderer.invoke('recall:sql-ai',request),
  sqlChat:request=>ipcRenderer.invoke('recall:sql-chat',request),
  englishCheckLanguage:request=>ipcRenderer.invoke('recall:english-language-check',request),
  onEvent:callback=>{const listener=(_event:unknown,data:Parameters<typeof callback>[0])=>callback(data);ipcRenderer.on('recall:event',listener);return()=>ipcRenderer.removeListener('recall:event',listener);}
};
contextBridge.exposeInMainWorld('recall',api);
