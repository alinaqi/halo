export interface ElectronAPI {
  getVersion: () => Promise<string>;

  // API Key management
  saveApiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
  getApiKey: () => Promise<string | null>;
  deleteApiKey: () => Promise<{ success: boolean; error?: string }>;

  // User preferences
  savePreferences: (preferences: any) => Promise<{ success: boolean; error?: string }>;
  getPreferences: () => Promise<any>;

  // File system operations
  readFile: (path: string) => Promise<{ success: boolean; content?: string; path?: string; error?: string }>;
  writeFile: (path: string, content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  listDirectory: (path: string) => Promise<{ success: boolean; items?: any[]; path?: string; error?: string }>;
  createDirectory: (path: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  deleteItem: (path: string) => Promise<{ success: boolean; error?: string }>;
  renameItem: (oldPath: string, newName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>;
  openFilePicker: (options?: any) => Promise<{ success: boolean; paths?: string[]; canceled?: boolean; error?: string }>;
  saveFileDialog: (options?: any) => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
  getFileMetadata: (path: string) => Promise<{ success: boolean; metadata?: any; error?: string }>;
  searchFiles: (searchTerm: string, searchPath?: string) => Promise<{ success: boolean; results?: any[]; searchTerm?: string; error?: string }>;
  getWorkspaceInfo: () => Promise<{ workspacePath: string; projectsPath: string }>;

  // Event listeners
  onNewChat: (callback: () => void) => void;
  onOpenProject: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}