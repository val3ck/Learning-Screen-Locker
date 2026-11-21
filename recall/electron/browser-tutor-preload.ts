import {contextBridge,ipcRenderer} from 'electron';
contextBridge.exposeInMainWorld('recallTutor',{
  state:()=>ipcRenderer.invoke('recall:tutor-state'),
  action:(value:'start'|'snooze'|'finish')=>ipcRenderer.invoke('recall:tutor-action',value),
});
