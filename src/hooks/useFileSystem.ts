import { useState, useCallback } from 'react';

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
}

export interface FileMetadata {
  path: string;
  size: number;
  created: Date;
  modified: Date;
  isDirectory: boolean;
  isFile: boolean;
}

export interface WorkspaceInfo {
  workspacePath: string;
  projectsPath: string;
}

export const useFileSystem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);

  // Read file content
  const readFile = useCallback(async (filePath: string): Promise<string | null> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.readFile(filePath);
      if (result.success) {
        return result.content;
      } else {
        setError(result.error || 'Failed to read file');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Write file content
  const writeFile = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.writeFile(filePath, content);
      if (result.success) {
        return true;
      } else {
        setError(result.error || 'Failed to write file');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to write file');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List directory contents
  const listDirectory = useCallback(async (dirPath: string = ''): Promise<FileItem[]> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.listDirectory(dirPath);
      if (result.success) {
        const items = result.items as FileItem[];
        setFiles(items);
        setCurrentPath(result.path);
        return items;
      } else {
        setError(result.error || 'Failed to list directory');
        return [];
      }
    } catch (err: any) {
      setError(err.message || 'Failed to list directory');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create directory
  const createDirectory = useCallback(async (dirPath: string): Promise<boolean> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.createDirectory(dirPath);
      if (result.success) {
        // Refresh current directory
        if (currentPath) {
          await listDirectory(currentPath);
        }
        return true;
      } else {
        setError(result.error || 'Failed to create directory');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create directory');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, listDirectory]);

  // Delete file or directory
  const deleteItem = useCallback(async (itemPath: string): Promise<boolean> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.deleteItem(itemPath);
      if (result.success) {
        // Refresh current directory
        if (currentPath) {
          await listDirectory(currentPath);
        }
        return true;
      } else {
        setError(result.error || 'Failed to delete item');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, listDirectory]);

  // Rename file or directory
  const renameItem = useCallback(async (oldPath: string, newName: string): Promise<boolean> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.renameItem(oldPath, newName);
      if (result.success) {
        // Refresh current directory
        if (currentPath) {
          await listDirectory(currentPath);
        }
        return true;
      } else {
        setError(result.error || 'Failed to rename item');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to rename item');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, listDirectory]);

  // Open file picker
  const openFilePicker = useCallback(async (options?: any): Promise<string[] | null> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.openFilePicker(options);
      if (result.success && result.paths) {
        return result.paths;
      } else if (result.canceled) {
        return null;
      } else {
        setError(result.error || 'Failed to open file picker');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to open file picker');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save file dialog
  const saveFileDialog = useCallback(async (options?: any): Promise<string | null> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.saveFileDialog(options);
      if (result.success && result.path) {
        return result.path;
      } else if (result.canceled) {
        return null;
      } else {
        setError(result.error || 'Failed to open save dialog');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to open save dialog');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get file metadata
  const getFileMetadata = useCallback(async (filePath: string): Promise<FileMetadata | null> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.getFileMetadata(filePath);
      if (result.success) {
        return result.metadata;
      } else {
        setError(result.error || 'Failed to get file metadata');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get file metadata');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search files
  const searchFiles = useCallback(async (searchTerm: string, searchPath?: string): Promise<FileItem[]> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.searchFiles(searchTerm, searchPath);
      if (result.success) {
        return result.results;
      } else {
        setError(result.error || 'Failed to search files');
        return [];
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search files');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get workspace info
  const getWorkspaceInfo = useCallback(async (): Promise<WorkspaceInfo | null> => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return null;
    }

    try {
      const info = await window.electronAPI.getWorkspaceInfo();
      return info;
    } catch (err: any) {
      setError(err.message || 'Failed to get workspace info');
      return null;
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    currentPath,
    files,

    // Actions
    readFile,
    writeFile,
    listDirectory,
    createDirectory,
    deleteItem,
    renameItem,
    openFilePicker,
    saveFileDialog,
    getFileMetadata,
    searchFiles,
    getWorkspaceInfo,
  };
};