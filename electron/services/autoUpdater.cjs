const { autoUpdater } = require('electron-updater');
const { app, dialog, BrowserWindow } = require('electron');

class AutoUpdaterService {
  constructor() {
    this.configureUpdater();
  }

  configureUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Set up event listeners
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      this.promptUpdateDownload(info);
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No updates available');
    });

    autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let message = `Download speed: ${progressObj.bytesPerSecond}`;
      message += ` - Downloaded ${progressObj.percent}%`;
      message += ` (${progressObj.transferred}/${progressObj.total})`;
      console.log(message);

      // Send progress to renderer
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('update-download-progress', progressObj);
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded');
      this.promptInstallUpdate(info);
    });
  }

  async checkForUpdates() {
    try {
      // Only check for updates in production
      if (app.isPackaged) {
        const result = await autoUpdater.checkForUpdates();
        return result;
      } else {
        console.log('Skipping update check in development mode');
        return null;
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }

  async promptUpdateDownload(info) {
    const response = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Would you like to download it now?`,
      detail: 'The update will be installed automatically when you quit the app.',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    });

    if (response.response === 0) {
      autoUpdater.downloadUpdate();
    }
  }

  async promptInstallUpdate(info) {
    const response = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded. Would you like to install it now?`,
      detail: 'The app will restart to apply the update.',
      buttons: ['Install Now', 'Install on Quit'],
      defaultId: 0,
      cancelId: 1
    });

    if (response.response === 0) {
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  }

  // Check for updates on app startup and periodically
  startUpdateSchedule() {
    // Check on startup (after 3 seconds)
    setTimeout(() => {
      this.checkForUpdates();
    }, 3000);

    // Check every 4 hours
    setInterval(() => {
      this.checkForUpdates();
    }, 4 * 60 * 60 * 1000);
  }
}

// Create singleton instance
const autoUpdaterService = new AutoUpdaterService();

module.exports = autoUpdaterService;