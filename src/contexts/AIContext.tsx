import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import anthropicClient, { AuthState } from '../lib/anthropic/client';

interface AIContextType {
  isConnected: boolean;
  authState: AuthState;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  usage: {
    operations: number;
    tokensUsed: number;
    estimatedCost: number;
  };
  initialize: (apiKey?: string) => Promise<void>;
  sendMessage: (message: string) => Promise<any>;
  streamMessage: (message: string, onChunk: (chunk: string) => void) => Promise<void>;
  disconnect: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    provider: 'anthropic',
    tier: 'free',
    apiKeySource: 'managed',
    connectionStatus: 'disconnected',
    errorCount: 0,
  });

  const [usage, setUsage] = useState({
    operations: 0,
    tokensUsed: 0,
    estimatedCost: 0,
  });

  useEffect(() => {
    // Try to auto-connect on mount
    autoConnect();
  }, []);

  const autoConnect = async () => {
    try {
      // Check if we have a stored API key
      const storedKey = await window.electronAPI?.getApiKey();
      if (storedKey) {
        await initialize(storedKey);
      }
    } catch (error) {
      console.error('Auto-connect failed:', error);
    }
  };

  const initialize = async (apiKey?: string) => {
    try {
      setAuthState(prev => ({ ...prev, connectionStatus: 'connecting' }));

      await anthropicClient.initialize(apiKey);
      const newAuthState = anthropicClient.getAuthState();

      setAuthState(newAuthState);

      // Save the key if provided
      if (apiKey && window.electronAPI) {
        await window.electronAPI.saveApiKey(apiKey);
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        connectionStatus: 'error',
        isAuthenticated: false,
        errorCount: prev.errorCount + 1,
      }));
      throw error;
    }
  };

  const sendMessage = async (message: string) => {
    try {
      const response = await anthropicClient.sendMessage(message);
      setUsage(anthropicClient.getUsageData());
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const streamMessage = async (message: string, onChunk: (chunk: string) => void) => {
    try {
      await anthropicClient.streamMessage(message, onChunk);
      setUsage(anthropicClient.getUsageData());
    } catch (error) {
      console.error('Failed to stream message:', error);
      throw error;
    }
  };

  const disconnect = () => {
    anthropicClient.disconnect();
    setAuthState({
      isAuthenticated: false,
      provider: 'anthropic',
      tier: 'free',
      apiKeySource: 'managed',
      connectionStatus: 'disconnected',
      errorCount: 0,
    });
  };

  return (
    <AIContext.Provider
      value={{
        isConnected: authState.isAuthenticated,
        authState,
        connectionStatus: authState.connectionStatus,
        usage,
        initialize,
        sendMessage,
        streamMessage,
        disconnect,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};