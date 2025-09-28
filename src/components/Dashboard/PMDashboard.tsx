import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Users,
  Calendar,
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface PMDashboardProps {
  userName: string;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({ userName }) => {
  const projects = [
    {
      name: 'Q4 Launch',
      progress: 75,
      tasks: 12,
      overdue: 3,
      status: 'active',
      color: 'blue'
    },
    {
      name: 'User Feedback',
      progress: 90,
      tasks: 8,
      overdue: 0,
      status: 'review',
      color: 'green'
    },
    {
      name: 'Analytics Dashboard',
      progress: 45,
      tasks: 15,
      overdue: 1,
      status: 'active',
      color: 'purple'
    }
  ];

  const suggestions = [
    'Complete Q4 roadmap review (due today)',
    'Analyze yesterday\'s user feedback',
    'Generate weekly stakeholder update',
    'Review sprint planning for next week'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Good morning, {userName}! 👋</h1>
            <p className="text-blue-100 text-lg">Ready to make progress on your projects?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">3</div>
            <div className="text-blue-200">Active Projects</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tasks Due Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">8</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Overdue Items</p>
              <p className="text-2xl font-bold text-red-600">4</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed This Week</p>
              <p className="text-2xl font-bold text-green-600">23</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Team Velocity</p>
              <p className="text-2xl font-bold text-purple-600">+12%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Your Projects
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        project.color === 'blue' ? 'bg-blue-500' :
                        project.color === 'green' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">{project.name}</h3>
                    </div>
                    <span className="text-sm text-slate-500">Due in 14 days</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{project.tasks} tasks</span>
                      {project.overdue > 0 && (
                        <span className="text-red-600 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {project.overdue} overdue
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {project.progress}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        project.color === 'blue' ? 'bg-blue-500' :
                        project.color === 'green' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              💡 Suggested Actions
            </h2>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Sprint Review</span>
                <span className="text-xs text-slate-500">Today 3:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Stakeholder Update</span>
                <span className="text-xs text-slate-500">Tomorrow 10:00 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Q4 Planning</span>
                <span className="text-xs text-slate-500">Friday 2:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};