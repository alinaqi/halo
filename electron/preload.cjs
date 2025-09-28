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

  // File system operations
  readFile: (path) => ipcRenderer.invoke('fs-read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('fs-write-file', path, content),
  listDirectory: (path) => ipcRenderer.invoke('fs-list-directory', path),
  createDirectory: (path) => ipcRenderer.invoke('fs-create-directory', path),
  deleteItem: (path) => ipcRenderer.invoke('fs-delete-item', path),
  renameItem: (oldPath, newName) => ipcRenderer.invoke('fs-rename-item', oldPath, newName),
  openFilePicker: (options) => ipcRenderer.invoke('fs-open-file-picker', options),
  saveFileDialog: (options) => ipcRenderer.invoke('fs-save-file-dialog', options),
  getFileMetadata: (path) => ipcRenderer.invoke('fs-get-file-metadata', path),
  searchFiles: (searchTerm, searchPath) => ipcRenderer.invoke('fs-search-files', searchTerm, searchPath),
  getWorkspaceInfo: () => ipcRenderer.invoke('fs-get-workspace-info'),

  // Event listeners
  onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
  onOpenProject: (callback) => ipcRenderer.on('open-project', callback),
});