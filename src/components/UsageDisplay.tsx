'use client';

import { trpc } from '@/lib/trpc';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';

export function UsageDisplay() {
  const { data: usage, isLoading } = trpc.subscription.getUsage.useQuery();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!usage || usage.length === 0) {
    return null;
  }

  const featureNames: Record<string, string> = {
    agi_messages: 'AGI Messages',
    agents: 'Agents',
    workflows: 'Workflows',
    storage: 'Storage',
    api_calls: 'API Calls',
  };

  const formatValue = (feature: string, value: number) => {
    if (feature === 'storage') {
      const gb = value / (1024 * 1024 * 1024);
      return `${gb.toFixed(2)} GB`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Usage This Month
      </h3>

      <div className="space-y-4">
        {usage.map((item: { feature: string; current: number; limit: number; percentage: number; resetAt: string | Date }) => {
          const isNearLimit = item.percentage >= 80;
          const isAtLimit = item.percentage >= 100;

          return (
            <div key={item.feature}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {featureNames[item.feature] || item.feature}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatValue(item.feature, item.current)} / {formatValue(item.feature, item.limit)}
                </span>
              </div>

              <div className="relative">
                <Progress 
                  value={Math.min(item.percentage, 100)} 
                  className={`h-2 ${
                    isAtLimit 
                      ? 'bg-red-200 dark:bg-red-900' 
                      : isNearLimit 
                      ? 'bg-yellow-200 dark:bg-yellow-900' 
                      : ''
                  }`}
                />
                {isAtLimit && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>Limit reached</span>
                  </div>
                )}
                {isNearLimit && !isAtLimit && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>Approaching limit</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Resets on {new Date(item.resetAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

