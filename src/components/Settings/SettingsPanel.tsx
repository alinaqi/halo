import React, { useState, useEffect } from 'react';
import { APISettings } from './APISettings';
import { memoryService } from '../../services/memoryService';
import { userDataService } from '../../services/userDataService';
import {
  Settings,
  Zap,
  Shield,
  Moon,
  Sun,
  Monitor,
  Bell,
  Download,
  Upload,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userName: string;
  onRoleChange?: (role: string) => void;
  onNameChange?: (name: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  userRole,
  userName,
  onRoleChange,
  onNameChange
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'memory' | 'advanced'>('general');
  const [preferences, setPreferences] = useState({
    operationMode: 'careful' as 'yolo' | 'careful',
    theme: 'auto' as 'light' | 'dark' | 'auto',
    autoSave: true,
    notifications: true,
    confirmDestructive: true,
    showTooltips: true
  });

  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 0,
    conversationLength: 0,
    recentProjects: 0,
    recentFiles: 0
  });

  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    loadSettings();
    loadModels();
  }, []);

  const loadSettings = () => {
    const userContext = memoryService.getUserContext();
    setPreferences(userContext.preferences);

    // Calculate memory stats
    setMemoryStats({
      totalMemories: memoryService.getMemoriesByType('conversation', 1000).length,
      conversationLength: 0, // Will be updated from memory service
      recentProjects: userContext.recentProjects.length,
      recentFiles: userContext.recentFiles.length
    });

    // Load selected model from user profile
    const profile = userDataService.getProfile();
    if (profile.selectedModel) {
      setSelectedModel(profile.selectedModel);
    }
  };

  const loadModels = async () => {
    if (window.electronAPI && window.electronAPI.getAvailableModels) {
      try {
        const response = await window.electronAPI.getAvailableModels();
        if (response.success) {
          setAvailableModels(response.models);
          if (!selectedModel && response.currentModel) {
            setSelectedModel(response.currentModel);
          }
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    }
  };

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);

    // Save to user profile
    userDataService.updateProfile({ selectedModel: modelId });

    // Update Claude SDK
    if (window.electronAPI && window.electronAPI.setClaudeModel) {
      const response = await window.electronAPI.setClaudeModel(modelId);
      if (response.success) {
        console.log(`Switched to model: ${response.model.name}`);
      }
    }
  };

  const saveSettings = () => {
    memoryService.updateUserContext({ preferences });
    userDataService.updateProfile({ selectedModel });
    if (window.electronAPI) {
      window.electronAPI.savePreferences({ ...preferences, role: userRole, name: userName });
    }
    onClose();
  };

  const handleModeToggle = (mode: 'yolo' | 'careful') => {
    setPreferences({ ...preferences, operationMode: mode });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    setPreferences({ ...preferences, theme });
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto mode - check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  const exportMemory = () => {
    const data = memoryService.exportMemories();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halo-memory-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMemory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            memoryService.importMemories(event.target?.result as string);
            loadSettings();
          } catch (error) {
            alert('Failed to import memory data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearMemory = () => {
    if (confirm('Are you sure you want to clear all memory? This cannot be undone.')) {
      memoryService.clearMemories();
      loadSettings();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['general', 'api', 'memory', 'advanced'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Operation Mode */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Operation Mode
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleModeToggle('careful')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.operationMode === 'careful'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Shield className="w-8 h-8 mb-2 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Careful Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Confirms before taking actions, shows previews, safer for beginners
                    </p>
                  </button>

                  <button
                    onClick={() => handleModeToggle('yolo')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.operationMode === 'yolo'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Zap className="w-8 h-8 mb-2 text-orange-600 dark:text-orange-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">YOLO Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Fast execution, minimal confirmations, for experienced users
                    </p>
                  </button>
                </div>

                {preferences.operationMode === 'yolo' && (
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        YOLO mode executes actions immediately without confirmation. Make sure you understand the implications before enabling.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Appearance
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      preferences.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      preferences.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('auto')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      preferences.theme === 'auto'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    Auto
                  </button>
                </div>
              </div>

              {/* Other Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Behavior
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Auto-save changes</span>
                    <input
                      type="checkbox"
                      checked={preferences.autoSave}
                      onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Enable notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Confirm destructive actions</span>
                    <input
                      type="checkbox"
                      checked={preferences.confirmDestructive}
                      onChange={(e) => setPreferences({ ...preferences, confirmDestructive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Show tooltips</span>
                    <input
                      type="checkbox"
                      checked={preferences.showTooltips}
                      onChange={(e) => setPreferences({ ...preferences, showTooltips: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  API Configuration
                </h3>
                <APISettings />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Model Selection
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose the Claude model that best fits your needs
                </p>

                <div className="space-y-3">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelChange(model.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedModel === model.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {model.name}
                            {selectedModel === model.id && (
                              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {model.description}
                          </p>
                        </div>
                        {model.id.includes('haiku') && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                            Fast & Cheap
                          </span>
                        )}
                        {model.id.includes('sonnet') && !model.id.includes('3-7') && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                            Balanced
                          </span>
                        )}
                        {model.id.includes('opus') && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                            Most Capable
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Model Recommendations
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• <strong>Haiku 3.5:</strong> Best for quick responses and high-volume tasks</li>
                    <li>• <strong>Sonnet 3.7/4:</strong> Great balance of capability and speed</li>
                    <li>• <strong>Opus 4/4.1:</strong> Most powerful for complex reasoning and coding</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Memory & Context
                </h3>

                {/* Memory Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Memories</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {memoryStats.totalMemories}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recent Projects</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {memoryStats.recentProjects}
                    </p>
                  </div>
                </div>

                {/* Memory Actions */}
                <div className="space-y-3">
                  <button
                    onClick={exportMemory}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Memory
                  </button>
                  <button
                    onClick={importMemory}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Import Memory
                  </button>
                  <button
                    onClick={clearMemory}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Memory
                  </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Memory helps Halo understand your context and provide better suggestions. Your data is stored locally and never sent to external servers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Advanced Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => onNameChange?.(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={userRole}
                      onChange={(e) => onRoleChange?.(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pm">Product Manager</option>
                      <option value="designer">Designer</option>
                      <option value="marketing">Marketing</option>
                      <option value="developer">Developer</option>
                      <option value="business">Business</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Memory Size (entries)
                    </label>
                    <input
                      type="number"
                      value="1000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};