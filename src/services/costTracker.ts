// Cost Tracking Service for monitoring AI usage and costs

export interface TokenUsage {
  input: number;
  output: number;
  cached?: number;
  total: number;
}

export interface OperationCost {
  id: string;
  timestamp: Date;
  operation: 'chat' | 'search' | 'file-analysis' | 'code-generation' | 'task-automation';
  model: string;
  tokens: TokenUsage;
  cost: number;
  sessionId?: string;
  success: boolean;
  cached?: boolean;
}

export interface DailyCost {
  date: Date;
  totalCost: number;
  operations: number;
  tokens: TokenUsage;
  breakdown: {
    byOperation: Record<string, number>;
    byModel: Record<string, number>;
    byHour: Record<number, number>;
  };
}

export interface Budget {
  daily?: number;
  monthly?: number;
  warningThreshold: number; // percentage (0.8 = 80%)
  hardStop: boolean;
  autoOptimize: boolean;
}

export interface CostBreakdown {
  total: number;
  byOperation: Array<{ type: string; cost: number; percentage: number }>;
  byModel: Array<{ model: string; cost: number; percentage: number }>;
  savings: {
    fromCaching: number;
    potential: number;
  };
}

// Model pricing (per 1M tokens)
const MODEL_PRICING = {
  'claude-3-opus-20240229': {
    input: 15.00,
    output: 75.00,
    cached: 1.50
  },
  'claude-3-sonnet-20240229': {
    input: 3.00,
    output: 15.00,
    cached: 0.30
  },
  'claude-3-haiku-20240229': {
    input: 0.25,
    output: 1.25,
    cached: 0.025
  },
  'claude-3-5-sonnet-20240620': {
    input: 3.00,
    output: 15.00,
    cached: 0.30
  }
};

class CostTrackingService {
  private operations: OperationCost[] = [];
  private budget: Budget;
  private storageKey = 'halo-cost-tracking';
  private budgetKey = 'halo-budget-settings';

  constructor() {
    this.budget = {
      daily: 10.00,
      monthly: 200.00,
      warningThreshold: 0.8,
      hardStop: true,
      autoOptimize: true
    };
    this.loadData();
  }

  // Track a new operation
  trackOperation(
    operation: OperationCost['operation'],
    model: string,
    tokens: { input: number; output: number; cached?: number },
    success: boolean = true
  ): OperationCost {
    const cost = this.calculateCost(model, tokens);

    const op: OperationCost = {
      id: Date.now().toString(),
      timestamp: new Date(),
      operation,
      model,
      tokens: {
        ...tokens,
        total: tokens.input + tokens.output + (tokens.cached || 0)
      },
      cost,
      success,
      cached: (tokens.cached || 0) > 0
    };

    this.operations.push(op);
    this.saveData();

    // Check budget
    this.checkBudget();

    return op;
  }

  // Calculate cost for tokens
  calculateCost(model: string, tokens: { input: number; output: number; cached?: number }): number {
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING['claude-3-sonnet-20240229'];

    const inputCost = (tokens.input / 1000000) * pricing.input;
    const outputCost = (tokens.output / 1000000) * pricing.output;
    const cachedCost = tokens.cached ? (tokens.cached / 1000000) * pricing.cached : 0;

    return inputCost + outputCost + cachedCost;
  }

  // Estimate tokens for text (rough approximation)
  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Get current session cost
  getSessionCost(): number {
    const sessionStart = new Date();
    sessionStart.setHours(sessionStart.getHours() - 1); // Last hour as session

    return this.operations
      .filter(op => op.timestamp > sessionStart)
      .reduce((total, op) => total + op.cost, 0);
  }

  // Get today's cost
  getTodayCost(): DailyCost {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOps = this.operations.filter(op => {
      const opDate = new Date(op.timestamp);
      opDate.setHours(0, 0, 0, 0);
      return opDate.getTime() === today.getTime();
    });

    const totalCost = todayOps.reduce((sum, op) => sum + op.cost, 0);
    const totalTokens = todayOps.reduce((acc, op) => ({
      input: acc.input + op.tokens.input,
      output: acc.output + op.tokens.output,
      cached: (acc.cached || 0) + (op.tokens.cached || 0),
      total: acc.total + op.tokens.total
    }), { input: 0, output: 0, cached: 0, total: 0 });

    const breakdown = {
      byOperation: this.groupByOperation(todayOps),
      byModel: this.groupByModel(todayOps),
      byHour: this.groupByHour(todayOps)
    };

    return {
      date: today,
      totalCost,
      operations: todayOps.length,
      tokens: totalTokens,
      breakdown
    };
  }

