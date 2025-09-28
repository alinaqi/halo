import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { Welcome } from './components/Onboarding/Welcome';
import { RoleSelection } from './components/Onboarding/RoleSelection';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ChatInterface } from './components/Chat/ChatInterface';
import { APISettings } from './components/Settings/APISettings';
import { UserRole, ChatMessage } from './types';
import { useElectron } from './hooks/useElectron';
import { AIProvider } from './contexts/AIContext';

type AppState = 'welcome' | 'role-selection' | 'dashboard' | 'chat';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [userRole, setUserRole] = useState<UserRole>('other');
  const [userName] = useState('Rachel'); // In a real app, this would come from user input
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { setupMenuListeners } = useElectron();

  useEffect(() => {
    const cleanup = setupMenuListeners({
      onNewChat: () => {
        setMessages([]);
        setAppState('chat');
      },
      onOpenProject: () => {
        setAppState('dashboard');
      },
    });

    return cleanup;
  }, [setupMenuListeners]);

  const handleWelcomeContinue = () => {
    setAppState('role-selection');
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setAppState('dashboard');
  };

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(content, userRole),
      timestamp: new Date(),
      suggestions: getMessageSuggestions(content, userRole),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
  };

  const getAIResponse = (content: string, role: UserRole): string => {
    // Simple response logic based on user role and message content
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('feedback') || lowerContent.includes('analyze')) {
      return "I'll help you analyze that information. I can process documents, extract key insights, and create structured summaries. Would you like me to start by organizing the data by themes or sentiment?";
    }
    
    if (lowerContent.includes('project') || lowerContent.includes('timeline')) {
      return "I can help you create and manage project timelines. I'll need to understand your project scope, key milestones, and dependencies. Would you like to start with a high-level overview or dive into specific deliverables?";
    }
    
    if (lowerContent.includes('report') || lowerContent.includes('status')) {
      return "I'll help you generate a comprehensive report. I can pull data from various sources, create visualizations, and format everything professionally. What type of report are you looking to create?";
    }

    // Role-specific responses
    switch (role) {
      case 'pm':
        return "As your product management assistant, I can help with PRDs, user stories, roadmap planning, and stakeholder communication. What would you like to work on first?";
      case 'designer':
        return "I can help you organize design assets, create style guides, generate design documentation, and manage your creative workflow. How can I assist with your design work today?";
      case 'marketing':
        return "I can help you create content across multiple channels, analyze campaign performance, and research market trends. What marketing challenge can I help you tackle?";
      default:
        return "I understand you'd like help with that. I can assist with document creation, research, analysis, and workflow automation. Could you provide more details about what you're trying to accomplish?";
    }
  };

  const getMessageSuggestions = (content: string, role: UserRole): string[] => {
    const baseSuggestions = [
      'Show me examples',
      'Create a template',
      'Export results',
      'Schedule follow-up'
    ];

    if (role === 'pm') {
      return ['Create PRD template', 'Set up project tracking', 'Generate stakeholder update', 'Analyze user feedback'];
    }
    
    if (role === 'designer') {
      return ['Organize design assets', 'Create style guide', 'Export design tokens', 'Generate documentation'];
    }
    
    if (role === 'marketing') {
      return ['Create social content', 'Analyze campaign data', 'Research competitors', 'Schedule content'];
    }
    
    return baseSuggestions;
  };

  if (appState === 'welcome') {
    return (
      <AIProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">Welcome to Halo</h1>
            <APISettings />
            <button
              onClick={handleWelcomeContinue}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue to Setup
            </button>
          </div>
        </div>
      </AIProvider>
    );
  }

  if (appState === 'role-selection') {
    return (
      <AIProvider>
        <RoleSelection onRoleSelect={handleRoleSelect} />
      </AIProvider>
    );
  }

  if (appState === 'chat') {
    return (
      <AIProvider>
        <AppLayout>
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </AppLayout>
      </AIProvider>
    );
  }

  return (
    <AIProvider>
      <AppLayout>
        <Dashboard userRole={userRole} userName={userName} />
      </AppLayout>
    </AIProvider>
  );
}

export default App;