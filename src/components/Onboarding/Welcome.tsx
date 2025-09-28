import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

interface WelcomeProps {
  onContinue: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to Halo
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Your AI work assistant that feels like a natural extension of how you think and work.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            What makes Halo different?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-left">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Context Aware</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Remembers what you're working on and suggests relevant actions
              </p>
            </div>
            
            <div className="text-left">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Invisible Complexity</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Complex operations feel simple through natural language
              </p>
            </div>
            
            <div className="text-left">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Role-Based</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Customized interface and tools for your specific role
              </p>
            </div>
            
            <div className="text-left">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Visual Confidence</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                See what will happen before it happens, with clear undo options
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <span>Let's get started</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};