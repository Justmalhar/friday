'use client';
import { useAIStats } from '../context/AIStatsContext';
import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

// Constants
const COST_PER_1M_INPUT_TOKENS = 0.15;   // $0.150 per 1M input tokens
const COST_PER_1M_OUTPUT_TOKENS = 0.60;  // $0.600 per 1M output tokens
const MAX_BUDGET = 10.00;  // $10 budget

export default function AIStatusMonitor() {
  const { stats, resetStats } = useAIStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate total cost
  const calculateCost = () => {
    const inputCost = (stats.usage.prompt_tokens / 1_000_000) * COST_PER_1M_INPUT_TOKENS;
    const outputCost = (stats.usage.completion_tokens / 1_000_000) * COST_PER_1M_OUTPUT_TOKENS;
    return inputCost + outputCost;
  };

  // Calculate percentage of budget used
  const calculateBudgetUsage = (cost: number) => {
    return (cost / MAX_BUDGET) * 100;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!mounted) return null;

  const totalCost = calculateCost();
  const budgetUsagePercent = calculateBudgetUsage(totalCost);
  const remainingBudget = MAX_BUDGET - totalCost;

  return (
    <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-mono text-blue-400">AI CORE STATUS</h2>
        <button
          onClick={resetStats}
          className="p-1.5 rounded-full hover:bg-blue-500/20 text-blue-400/50 
                   hover:text-blue-400 transition-colors"
          title="Reset Stats"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Total Cost */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-mono text-blue-400/70">Budget Usage</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-emerald-400">
                ${totalCost.toFixed(4)}
              </span>
              <span className="text-xs font-mono text-blue-400/50">
                / ${MAX_BUDGET.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="h-1 bg-blue-500/20 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent > 90 
                  ? 'bg-red-500/50' 
                  : budgetUsagePercent > 75 
                    ? 'bg-yellow-500/50' 
                    : 'bg-emerald-500/50'
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-blue-400/50">
              Remaining: ${remainingBudget.toFixed(4)}
            </span>
            <span className={`${
              budgetUsagePercent > 90 
                ? 'text-red-400' 
                : budgetUsagePercent > 75 
                  ? 'text-yellow-400' 
                  : 'text-emerald-400'
            }`}>
              {budgetUsagePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Token Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-mono text-blue-400/70">Token Usage</span>
            <span className="text-sm font-mono text-blue-400">{stats.usage.total_tokens}</span>
          </div>
          <div className="flex gap-1 text-xs font-mono">
            <div className="flex-1 bg-blue-500/10 rounded p-2">
              <div className="text-blue-400/50">Input (${(stats.usage.prompt_tokens / 1_000_000 * COST_PER_1M_INPUT_TOKENS).toFixed(4)})</div>
              <div className="text-blue-400">{stats.usage.prompt_tokens}</div>
            </div>
            <div className="flex-1 bg-blue-500/10 rounded p-2">
              <div className="text-blue-400/50">Output (${(stats.usage.completion_tokens / 1_000_000 * COST_PER_1M_OUTPUT_TOKENS).toFixed(4)})</div>
              <div className="text-blue-400">{stats.usage.completion_tokens}</div>
            </div>
          </div>
        </div>

        {/* Processing Details */}
        <div className="space-y-2">
          <div className="text-sm font-mono text-blue-400/70">Processing Details</div>
          <div className="grid grid-cols-2 gap-1 text-xs font-mono">
            <div className="bg-blue-500/10 rounded p-2">
              <div className="text-blue-400/50">Reasoning</div>
              <div className="text-blue-400">
                {stats.usage.completion_tokens_details?.reasoning_tokens || 0}
              </div>
            </div>
            <div className="bg-blue-500/10 rounded p-2">
              <div className="text-blue-400/50">Predictions</div>
              <div className="text-blue-400">
                {(stats.usage.completion_tokens_details?.accepted_prediction_tokens || 0) + 
                 (stats.usage.completion_tokens_details?.rejected_prediction_tokens || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-mono text-blue-400/70">Total API Calls</span>
            <span className="text-sm font-mono text-blue-400">{stats.totalCalls}</span>
          </div>
          <div className="text-xs font-mono text-blue-400/50">
            Last Updated: {formatTime(stats.lastUpdated)}
          </div>
        </div>
      </div>
    </div>
  );
} 