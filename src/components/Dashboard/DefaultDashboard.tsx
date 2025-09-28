import React from 'react';
import { UserRole } from '../../types';
import { Sparkles, FileText, Search, Users, Settings, ChevronRight } from 'lucide-react';

interface DefaultDashboardProps {
  userName: string;
  userRole: UserRole;
}

export const DefaultDashboard: React.FC<DefaultDashboardProps> = ({ userName, userRole }) => {
  const getRoleEmoji = (role: UserRole) => {
    switch (role) {
      case 'developer': return '💻';
      case 'business': return '💼';
      default: return '✨';
    }
  };

  const quickActions = [
    { icon: FileText, title: 'Create Document', description: 'Generate a new document from template' },
    { icon: Search, title: 'Research Topic', description: 'Analyze information and create summary' },
    { icon: Users, title: 'Team Collaboration', description: 'Work with team members on projects' },
    { icon: Settings, title: 'Customize Workspace', description: 'Personalize your Halo experience' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Good morning, {userName}! {getRoleEmoji(userRole)}
            </h1>
            <p className="text-indigo-100 text-lg">What would you like to accomplish today?</p>
          </div>
          <div className="text-right">
            <Sparkles className="w-12 h-12 text-indigo-200 mb-2" />
            <div className="text-indigo-200">AI Assistant</div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Let's get you started
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Halo adapts to your workflow. Choose an action below or simply tell me what you need help with.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="p-6 border border-slate-200 dark:border-slate-600 rounded-xl hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:scale-105 text-left group"
            >
              <action.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {action.description}
              </p>
              <ChevronRight className="w-4 h-4 text-slate-400 mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Try asking me something like:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  "Help me organize my documents by project"
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  "Create a summary of my recent work"
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  "Generate a report from my meeting notes"
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  "Research competitors in my industry"
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};