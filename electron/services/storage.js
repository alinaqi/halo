const { safeStorage } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

class SecureStorage {
  constructor() {
    this.storageDir = path.join(app.getPath('userData'), 'secure');
    this.configFile = path.join(this.storageDir, 'config.enc');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  async saveApiKey(key) {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Encryption not available, using fallback');
      // In production, we should handle this more securely
      return this.saveFallback(key);
    }

    try {
      const encrypted = safeStorage.encryptString(key);
      const data = {
        apiKey: encrypted.toString('base64'),
        timestamp: Date.now(),
      };
      await fs.writeFile(this.configFile, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  }

  async getApiKey() {
    if (!safeStorage.isEncryptionAvailable()) {
      return this.getFallback();
    }

    try {
      const data = await fs.readFile(this.configFile, 'utf-8');
      const parsed = JSON.parse(data);
      const encrypted = Buffer.from(parsed.apiKey, 'base64');
      const decrypted = safeStorage.decryptString(encrypted);
      return decrypted;
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }

  async deleteApiKey() {
    try {
      await fs.unlink(this.configFile);
      return true;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Failed to delete API key:', error);
      }
      return false;
    }
  }

  // Fallback for systems without encryption
  async saveFallback(key) {
    // This is less secure but ensures the app works
    const data = {
      apiKey: Buffer.from(key).toString('base64'),
      timestamp: Date.now(),
      warning: 'Stored without hardware encryption',
    };
    await fs.writeFile(this.configFile, JSON.stringify(data));
    return true;
  }

  async getFallback() {
    try {
      const data = await fs.readFile(this.configFile, 'utf-8');
      const parsed = JSON.parse(data);
      return Buffer.from(parsed.apiKey, 'base64').toString();
    } catch (error) {
      return null;
    }
  }

  async saveUserPreferences(preferences) {
    const prefsFile = path.join(this.storageDir, 'preferences.json');
    try {
      await fs.writeFile(prefsFile, JSON.stringify(preferences, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }

  async getUserPreferences() {
    const prefsFile = path.join(this.storageDir, 'preferences.json');
    try {
      const data = await fs.readFile(prefsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return default preferences if file doesn't exist
      return {
        theme: 'light',
        role: null,
        tier: 'free',
        operationMode: 'yolo', // Default to YOLO mode as per PRD
      };
    }
  }
}

module.exports = SecureStorage;