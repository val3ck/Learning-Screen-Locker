import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nightControls', {
  state: () => ipcRenderer.invoke('recall:node-control-state'),
  choose: (choice: string) => ipcRenderer.invoke('recall:node-choice', choice),
  save: (value: unknown) => ipcRenderer.invoke('recall:node-config', value),
  preview: () => ipcRenderer.invoke('recall:node-preview'),
  openCourse: () => ipcRenderer.invoke('recall:node-open-course'),
});
