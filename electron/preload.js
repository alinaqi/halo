const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app-version'),
  onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
  onOpenProject: (callback) => ipcRenderer.on('open-project', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});