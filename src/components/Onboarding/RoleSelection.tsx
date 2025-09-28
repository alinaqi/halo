import React from 'react';
import { UserRole } from '../../types';
import { 
  BarChart3, 
  Palette, 
  Megaphone, 
  Code, 
  Briefcase, 
  Star 
} from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'pm' as UserRole,
      title: 'Product Manager',
      icon: BarChart3,
      description: 'Manage projects, create PRDs, analyze metrics',
      color: 'blue'
    },
    {
      id: 'designer' as UserRole,
      title: 'Designer',
      icon: Palette,
      description: 'Design systems, mockups, asset management',
      color: 'purple'
    },
    {
      id: 'marketing' as UserRole,
      title: 'Marketing',
      icon: Megaphone,
      description: 'Content creation, campaigns, analytics',
      color: 'pink'
    },
    {
      id: 'developer' as UserRole,
      title: 'Developer',
      icon: Code,
      description: 'Code review, documentation, deployment',
      color: 'green'
    },
    {
      id: 'business' as UserRole,
      title: 'Business',
      icon: Briefcase,
      description: 'Strategy, analysis, reporting',
      color: 'indigo'
    },
    {
      id: 'other' as UserRole,
      title: 'Other',
      icon: Star,
      description: 'Tell us more about your role',
      color: 'amber'
    }
  ];

  const getColorClasses = (color: string, selected = false) => {
    const colors = {
      blue: selected ? 'bg-blue-600 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300',
      purple: selected ? 'bg-purple-600 text-white' : 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-300',
      pink: selected ? 'bg-pink-600 text-white' : 'bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:hover:bg-pink-900/40 dark:text-pink-300',
      green: selected ? 'bg-green-600 text-white' : 'bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-300',
      indigo: selected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300',
      amber: selected ? 'bg-amber-600 text-white' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-300'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            What's your primary role?
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            I'll customize your experience based on what you do most
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-lg ${getColorClasses(role.color)}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <role.icon className="w-12 h-12" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{role.title}</h3>
                <p className="text-sm opacity-80">{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
};