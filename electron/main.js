const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const SecureStorage = require('./services/storage');
require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let storage;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#0F172A'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
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

app.whenReady().then(() => {
  storage = new SecureStorage();
  createWindow();
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