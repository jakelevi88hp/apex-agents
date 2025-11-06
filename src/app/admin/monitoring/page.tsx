'use client';

import { useEffect, useState } from 'react';

interface Metrics {
  totalSubscriptions: number;
  activeTrials: number;
  activePremium: number;
  activePro: number;
  canceledSubscriptions: number;
  expiredTrials: number;
  trialConversionRate: number;
  churnRate: number;
  mrr: number;
  arr: number;
  arpu: number;
  avgAgentsPerUser: number;
  avgMessagesPerUser: number;
  avgWorkflowsPerUser: number;
  avgStoragePerUser: number;
  usersNearLimit: number;
  webhookFailures: number;
  paymentFailures: number;
}

interface Health {
  healthy: boolean;
  alerts: string[];
}

interface MonitoringData {
  metrics: Metrics;
  health: Health;
  alerts: {
    expiringSoon: Array<{ email: string; hoursLeft: number }>;
    atLimit: Array<{ email: string; feature: string; current: number; limit: number }>;
  };
  activity: Array<{
    date: string;
    newTrials: number;
    conversions: number;
    cancellations: number;
  }>;
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/monitoring/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, health, alerts, activity } = data;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Subscription Monitoring</h1>
            <p className="text-gray-400">
              Last updated: {lastUpdate?.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Health Status */}
        {!health.healthy && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-6">
            <h2 className="text-red-400 text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              System Alerts
            </h2>
            <ul className="space-y-2">
              {health.alerts.map((alert, i) => (
                <li key={i} className="text-red-300">{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Monthly Recurring Revenue</div>
            <div className="text-3xl font-bold text-white mb-1">
              ${metrics.mrr.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">
              ARR: ${metrics.arr.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Active Subscriptions</div>
            <div className="text-3xl font-bold text-white mb-1">
              {metrics.activePremium + metrics.activePro}
            </div>
            <p className="text-xs text-gray-400">
              {metrics.activePremium} Premium, {metrics.activePro} Pro
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Average Revenue Per User</div>
            <div className="text-3xl font-bold text-white mb-1">
              ${metrics.arpu}
            </div>
            <p className="text-xs text-gray-400">
              Per paying customer
            </p>
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white text-lg font-bold mb-2">Trial Conversion Rate</h3>
            <p className="text-gray-400 text-sm mb-4">Percentage of trials that convert to paid</p>
            <div className="text-4xl font-bold text-green-400 mb-2">
              {metrics.trialConversionRate}%
            </div>
            <p className="text-sm text-gray-400">
              Target: &gt;10% | {metrics.activeTrials} active trials
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white text-lg font-bold mb-2">Churn Rate</h3>
            <p className="text-gray-400 text-sm mb-4">Percentage of customers who canceled</p>
            <div className="text-4xl font-bold text-red-400 mb-2">
              {metrics.churnRate}%
            </div>
            <p className="text-sm text-gray-400">
              Target: &lt;5% | {metrics.canceledSubscriptions} canceled
            </p>
          </div>
        </div>

        {/* Usage Metrics */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-white text-lg font-bold mb-2">Average Usage Per User</h3>
          <p className="text-gray-400 text-sm mb-4">How users are utilizing features</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Agents</p>
              <p className="text-2xl font-bold text-white">{metrics.avgAgentsPerUser}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Messages</p>
              <p className="text-2xl font-bold text-white">{metrics.avgMessagesPerUser}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Workflows</p>
              <p className="text-2xl font-bold text-white">{metrics.avgWorkflowsPerUser}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Storage</p>
              <p className="text-2xl font-bold text-white">{metrics.avgStoragePerUser} GB</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Expiring Soon */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white text-lg font-bold mb-2">Trials Expiring Soon</h3>
            <p className="text-gray-400 text-sm mb-4">Next 24 hours</p>
            {alerts.expiringSoon.length === 0 ? (
              <p className="text-gray-400">No trials expiring soon</p>
            ) : (
              <ul className="space-y-2">
                {alerts.expiringSoon.slice(0, 5).map((user, i) => (
                  <li key={i} className="text-sm text-gray-300">
                    {user.email} - {user.hoursLeft}h left
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* At Limit */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white text-lg font-bold mb-2">Users At Limit</h3>
            <p className="text-gray-400 text-sm mb-4">Hit usage limits today</p>
            {alerts.atLimit.length === 0 ? (
              <p className="text-gray-400">No users at limit</p>
            ) : (
              <ul className="space-y-2">
                {alerts.atLimit.slice(0, 5).map((user, i) => (
                  <li key={i} className="text-sm text-gray-300">
                    {user.email} - {user.feature} ({user.current}/{user.limit})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 7-Day Activity */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-white text-lg font-bold mb-2">7-Day Activity</h3>
          <p className="text-gray-400 text-sm mb-4">Daily subscription activity</p>
          <div className="space-y-2">
            {activity.map((day, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{day.date}</span>
                <div className="flex gap-4">
                  <span className="text-green-400">{day.newTrials} trials</span>
                  <span className="text-blue-400">{day.conversions} conversions</span>
                  <span className="text-red-400">{day.cancellations} cancellations</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

