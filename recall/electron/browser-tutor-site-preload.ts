import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('recallTutorChat', {
  ask: (input: unknown) => ipcRenderer.invoke('recall:tutor-chat', input),
  preferences: (input?: unknown) => ipcRenderer.invoke('recall:tutor-chat-preferences', input),
});

contextBridge.exposeInMainWorld('recallVimSession', {
  state: () => ipcRenderer.invoke('recall:vim-session','state'),
  finish: () => ipcRenderer.invoke('recall:vim-session','finish'),
});
