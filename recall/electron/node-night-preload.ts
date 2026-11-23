import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('recallNode', {
  ready: () => ipcRenderer.invoke('recall:node-ready'),
  subscribe(render: (value: unknown) => void) {
    const listener = (_event: unknown, value: unknown) => render(value);
    ipcRenderer.on('recall:node-state', listener);
    return () => ipcRenderer.removeListener('recall:node-state', listener);
  },
  act: (action: string) => ipcRenderer.invoke('recall:node-act', action),
  ask: (request: unknown) => ipcRenderer.invoke('recall:node-ask', request),
  review: (request: unknown) => ipcRenderer.invoke('recall:node-review', request),
});
