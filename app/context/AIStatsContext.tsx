"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { setCache, getCache } from '@/app/utils/cache';

interface UsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  completion_tokens_details?: {
    reasoning_tokens: number;
    accepted_prediction_tokens: number;
    rejected_prediction_tokens: number;
  };
}

interface AIStats {
  totalCalls: number;
  lastUpdated: Date;
  usage: UsageStats;
}

interface AIStatsContextType {
  stats: AIStats;
  updateStats: (newUsage: UsageStats) => void;
  resetStats: () => void;
}

const defaultStats: AIStats = {
  totalCalls: 0,
  lastUpdated: new Date(0),
  usage: {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    completion_tokens_details: {
      reasoning_tokens: 0,
      accepted_prediction_tokens: 0,
      rejected_prediction_tokens: 0
    }
  }
};

const CACHE_KEY = 'ai_usage_stats';

const AIStatsContext = createContext<AIStatsContextType | undefined>(undefined);

export function AIStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AIStats>(() => {
    // Try to load from cache first
    if (typeof window !== 'undefined') {
      const cached = getCache<AIStats>(CACHE_KEY);
      if (cached) {
        return {
          ...cached,
          lastUpdated: new Date(cached.lastUpdated) // Convert date string back to Date object
        };
      }
    }
    return {
      ...defaultStats,
      lastUpdated: new Date()
    };
  });

  // Update cache whenever stats change
  useEffect(() => {
    setCache(CACHE_KEY, stats);
  }, [stats]);

  const updateStats = (newUsage: UsageStats) => {
    setStats(prev => ({
      totalCalls: prev.totalCalls + 1,
      lastUpdated: new Date(),
      usage: {
        prompt_tokens: prev.usage.prompt_tokens + newUsage.prompt_tokens,
        completion_tokens: prev.usage.completion_tokens + newUsage.completion_tokens,
        total_tokens: prev.usage.total_tokens + newUsage.total_tokens,
        completion_tokens_details: {
          reasoning_tokens: (prev.usage.completion_tokens_details?.reasoning_tokens || 0) + 
                          (newUsage.completion_tokens_details?.reasoning_tokens || 0),
          accepted_prediction_tokens: (prev.usage.completion_tokens_details?.accepted_prediction_tokens || 0) + 
                                    (newUsage.completion_tokens_details?.accepted_prediction_tokens || 0),
          rejected_prediction_tokens: (prev.usage.completion_tokens_details?.rejected_prediction_tokens || 0) + 
                                    (newUsage.completion_tokens_details?.rejected_prediction_tokens || 0)
        }
      }
    }));
  };

  const resetStats = () => {
    setStats({
      ...defaultStats,
      lastUpdated: new Date()
    });
  };

  return (
    <AIStatsContext.Provider value={{ stats, updateStats, resetStats }}>
      {children}
    </AIStatsContext.Provider>
  );
}

export function useAIStats() {
  const context = useContext(AIStatsContext);
  if (context === undefined) {
    throw new Error('useAIStats must be used within an AIStatsProvider');
  }
  return context;
} 