const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),

  // API Key management
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  deleteApiKey: () => ipcRenderer.invoke('delete-api-key'),

  // User preferences
  savePreferences: (preferences) => ipcRenderer.invoke('save-preferences', preferences),
  getPreferences: () => ipcRenderer.invoke('get-preferences'),

  // File system operations (to be implemented in Phase 1.2)
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  listDirectory: (path) => ipcRenderer.invoke('list-directory', path),

  // Event listeners
  onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
  onOpenProject: (callback) => ipcRenderer.on('open-project', callback),
});