const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const SecureStorage = require('./services/storage.cjs');
const FileSystemService = require('./services/fileSystem.cjs');
const claudeSDKService = require('./services/claudeSDK.cjs');
const autoUpdaterService = require('./services/autoUpdater.cjs');
require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let storage;
let fileSystem;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#0F172A'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5180');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Create menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('new-chat')
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('open-project')
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  storage = new SecureStorage();
  fileSystem = new FileSystemService();

  // Initialize Claude SDK if API key exists
  try {
    const apiKey = await storage.getApiKey() || process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      claudeSDKService.initialize(apiKey);
    }
  } catch (error) {
    console.error('Failed to initialize Claude SDK:', error);
  }

  createWindow();

  // Start auto-updater schedule
  autoUpdaterService.startUpdateSchedule();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

// API Key management
ipcMain.handle('save-api-key', async (event, key) => {
  try {
    const result = await storage.saveApiKey(key);
    // Initialize Claude SDK with the new key
    if (result && key) {
      claudeSDKService.initialize(key);
    }
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-api-key', async () => {
  try {
    const key = await storage.getApiKey();
    // First try stored key, then environment variable
    return key || process.env.ANTHROPIC_API_KEY || null;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('delete-api-key', async () => {
  try {
    const result = await storage.deleteApiKey();
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// User preferences
ipcMain.handle('save-preferences', async (event, preferences) => {
  try {
    const result = await storage.saveUserPreferences(preferences);
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-preferences', async () => {
  try {
    const preferences = await storage.getUserPreferences();
    return preferences;
  } catch (error) {
    return {
      theme: 'light',
      role: null,
      tier: 'free',
      operationMode: 'yolo',
    };
  }
});

// File System Operations
ipcMain.handle('fs-read-file', async (event, filePath) => {
  return await fileSystem.readFile(filePath);
});

ipcMain.handle('fs-write-file', async (event, filePath, content) => {
  return await fileSystem.writeFile(filePath, content);
});

ipcMain.handle('fs-list-directory', async (event, dirPath) => {
  return await fileSystem.listDirectory(dirPath);
});

ipcMain.handle('fs-create-directory', async (event, dirPath) => {
  return await fileSystem.createDirectory(dirPath);
});

ipcMain.handle('fs-delete-item', async (event, itemPath) => {
  return await fileSystem.deleteItem(itemPath);
});

ipcMain.handle('fs-rename-item', async (event, oldPath, newName) => {
  return await fileSystem.renameItem(oldPath, newName);
});

ipcMain.handle('fs-open-file-picker', async (event, options) => {
  return await fileSystem.openFilePicker(options);
});

ipcMain.handle('fs-save-file-dialog', async (event, options) => {
  return await fileSystem.saveFileDialog(options);
});

ipcMain.handle('fs-get-file-metadata', async (event, filePath) => {
  return await fileSystem.getFileMetadata(filePath);
});

ipcMain.handle('fs-search-files', async (event, searchTerm, searchPath) => {
  return await fileSystem.searchFiles(searchTerm, searchPath);
});

ipcMain.handle('fs-get-workspace-info', async () => {
  return fileSystem.getWorkspaceInfo();
});