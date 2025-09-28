import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandHistory {
  command: string;
  output: string;
  timestamp: Date;
  success: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState('~/');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    // Add to command history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Execute command through Electron API
    if (window.electronAPI && window.electronAPI.executeCommand) {
      try {
        const result = await window.electronAPI.executeCommand({
          command: cmd,
          cwd: currentDirectory === '~/' ? undefined : currentDirectory
        });

        const newEntry: CommandHistory = {
          command: cmd,
          output: result.output || '',
          timestamp: new Date(),
          success: result.success
        };

        setHistory(prev => [...prev, newEntry]);

        // Update current directory if cd command
        if (cmd.startsWith('cd ') && result.success) {
          const newPath = cmd.substring(3).trim();
          if (newPath === '~' || newPath === '') {
            setCurrentDirectory('~/');
          } else if (newPath.startsWith('/')) {
            setCurrentDirectory(newPath);
          } else {
            setCurrentDirectory(prev => {
              const normalized = prev.endsWith('/') ? prev : prev + '/';
              return normalized + newPath;
            });
          }
        }
      } catch (error) {
        const newEntry: CommandHistory = {
          command: cmd,
          output: `Error: ${error}`,
          timestamp: new Date(),
          success: false
        };
        setHistory(prev => [...prev, newEntry]);
      }
    } else {
      // Demo mode
      const newEntry: CommandHistory = {
        command: cmd,
        output: 'Terminal not available in demo mode',
        timestamp: new Date(),
        success: false
      };
      setHistory(prev => [...prev, newEntry]);
    }

    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed ${
        isMaximized
          ? 'inset-0'
          : 'bottom-0 left-0 right-0 h-96 md:left-auto md:right-4 md:bottom-4 md:w-[600px] md:rounded-t-lg'
      } bg-gray-900 text-gray-100 shadow-2xl z-50 flex flex-col transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Terminal</span>
          <span className="text-xs text-gray-400">{currentDirectory}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Welcome Message */}
        {history.length === 0 && (
          <div className="text-gray-400 mb-4">
            <div>Halo Terminal v1.0.0</div>
            <div>Type 'help' for available commands</div>
            <div>Ctrl+L to clear</div>
            <div className="mt-2">---</div>
          </div>
        )}

        {/* Command History */}
        {history.map((entry, index) => (
          <div key={index} className="mb-3">
            <div className="flex items-start gap-2">
              <span className="text-green-400">$</span>
              <span className="flex-1">{entry.command}</span>
            </div>
            {entry.output && (
              <div
                className={`mt-1 ml-4 whitespace-pre-wrap ${
                  entry.success ? 'text-gray-300' : 'text-red-400'
                }`}
              >
                {entry.output}
              </div>
            )}
          </div>
        ))}

        {/* Current Input */}
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-gray-100"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};