import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  Plus
} from 'lucide-react';
import { memoryService } from '../../services/memoryService';

interface PMDashboardProps {
  userName: string;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  tasks: number;
  overdue: number;
  status: string;
  color: string;
  dueDate?: Date;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({ userName }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksDueToday, setTasksDueToday] = useState(0);
  const [overdueItems, setOverdueItems] = useState(0);
  const [completedThisWeek, setCompletedThisWeek] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<{title: string; time: string}[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('pm-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Initialize with empty state instead of dummy data
      setProjects([]);
    }

    // Load tasks data
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate real metrics from tasks
    const todayTasks = tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && task.status !== 'done';
    });
    setTasksDueToday(todayTasks.length);

    const overdue = tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today && task.status !== 'done';
    });
    setOverdueItems(overdue.length);

    // Calculate completed this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const completed = tasks.filter((task: any) => {
      return task.status === 'done' && new Date(task.updatedAt || task.createdAt) > weekAgo;
    });
    setCompletedThisWeek(completed.length);

    // Get contextual suggestions from memory service
    const contextSuggestions = memoryService.getContextualSuggestions();
    setSuggestions(contextSuggestions.slice(0, 4));

    // Load upcoming events from localStorage or initialize empty
    const savedEvents = localStorage.getItem('pm-events');
    if (savedEvents) {
      setUpcomingEvents(JSON.parse(savedEvents));
    } else {
      setUpcomingEvents([]);
    }
  };

  const addNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: 'New Project',
      progress: 0,
      tasks: 0,
      overdue: 0,
      status: 'planning',
      color: ['blue', 'green', 'purple', 'orange'][projects.length % 4],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('pm-projects', JSON.stringify(updatedProjects));

    // Track in memory service
    memoryService.addRecentProject(newProject.name);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getVelocity = () => {
    // Calculate velocity based on completed tasks
    if (completedThisWeek > 20) return '+12%';
    if (completedThisWeek > 10) return '+8%';
    if (completedThisWeek > 5) return '+5%';
    return '0%';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {userName}! 👋</h1>
            <p className="text-blue-100 text-lg">
              {projects.length > 0
                ? `You have ${projects.length} active project${projects.length !== 1 ? 's' : ''}`
                : 'Ready to start your first project?'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{projects.length}</div>
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
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tasksDueToday}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Overdue Items</p>
              <p className="text-2xl font-bold text-red-600">{overdueItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed This Week</p>
              <p className="text-2xl font-bold text-green-600">{completedThisWeek}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Team Velocity</p>
              <p className="text-2xl font-bold text-purple-600">{getVelocity()}</p>
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
              <button
                onClick={addNewProject}
                className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          project.color === 'blue' ? 'bg-blue-500' :
                          project.color === 'green' ? 'bg-green-500' :
                          project.color === 'orange' ? 'bg-orange-500' :
                          'bg-purple-500'
                        }`} />
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{project.name}</h3>
                      </div>
                      <span className="text-sm text-slate-500">
                        {project.dueDate
                          ? `Due in ${Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
                          : 'No deadline'
                        }
                      </span>
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
                          project.color === 'orange' ? 'bg-orange-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet</p>
                <button
                  onClick={addNewProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              💡 Suggested Actions
            </h2>
            <div className="space-y-3">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No suggestions available</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming
            </h2>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{event.title}</span>
                    <span className="text-xs text-slate-500">{event.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};