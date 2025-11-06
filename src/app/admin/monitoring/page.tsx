'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, Users, DollarSign, Activity } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
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
          <Button
            onClick={fetchMetrics}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Health Status */}
        {!health.healthy && (
          <Card className="bg-red-900/20 border-red-500 mb-6">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {health.alerts.map((alert, i) => (
                  <li key={i} className="text-red-300">{alert}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Recurring Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${metrics.mrr.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                ARR: ${metrics.arr.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics.activePremium + metrics.activePro}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {metrics.activePremium} Premium, {metrics.activePro} Pro
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Average Revenue Per User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${metrics.arpu}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Per paying customer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Trial Conversion Rate
              </CardTitle>
              <CardDescription className="text-gray-400">
                Percentage of trials that convert to paid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">
                {metrics.trialConversionRate}%
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Target: &gt;10% | {metrics.activeTrials} active trials
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Churn Rate
              </CardTitle>
              <CardDescription className="text-gray-400">
                Percentage of customers who canceled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-400">
                {metrics.churnRate}%
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Target: &lt;5% | {metrics.canceledSubscriptions} canceled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Metrics */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Average Usage Per User</CardTitle>
            <CardDescription className="text-gray-400">
              How users are utilizing features
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Expiring Soon */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Trials Expiring Soon</CardTitle>
              <CardDescription className="text-gray-400">
                Next 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* At Limit */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Users At Limit</CardTitle>
              <CardDescription className="text-gray-400">
                Hit usage limits today
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">7-Day Activity</CardTitle>
            <CardDescription className="text-gray-400">
              Daily subscription activity
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

