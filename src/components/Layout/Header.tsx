import React from 'react';
import { Search, Command, Mic, Paperclip } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="What would you like to do?"
              className="w-full pl-10 pr-12 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                <Mic className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
              <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                <Paperclip className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <kbd className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded">
            ⌘K
          </kbd>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">R</span>
          </div>
        </div>
      </div>
    </header>
  );
};