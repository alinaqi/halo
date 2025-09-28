import React from 'react';
import { 
  MessageSquare, 
  Folder, 
  Bot, 
  BookOpen, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  FileText,
  Settings
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: MessageSquare, label: 'Chat' },
    { icon: Folder, label: 'Projects' },
    { icon: Search, label: 'Research' },
    { icon: FileText, label: 'Templates' },
  ];

  const bottomItems = [
    { icon: Bot, label: 'My Agents' },
    { icon: BookOpen, label: 'Knowledge' },
    { icon: Clock, label: 'History' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div 
      className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Halo</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-1">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};