  // Get this month's cost
  getMonthCost(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.operations
      .filter(op => new Date(op.timestamp) >= monthStart)
      .reduce((total, op) => total + op.cost, 0);
  }

  // Get cost breakdown
  getCostBreakdown(): CostBreakdown {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthOps = this.operations.filter(op => new Date(op.timestamp) >= thisMonth);
    const total = monthOps.reduce((sum, op) => sum + op.cost, 0);

    // Group by operation type
    const byOpType = this.groupByOperation(monthOps);
    const byOperation = Object.entries(byOpType).map(([type, cost]) => ({
      type,
      cost,
      percentage: total > 0 ? (cost / total) * 100 : 0
    }));

    // Group by model
    const byModelType = this.groupByModel(monthOps);
    const byModel = Object.entries(byModelType).map(([model, cost]) => ({
      model,
      cost,
      percentage: total > 0 ? (cost / total) * 100 : 0
    }));

    // Calculate savings
    const cachedOps = monthOps.filter(op => op.cached);
    const fromCaching = cachedOps.reduce((sum, op) => {
      // Estimate savings from caching (90% reduction)
      return sum + (op.cost * 9);
    }, 0);

    return {
      total,
      byOperation: byOperation.sort((a, b) => b.cost - a.cost),
      byModel: byModel.sort((a, b) => b.cost - a.cost),
      savings: {
        fromCaching,
        potential: total * 0.3 // Estimate 30% potential savings
      }
    };
  }

  // Get usage trends (last 30 days)
  getUsageTrends(): Array<{ date: string; cost: number; operations: number }> {
    const trends: Array<{ date: string; cost: number; operations: number }> = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOps = this.operations.filter(op => {
        const opTime = new Date(op.timestamp).getTime();
        return opTime >= date.getTime() && opTime < nextDate.getTime();
      });

      trends.push({
        date: date.toLocaleDateString(),
        cost: dayOps.reduce((sum, op) => sum + op.cost, 0),
        operations: dayOps.length
      });
    }

