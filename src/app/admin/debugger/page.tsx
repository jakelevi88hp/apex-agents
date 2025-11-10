'use client';

/**
 * Real-time Debugger Dashboard
 * 
 * Monitor application health, errors, and performance in real-time
 */

import { useEffect, useState } from 'react';

interface HealthStatus {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: string;
  errorMessage?: string;
  metrics?: any;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  endpoint?: string;
  resolved: boolean;
  fixApplied?: string;
}

interface ErrorStats {
  total: number;
  resolved: number;
  unresolved: number;
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
}

export default function DebuggerDashboard() {
  const [health, setHealth] = useState<HealthStatus[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('all');

  // Fetch health status
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/debugger?action=health');
      const data = await response.json();
      setHealth(data.components || []);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  // Fetch errors
  const fetchErrors = async () => {
    try {
      const action = filter === 'unresolved' ? 'unresolved' : 'errors';
      const response = await fetch(`/api/debugger?action=${action}`);
      const data = await response.json();
      setErrors(data.errors || []);
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchHealth();
    fetchErrors();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHealth();
        fetchErrors();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Debugger</h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring and error tracking
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium ${
                autoRefresh
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>
            <button
              onClick={() => {
                fetchHealth();
                fetchErrors();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.map((component) => (
              <div
                key={component.component}
                className="bg-white rounded-lg shadow p-6 border-l-4"
                style={{
                  borderLeftColor:
                    component.status === 'healthy'
                      ? '#10b981'
                      : component.status === 'degraded'
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {component.component.replace(/_/g, ' ')}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                      component.status
                    )}`}
                  >
                    {component.status}
                  </span>
                </div>
                {component.responseTime && (
                  <p className="text-sm text-gray-600 mb-1">
                    Response: {component.responseTime}ms
                  </p>
                )}
                {component.errorMessage && (
                  <p className="text-sm text-red-600 mt-2">
                    {component.errorMessage}
                  </p>
                )}
                {component.metrics && (
                  <div className="mt-2 text-xs text-gray-500">
                    {Object.entries(component.metrics).map(([key, value]) => (
                      <div key={key}>
                        {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Statistics */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Error Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.unresolved}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total > 0
                    ? ((stats.unresolved / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Log */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Error Log</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                All ({stats?.total || 0})
              </button>
              <button
                onClick={() => setFilter('unresolved')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'unresolved'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Unresolved ({stats?.unresolved || 0})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {errors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">✅ No errors found</p>
                <p className="text-sm mt-2">System is running smoothly</p>
              </div>
            ) : (
              <div className="divide-y">
                {errors.map((error) => (
                  <div
                    key={error.id}
                    className={`p-4 hover:bg-gray-50 ${
                      error.resolved ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(
                              error.level
                            )}`}
                          >
                            {error.level.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-700">
                            {error.category}
                          </span>
                          {error.endpoint && (
                            <span className="px-2 py-1 rounded bg-blue-100 text-xs font-medium text-blue-700">
                              {error.endpoint}
                            </span>
                          )}
                          {error.resolved && (
                            <span className="px-2 py-1 rounded bg-green-100 text-xs font-medium text-green-700">
                              ✓ Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {error.message}
                        </p>
                        {error.fixApplied && (
                          <p className="text-sm text-green-600 mt-2">
                            🔧 Fix applied: {error.fixApplied}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
