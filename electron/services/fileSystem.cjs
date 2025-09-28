const fs = require('fs').promises;
const path = require('path');
const { app, dialog } = require('electron');

class FileSystemService {
  constructor() {
    this.workspacePath = app.getPath('documents');
    this.projectsPath = path.join(this.workspacePath, 'HaloProjects');
    this.ensureProjectsDirectory();
  }

  async ensureProjectsDirectory() {
    try {
      await fs.mkdir(this.projectsPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create projects directory:', error);
    }
  }

  // Read file
  async readFile(filePath) {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      return {
        success: true,
        content,
        path: absolutePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Write file
  async writeFile(filePath, content) {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
      return {
        success: true,
        path: absolutePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List directory
  async listDirectory(dirPath = '') {
    try {
      const absolutePath = this.resolveAbsolutePath(dirPath);
      const items = await fs.readdir(absolutePath, { withFileTypes: true });

      const result = await Promise.all(items.map(async item => {
        const itemPath = path.join(absolutePath, item.name);
        const stats = await fs.stat(itemPath);

        return {
          name: item.name,
          path: itemPath,
          type: item.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime
        };
      }));

      return {
        success: true,
        items: result,
        path: absolutePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create directory
  async createDirectory(dirPath) {
    try {
      const absolutePath = this.resolveAbsolutePath(dirPath);
      await fs.mkdir(absolutePath, { recursive: true });
      return {
        success: true,
        path: absolutePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file or directory
  async deleteItem(itemPath) {
    try {
      const absolutePath = this.resolveAbsolutePath(itemPath);
      const stats = await fs.stat(absolutePath);

      if (stats.isDirectory()) {
        await fs.rmdir(absolutePath, { recursive: true });
      } else {
        await fs.unlink(absolutePath);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Rename file or directory
  async renameItem(oldPath, newName) {
    try {
      const absoluteOldPath = this.resolveAbsolutePath(oldPath);
      const newPath = path.join(path.dirname(absoluteOldPath), newName);
      await fs.rename(absoluteOldPath, newPath);

      return {
        success: true,
        newPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Open file picker dialog
  async openFilePicker(options = {}) {
    const defaultOptions = {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'Code Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'json'] }
      ]
    };

    const result = await dialog.showOpenDialog({
      ...defaultOptions,
      ...options
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return {
        success: true,
        paths: result.filePaths
      };
    }

    return {
      success: false,
      canceled: true
    };
  }

  // Save file dialog
  async saveFileDialog(options = {}) {
    const defaultOptions = {
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'Code Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'json'] }
      ]
    };

    const result = await dialog.showSaveDialog({
      ...defaultOptions,
      ...options
    });

    if (!result.canceled && result.filePath) {
      return {
        success: true,
        path: result.filePath
      };
    }

    return {
      success: false,
      canceled: true
    };
  }

  // Get file metadata
  async getFileMetadata(filePath) {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      const stats = await fs.stat(absolutePath);

      return {
        success: true,
        metadata: {
          path: absolutePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search files
  async searchFiles(searchTerm, searchPath = '') {
    try {
      const absolutePath = this.resolveAbsolutePath(searchPath);
      const results = [];

      async function search(dir) {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          const itemPath = path.join(dir, item.name);

          if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              name: item.name,
              path: itemPath,
              type: item.isDirectory() ? 'directory' : 'file'
            });
          }

          if (item.isDirectory() && !item.name.startsWith('.')) {
            await search(itemPath);
          }
        }
      }

      await search(absolutePath);

      return {
        success: true,
        results,
        searchTerm
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper to resolve absolute paths
  resolveAbsolutePath(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(this.projectsPath, filePath);
  }

  // Get workspace info
  getWorkspaceInfo() {
    return {
      workspacePath: this.workspacePath,
      projectsPath: this.projectsPath
    };
  }
}

module.exports = FileSystemService;