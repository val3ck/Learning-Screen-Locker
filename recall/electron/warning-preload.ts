import {contextBridge,ipcRenderer} from 'electron';
contextBridge.exposeInMainWorld('recallWarning',{
  status:()=>ipcRenderer.invoke('recall:warning-status'),
  snooze:()=>ipcRenderer.invoke('recall:snooze'),
  start:()=>ipcRenderer.invoke('recall:start-now'),
  onTick:(callback:(status:unknown)=>void)=>{const listener=(_event:unknown,status:unknown)=>callback(status);ipcRenderer.on('recall:warning-tick',listener);return()=>ipcRenderer.removeListener('recall:warning-tick',listener);}
});
