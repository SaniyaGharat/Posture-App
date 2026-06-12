const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendNotification: (title, body) => ipcRenderer.send('notify', { title, body }),
    onAITick: (callback) => ipcRenderer.on('do-ai-tick', (event) => callback())
});
