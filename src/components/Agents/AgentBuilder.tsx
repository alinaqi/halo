import React, { useState, useEffect } from 'react';
import {
  Bot, Play, History, Plus, Settings, ChevronRight, Loader,
  Code, Bug, Database, Edit3, Search, Sparkles, CheckCircle, XCircle
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface AgentExecution {
  id: string;
  agentType: string;
  agentName: string;
  task: string;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: Date;
  duration?: number;
}

interface AgentBuilderProps {
  userRole: string;
}

export const AgentBuilder: React.FC<AgentBuilderProps> = ({ userRole }) => {
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('general-purpose');
  const [taskInput, setTaskInput] = useState('');
  const [context, setContext] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<AgentExecution[]>([]);
  const [activeExecution, setActiveExecution] = useState<AgentExecution | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadAvailableAgents();
    loadExecutionHistory();
  }, []);

  const loadAvailableAgents = async () => {
    if (window.electronAPI && window.electronAPI.getAvailableAgents) {
      const response = await window.electronAPI.getAvailableAgents();
      if (response.success) {
        setAvailableAgents(response.agents);
      }
    } else {
      // Default agents for demo
      setAvailableAgents([
        { id: 'general-purpose', name: 'General Purpose', description: 'Handles complex multi-step tasks' },
        { id: 'code-reviewer', name: 'Code Reviewer', description: 'Reviews code for quality and improvements' },
        { id: 'debugger', name: 'Debugger', description: 'Identifies and fixes bugs' },
        { id: 'data-analyst', name: 'Data Analyst', description: 'Analyzes data and extracts insights' },
        { id: 'content-writer', name: 'Content Writer', description: 'Creates engaging content' },
        { id: 'research', name: 'Research', description: 'Conducts thorough research' }
      ]);
    }
  };

  const loadExecutionHistory = () => {
    const stored = localStorage.getItem('halo-agent-history');
    if (stored) {
      try {
        const history = JSON.parse(stored);
        setExecutionHistory(history.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load agent history:', error);
      }
    }
  };

  const saveExecutionHistory = (history: AgentExecution[]) => {
    try {
      localStorage.setItem('halo-agent-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save agent history:', error);
    }
  };

  const executeAgent = async () => {
    if (!taskInput.trim()) return;

    setIsExecuting(true);
    const startTime = Date.now();

    const execution: AgentExecution = {
      id: Date.now().toString(),
      agentType: selectedAgent,
      agentName: availableAgents.find(a => a.id === selectedAgent)?.name || 'Unknown',
      task: taskInput,
      status: 'running',
      timestamp: new Date()
    };

    setActiveExecution(execution);
    const updatedHistory = [execution, ...executionHistory];
    setExecutionHistory(updatedHistory);

    try {
      if (window.electronAPI && window.electronAPI.executeAgent) {
        const response = await window.electronAPI.executeAgent({
          agentType: selectedAgent,
          task: taskInput,
          context: context ? JSON.parse(context) : {}
        });

        const duration = Date.now() - startTime;

        if (response.success) {
          execution.status = 'completed';
          execution.result = response;
          execution.duration = duration;
        } else {
          execution.status = 'failed';
          execution.error = response.error;
          execution.duration = duration;
        }
      } else {
        // Demo execution
        await new Promise(resolve => setTimeout(resolve, 2000));

        execution.status = 'completed';
        execution.duration = Date.now() - startTime;
        execution.result = {
          success: true,
          agent: availableAgents.find(a => a.id === selectedAgent)?.name,
          result: `Demo result for task: "${taskInput}"\n\nThis is a simulated agent execution. In production, this would perform real AI-powered analysis and task execution.`,
          structured: {
            steps: ['Analyzed task requirements', 'Generated execution plan', 'Completed task successfully'],
            summary: 'Task completed successfully in demo mode'
          }
        };
      }
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.duration = Date.now() - startTime;
    }

    const finalHistory = [execution, ...executionHistory.slice(1)];
    setExecutionHistory(finalHistory);
    saveExecutionHistory(finalHistory);
    setActiveExecution(execution);
    setIsExecuting(false);
  };

  const getAgentIcon = (agentId: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'general-purpose': <Sparkles className="w-5 h-5" />,
      'code-reviewer': <Code className="w-5 h-5" />,
      'debugger': <Bug className="w-5 h-5" />,
      'data-analyst': <Database className="w-5 h-5" />,
      'content-writer': <Edit3 className="w-5 h-5" />,
      'research': <Search className="w-5 h-5" />
    };
    return icons[agentId] || <Bot className="w-5 h-5" />;
  };

  const quickTasks = {
    pm: [
      'Create a project timeline for the next sprint',
      'Analyze team velocity and suggest improvements',
      'Generate risk assessment for current project'
    ],
    designer: [
      'Review UI components for consistency',
      'Generate color palette variations',
      'Analyze accessibility compliance'
    ],
    marketing: [
      'Create social media content calendar',
      'Analyze competitor marketing strategies',
      'Generate SEO keywords for campaign'
    ],
    developer: [
      'Review code for security vulnerabilities',
      'Debug performance issues in the application',
      'Generate unit tests for core functions'
    ],
    other: [
      'Analyze document and extract key points',
      'Research best practices for the task',
      'Generate implementation plan'
    ]
  };

  const suggestions = quickTasks[userRole as keyof typeof quickTasks] || quickTasks.other;

  return (
    <div className="h-full flex">
      {/* Left Panel - Agent Selection and Task Input */}
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Agents</h2>
          <p className="text-gray-600 dark:text-gray-400">Specialized AI assistants for complex tasks</p>
        </div>

        {/* Agent Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Agent
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedAgent === agent.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${
                    selectedAgent === agent.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {getAgentIcon(agent.id)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {agent.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Task Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Description
          </label>
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Describe the task you want the agent to perform..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
            rows={4}
          />
        </div>

        {/* Context (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context (Optional JSON)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder='{"projectName": "MyApp", "language": "TypeScript"}'
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-mono text-sm resize-none"
            rows={2}
          />
        </div>

        {/* Quick Tasks */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Tasks</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setTaskInput(suggestion)}
                className="w-full text-left px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="w-3 h-3 inline mr-2" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <button
          onClick={executeAgent}
          disabled={isExecuting || !taskInput.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isExecuting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Executing Agent...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Execute Agent
            </>
          )}
        </button>
      </div>

      {/* Right Panel - Results and History */}
      <div className="w-1/2 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {showHistory ? 'Execution History' : 'Results'}
          </h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="text-sm">{showHistory ? 'View Results' : 'View History'}</span>
          </button>
        </div>

        {showHistory ? (
          // History View
          <div className="space-y-3">
            {executionHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No execution history yet
              </p>
            ) : (
              executionHistory.slice(0, 10).map((execution) => (
                <button
                  key={execution.id}
                  onClick={() => {
                    setActiveExecution(execution);
                    setShowHistory(false);
                  }}
                  className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getAgentIcon(execution.agentType)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {execution.agentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {execution.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : execution.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        execution.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : execution.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {execution.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {execution.task}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span>{execution.timestamp.toLocaleTimeString()}</span>
                    {execution.duration && (
                      <span>{(execution.duration / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Results View
          <div className="h-full">
            {activeExecution ? (
              <div className="space-y-4">
                {/* Execution Header */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getAgentIcon(activeExecution.agentType)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {activeExecution.agentName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activeExecution.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeExecution.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : activeExecution.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}>
                      {activeExecution.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Task:</strong> {activeExecution.task}
                  </div>
                  {activeExecution.duration && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Execution time: {(activeExecution.duration / 1000).toFixed(2)} seconds
                    </div>
                  )}
                </div>

                {/* Results */}
                {activeExecution.status === 'running' ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Agent is processing your task...</p>
                    </div>
                  </div>
                ) : activeExecution.status === 'completed' && activeExecution.result ? (
                  <div className="space-y-4">
                    {/* Main Result */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">Result</h5>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                        {activeExecution.result.result || 'No result text available'}
                      </pre>
                    </div>

                    {/* Structured Data */}
                    {activeExecution.result.structured && (
                      <>
                        {activeExecution.result.structured.steps?.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Execution Steps</h5>
                            <ol className="list-decimal list-inside space-y-1">
                              {activeExecution.result.structured.steps.map((step: string, index: number) => (
                                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {activeExecution.result.structured.findings?.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Findings</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {activeExecution.result.structured.findings.map((finding: string, index: number) => (
                                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeExecution.result.structured.code && (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Generated Code</h5>
                            <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                              <code className="text-gray-700 dark:text-gray-300">
                                {activeExecution.result.structured.code}
                              </code>
                            </pre>
                          </div>
                        )}
                      </>
                    )}

                    {/* Token Usage */}
                    {activeExecution.result.usage && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 dark:text-blue-300">Token Usage</span>
                          <span className="text-blue-900 dark:text-blue-100 font-medium">
                            {activeExecution.result.usage.total} tokens
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeExecution.status === 'failed' ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">Execution Failed</h5>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {activeExecution.error || 'An unknown error occurred'}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Bot className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select an agent and provide a task to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};