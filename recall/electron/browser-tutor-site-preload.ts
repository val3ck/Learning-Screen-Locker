import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('recallTutorChat', {
  ask: (input: unknown) => ipcRenderer.invoke('recall:tutor-chat', input),
  preferences: (input?: unknown) => ipcRenderer.invoke('recall:tutor-chat-preferences', input),
});
