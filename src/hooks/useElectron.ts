import { useEffect, useState } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      getVersion: () => Promise<string>;
      onNewChat: (callback: () => void) => void;
      onOpenProject: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkElectron = async () => {
      if (window.electronAPI) {
        setIsElectron(true);
        try {
          const appVersion = await window.electronAPI.getVersion();
          setVersion(appVersion);
        } catch (error) {
          console.error('Failed to get app version:', error);
        }
      }
    };

    checkElectron();
  }, []);

  const setupMenuListeners = (callbacks: {
    onNewChat?: () => void;
    onOpenProject?: () => void;
  }) => {
    if (window.electronAPI) {
      if (callbacks.onNewChat) {
        window.electronAPI.onNewChat(callbacks.onNewChat);
      }
      if (callbacks.onOpenProject) {
        window.electronAPI.onOpenProject(callbacks.onOpenProject);
      }
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('new-chat');
        window.electronAPI.removeAllListeners('open-project');
      }
    };
  };

  return {
    isElectron,
    version,
    setupMenuListeners,
  };
};