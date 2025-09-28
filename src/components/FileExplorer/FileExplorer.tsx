import React, { useEffect, useState } from 'react';
import { useFileSystem } from '../../hooks/useFileSystem';
import { Folder, File, ChevronRight, Plus, Trash2, Edit2, Search, Upload, Download, FolderPlus } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const {
    isLoading,
    error,
    currentPath,
    files,
    listDirectory,
    createDirectory,
    deleteItem,
    renameItem,
    readFile,
    writeFile,
    openFilePicker,
    saveFileDialog,
    searchFiles,
  } = useFileSystem();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isElectronReady, setIsElectronReady] = useState(false);

  useEffect(() => {
    // Check if Electron API is available
    const checkElectronAPI = () => {
      if (window.electronAPI) {
        setIsElectronReady(true);
        listDirectory('');
      } else {
        // Retry after a short delay
        setTimeout(checkElectronAPI, 100);
      }
    };
    checkElectronAPI();
  }, [listDirectory]);

  const handleFileClick = async (file: any) => {
    if (file.type === 'directory') {
      await listDirectory(file.path);
    } else {
      setSelectedFile(file.path);
      const content = await readFile(file.path);
      if (content) {
        setFileContent(content);
      }
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
      await createDirectory(folderPath);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleDelete = async (itemPath: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem(itemPath);
    }
  };

  const handleRename = async (oldPath: string) => {
    if (renameValue.trim() && renameValue !== renamingItem) {
      await renameItem(oldPath, renameValue);
      setRenamingItem(null);
      setRenameValue('');
    }
  };

  const handleSaveFile = async () => {
    if (selectedFile && fileContent) {
      const success = await writeFile(selectedFile, fileContent);
      if (success) {
        setIsEditing(false);
      }
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await searchFiles(searchTerm, currentPath);
      setSearchResults(results);
    }
  };

  const handleOpenFile = async () => {
    const paths = await openFilePicker({
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'tsx'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (paths && paths.length > 0) {
      const content = await readFile(paths[0]);
      if (content) {
        setSelectedFile(paths[0]);
        setFileContent(content);
      }
    }
  };

  const handleSaveAs = async () => {
    const path = await saveFileDialog({
      defaultPath: 'untitled.txt',
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (path) {
      await writeFile(path, fileContent);
      setSelectedFile(path);
    }
  };

  if (!isElectronReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing file system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - File Tree */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
            <button
              onClick={handleOpenFile}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              title="Open File"
            >
              <Upload className="w-4 h-4" />
              Open
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* New Folder Input */}
        {showNewFolderInput && (
          <div className="p-3 border-b border-gray-200 bg-blue-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
                className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
          {currentPath && (
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
              📁 {currentPath.split('/').pop() || 'Projects'}
            </div>
          )}

          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading...
            </div>
          )}

          {error && (
            <div className="p-4 m-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-3 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Search Results ({searchResults.length})
                </span>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear
                </button>
              </div>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleFileClick(result)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-white rounded cursor-pointer mb-1"
                >
                  {result.type === 'directory' ? (
                    <Folder className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <File className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">{result.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* File Tree */}
          <div className="p-2">
            {files.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-400">
                <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No files or folders yet</p>
                <p className="text-xs mt-1">Create a folder to get started</p>
              </div>
            )}

            {files.map((file) => (
              <div
                key={file.path}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  selectedFile === file.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  onClick={() => handleFileClick(file)}
                  className="flex items-center gap-2 flex-1"
                >
                  {file.type === 'directory' ? (
                    <>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <Folder className="w-4 h-4 text-yellow-600" />
                    </>
                  ) : (
                    <>
                      <div className="w-3" />
                      <File className="w-4 h-4 text-gray-400" />
                    </>
                  )}
                  {renamingItem === file.path ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRename(file.path)}
                      onBlur={() => handleRename(file.path)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm">{file.name}</span>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingItem(file.path);
                      setRenameValue(file.name);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.path);
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - File Viewer/Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedFile.split('/').pop()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedFile}</p>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveFile}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // Reset content to original
                          readFile(selectedFile).then(content => {
                            if (content) setFileContent(content);
                          });
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleSaveAs}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Save As
                  </button>
                </div>
              </div>
            </div>

            {/* File Content */}
            <div className="flex-1 bg-white p-6 overflow-auto">
              {isEditing ? (
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <pre className="p-4 bg-gray-50 rounded-lg overflow-auto font-mono text-sm text-gray-800"
                     style={{ minHeight: '400px' }}>
                  {fileContent || 'Empty file'}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No file selected</h3>
              <p className="text-sm text-gray-500 mb-4">Select a file from the sidebar or open one from your computer</p>
              <button
                onClick={handleOpenFile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};