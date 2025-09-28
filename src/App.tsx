import React, { useState, useEffect } from 'react';
import { APISettings } from './components/Settings/APISettings';
import { FileExplorer } from './components/FileExplorer/FileExplorer';
import { Welcome } from './components/Onboarding/Welcome';
import { RoleSelection } from './components/Onboarding/RoleSelection';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ChatInterface } from './components/Chat/ChatInterface';
import { AIProvider, useAI } from './contexts/AIContext';
import { UserRole, ChatMessage } from './types';
import { Home, MessageSquare, FolderOpen, Settings, CheckSquare } from 'lucide-react';
import { TaskManager } from './components/TaskManagement/TaskManager';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { memoryService } from './services/memoryService';

type AppState = 'welcome' | 'role-selection' | 'api-setup' | 'dashboard' | 'main';

function AppContent() {
  const { authState } = useAI();
  const [appState, setAppState] = useState<AppState>('welcome');
  const [userRole, setUserRole] = useState<UserRole>('other');
  const [userName, setUserName] = useState('User');
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat' | 'files' | 'tasks'>('dashboard');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load saved preferences
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    if (window.electronAPI) {
      const prefs = await window.electronAPI.getPreferences();
      if (prefs?.role) {
        setUserRole(prefs.role);
        setUserName(prefs.name || 'User');
        // Skip onboarding if already set up
        if (authState.isAuthenticated) {
          setAppState('main');
        }
      }
    }
    // Load memory context
    const userContext = memoryService.getUserContext();
    if (userContext) {
      // Apply theme preference
      if (userContext.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  };

  const handleWelcomeContinue = () => {
    setAppState('role-selection');
  };

  const handleRoleSelect = async (role: UserRole) => {
    setUserRole(role);

    // Save preference
    if (window.electronAPI) {
      await window.electronAPI.savePreferences({ role, name: userName });
    }

    // Move to API setup if not authenticated
    if (!authState.isAuthenticated) {
      setAppState('api-setup');
    } else {
      setAppState('main');
    }
  };

  const handleAPISetupComplete = () => {
    setAppState('main');
  };

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    // Update memory with conversation
    memoryService.updateConversation({ role: 'user', content });

    // Get contextual suggestions from memory
    const suggestions = memoryService.getContextualSuggestions();

    // Add a mock assistant response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I'll help you with: "${content}". Let me process that request...`,
      timestamp: new Date(),
      suggestions: suggestions.slice(0, 4)
    };

    memoryService.updateConversation({ role: 'assistant', content: assistantMessage.content });
    setMessages(prev => [...prev, newMessage, assistantMessage]);
  };

  // Welcome Screen
  if (appState === 'welcome') {
    return <Welcome onContinue={handleWelcomeContinue} />;
  }

  // Role Selection
  if (appState === 'role-selection') {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  // API Setup
  if (appState === 'api-setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Connect to AI</h1>
          <APISettings />
          {authState.isAuthenticated && (
            <button
              onClick={handleAPISetupComplete}
              className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Halo →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Main Application with Navigation
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">Halo</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'chat'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat</span>
          </button>

          <button
            onClick={() => setCurrentView('files')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'files'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="font-medium">Files</span>
          </button>

          <button
            onClick={() => setCurrentView('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'tasks'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="font-medium">Tasks</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'dashboard' && (
          <Dashboard userRole={userRole} userName={userName} />
        )}
        {currentView === 'chat' && (
          <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
        )}
        {currentView === 'files' && (
          <FileExplorer />
        )}
        {currentView === 'tasks' && (
          <TaskManager userRole={userRole} />
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userRole={userRole}
        userName={userName}
        onRoleChange={setUserRole}
        onNameChange={setUserName}
      />
    </div>
  );
}

function App() {
  return (
    <AIProvider>
      <AppContent />
    </AIProvider>
  );
}

export default App;