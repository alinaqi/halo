import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
  Download,
  Settings,
  Zap,
  Shield,
  Info
} from 'lucide-react';
import { costTracker, CostBreakdown, Budget } from '../../services/costTracker';

export const CostDashboard: React.FC = () => {
  const [todayCost, setTodayCost] = useState(0);
  const [monthCost, setMonthCost] = useState(0);
  const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);
  const [budget, setBudget] = useState<Budget>(costTracker.getBudget());
  const [budgetStatus, setBudgetStatus] = useState(costTracker.getBudgetStatus());
  const [trends, setTrends] = useState<Array<{ date: string; cost: number }>>([]);
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [suggestions, setSuggestions] = useState(costTracker.getOptimizationSuggestions());

  useEffect(() => {
    loadCostData();
    const interval = setInterval(loadCostData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCostData = () => {
    setTodayCost(costTracker.getTodayCost().totalCost);
    setMonthCost(costTracker.getMonthCost());
    setBreakdown(costTracker.getCostBreakdown());
    setBudgetStatus(costTracker.getBudgetStatus());
    setTrends(costTracker.getUsageTrends().slice(-7)); // Last 7 days
    setSuggestions(costTracker.getOptimizationSuggestions());
  };

  const handleBudgetSave = (newBudget: Partial<Budget>) => {
    costTracker.setBudget(newBudget);
    setBudget(costTracker.getBudget());
    setBudgetStatus(costTracker.getBudgetStatus());
    setShowBudgetSettings(false);
  };

  const exportData = (format: 'csv' | 'json') => {
    const data = costTracker.exportUsageData(format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halo-usage-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
  };

  const formatCost = (cost: number) => `$${cost.toFixed(3)}`;
  const formatPercentage = (value: number) => `${Math.round(value)}%`;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cost Tracking & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor your AI usage and manage costs</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBudgetSettings(true)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Budget Settings
            </button>
            <button
              onClick={() => exportData('csv')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Budget Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Budget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Today's Usage
              </h3>
              {budgetStatus.daily.warning && (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCost(todayCost)}
                </span>
                {budget.daily && (
                  <span className="text-sm text-gray-500">
                    of {formatCost(budget.daily)} limit
                  </span>
                )}
              </div>
              {budget.daily && (
                <>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        budgetStatus.daily.percentage >= 100
                          ? 'bg-red-500'
                          : budgetStatus.daily.percentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetStatus.daily.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPercentage(budgetStatus.daily.percentage)} used
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Monthly Budget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                This Month
              </h3>
              {budgetStatus.monthly.warning && (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCost(monthCost)}
                </span>
                {budget.monthly && (
                  <span className="text-sm text-gray-500">
                    of {formatCost(budget.monthly)} limit
                  </span>
                )}
              </div>
              {budget.monthly && (
                <>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        budgetStatus.monthly.percentage >= 100
                          ? 'bg-red-500'
                          : budgetStatus.monthly.percentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetStatus.monthly.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPercentage(budgetStatus.monthly.percentage)} used
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        {breakdown && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Cost Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Operation */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Operation</h4>
                <div className="space-y-2">
                  {breakdown.byOperation.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' :
                          index === 3 ? 'bg-amber-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {item.type.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCost(item.cost)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({formatPercentage(item.percentage)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Model */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Model</h4>
                <div className="space-y-2">
                  {breakdown.byModel.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.model.includes('opus') ? 'bg-purple-500' :
                          item.model.includes('sonnet') ? 'bg-blue-500' :
                          'bg-green-500'
                        }`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.model.split('-').slice(0, 3).join(' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCost(item.cost)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({formatPercentage(item.percentage)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings */}
            {breakdown.savings.fromCaching > 0 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  💰 Saved {formatCost(breakdown.savings.fromCaching)} this month from caching
                </p>
              </div>
            )}
          </div>
        )}

        {/* Usage Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            7-Day Trend
          </h3>
          <div className="space-y-2">
            {trends.map((day, index) => {
              const maxCost = Math.max(...trends.map(t => t.cost));
              const percentage = maxCost > 0 ? (day.cost / maxCost) * 100 : 0;

              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{day.date}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                    <div
                      className="h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end px-2"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {formatCost(day.cost)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimization Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Optimization Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {suggestion.description}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Potential savings: {formatCost(suggestion.potentialSavings)}/month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Settings Modal */}
        {showBudgetSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Budget Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Limit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={budget.daily || ''}
                    onChange={(e) => setBudget({ ...budget, daily: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Limit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={budget.monthly || ''}
                    onChange={(e) => setBudget({ ...budget, monthly: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="200.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Warning Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={budget.warningThreshold * 100}
                    onChange={(e) => setBudget({ ...budget, warningThreshold: parseFloat(e.target.value) / 100 })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={budget.hardStop}
                      onChange={(e) => setBudget({ ...budget, hardStop: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Pause operations when limit reached
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={budget.autoOptimize}
                      onChange={(e) => setBudget({ ...budget, autoOptimize: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Auto-optimize to reduce costs
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBudgetSettings(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBudgetSave(budget)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};