    return trends;
  }

  // Budget management
  setBudget(budget: Partial<Budget>) {
    this.budget = { ...this.budget, ...budget };
    this.saveBudget();
  }

  getBudget(): Budget {
    return this.budget;
  }

  getBudgetStatus(): {
    daily: { used: number; limit: number; percentage: number; warning: boolean };
    monthly: { used: number; limit: number; percentage: number; warning: boolean };
  } {
    const todayCost = this.getTodayCost().totalCost;
    const monthCost = this.getMonthCost();

    const daily = {
      used: todayCost,
      limit: this.budget.daily || 0,
      percentage: this.budget.daily ? (todayCost / this.budget.daily) * 100 : 0,
      warning: this.budget.daily ? todayCost >= (this.budget.daily * this.budget.warningThreshold) : false
    };

    const monthly = {
      used: monthCost,
      limit: this.budget.monthly || 0,
      percentage: this.budget.monthly ? (monthCost / this.budget.monthly) * 100 : 0,
      warning: this.budget.monthly ? monthCost >= (this.budget.monthly * this.budget.warningThreshold) : false
    };

    return { daily, monthly };
  }

  checkBudget(): { exceeded: boolean; message?: string } {
    const status = this.getBudgetStatus();

    if (this.budget.hardStop) {
      if (this.budget.daily && status.daily.used >= this.budget.daily) {
        return {
          exceeded: true,
          message: 'Daily budget limit reached. Operations paused.'
        };
      }
      if (this.budget.monthly && status.monthly.used >= this.budget.monthly) {
        return {
          exceeded: true,
          message: 'Monthly budget limit reached. Operations paused.'
        };
      }
    }

    if (status.daily.warning || status.monthly.warning) {
      return {
        exceeded: false,
        message: `Warning: Approaching ${status.daily.warning ? 'daily' : 'monthly'} budget limit`
      };
    }

    return { exceeded: false };
  }

  // Optimization suggestions
  getOptimizationSuggestions(): Array<{
    type: 'model' | 'caching' | 'batching';
    description: string;
    potentialSavings: number;
  }> {
    const suggestions = [];
    const breakdown = this.getCostBreakdown();

    // Suggest cheaper models
    const opusUsage = breakdown.byModel.find(m => m.model.includes('opus'));
    if (opusUsage && opusUsage.percentage > 30) {
      suggestions.push({
        type: 'model' as const,
        description: 'Consider using Claude 3.5 Sonnet for most tasks - 60% cheaper than Opus',
        potentialSavings: opusUsage.cost * 0.6
      });
    }

    // Suggest caching
    if (breakdown.savings.fromCaching < breakdown.total * 0.1) {
      suggestions.push({
        type: 'caching' as const,
        description: 'Enable prompt caching for repeated content',
        potentialSavings: breakdown.total * 0.2
      });
    }

    // Suggest batching
    const recentOps = this.operations.slice(-100);
    const avgInterval = this.calculateAverageInterval(recentOps);
    if (avgInterval < 60000) { // Less than 1 minute between operations
      suggestions.push({
        type: 'batching' as const,
        description: 'Batch similar operations to reduce API calls',
        potentialSavings: breakdown.total * 0.15
      });
    }

    return suggestions;
  }

  // Helper methods
  private groupByOperation(ops: OperationCost[]): Record<string, number> {
    return ops.reduce((acc, op) => {
      acc[op.operation] = (acc[op.operation] || 0) + op.cost;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByModel(ops: OperationCost[]): Record<string, number> {
    return ops.reduce((acc, op) => {
      acc[op.model] = (acc[op.model] || 0) + op.cost;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByHour(ops: OperationCost[]): Record<number, number> {
    return ops.reduce((acc, op) => {
      const hour = new Date(op.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + op.cost;
      return acc;
    }, {} as Record<number, number>);
  }

  private calculateAverageInterval(ops: OperationCost[]): number {
    if (ops.length < 2) return Infinity;

    const intervals = [];
    for (let i = 1; i < ops.length; i++) {
      const interval = new Date(ops[i].timestamp).getTime() - new Date(ops[i - 1].timestamp).getTime();
      intervals.push(interval);
    }

    return intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
  }

  // Export data
  exportUsageData(format: 'csv' | 'json' = 'json'): string {
    const data = {
      operations: this.operations,
      summary: {
        today: this.getTodayCost(),
        month: this.getMonthCost(),
        breakdown: this.getCostBreakdown()
      },
      exportDate: new Date()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    let csv = 'Date,Operation,Model,Input Tokens,Output Tokens,Cached Tokens,Cost\n';
    this.operations.forEach(op => {
      csv += `${op.timestamp},${op.operation},${op.model},${op.tokens.input},${op.tokens.output},${op.tokens.cached || 0},${op.cost.toFixed(4)}\n`;
    });
    return csv;
  }

  // Clear history
  clearHistory(beforeDate?: Date) {
    if (beforeDate) {
      this.operations = this.operations.filter(op => new Date(op.timestamp) >= beforeDate);
    } else {
      this.operations = [];
    }
    this.saveData();
  }

  // Storage
  private loadData() {
    try {
      // Load operations
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.operations = data.map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp)
        }));
      }

      // Load budget
      const budgetStored = localStorage.getItem(this.budgetKey);
      if (budgetStored) {
        this.budget = JSON.parse(budgetStored);
      }
    } catch (error) {
      console.error('Failed to load cost tracking data:', error);
    }
  }

  private saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.operations));
    } catch (error) {
      console.error('Failed to save cost tracking data:', error);
    }
  }

  private saveBudget() {
    try {
      localStorage.setItem(this.budgetKey, JSON.stringify(this.budget));
    } catch (error) {
      console.error('Failed to save budget settings:', error);
    }
  }
}

// Singleton instance
export const costTracker = new CostTrackingService();
export default costTracker;