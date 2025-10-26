'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Fetch real analytics data
  const { data: stats } = trpc.analytics.getExecutionStats.useQuery({ days: parseInt(timeRange) });
  const { data: agentPerf } = trpc.analytics.getAgentPerformance.useQuery();
  const { data: workflowPerf } = trpc.analytics.getWorkflowPerformance.useQuery();

  // Generate mock trend data for now (can be replaced with real daily data later)
  const executionTrend = Array.from({ length: parseInt(timeRange) }, (_, i) => ({
    date: new Date(Date.now() - (parseInt(timeRange) - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    executions: Math.floor(Math.random() * 50) + 10,
  }));

  // Agent performance data
  const agentData = agentPerf || [];

  // Workflow performance data
  const workflowData = workflowPerf || [];

  // Status distribution
  const statusData = [
    { name: 'Completed', value: stats?.completed || 0, color: '#10b981' },
    { name: 'Failed', value: stats?.failed || 0, color: '#ef4444' },
    { name: 'Running', value: stats?.running || 0, color: '#3b82f6' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-2">Performance metrics and insights</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm font-medium">Total Executions</div>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+12%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm font-medium">Success Rate</div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-white">{(stats?.successRate || 0).toFixed(1)}%</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className="text-gray-500">{stats?.completed || 0} completed</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm font-medium">Avg Duration</div>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{((stats?.avgDurationMs || 0) / 1000).toFixed(1)}s</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className="text-gray-500">Per execution</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm font-medium">Total Cost</div>
            <DollarSign className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-3xl font-bold text-white">${(stats?.totalCostUsd || 0).toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className="text-gray-500">{stats?.totalTokens || 0} tokens</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Execution Trend */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Execution Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="executions" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Agent Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="agentName" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="executions" fill="#8b5cf6" />
            <Bar dataKey="successRate" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Workflow Performance */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Workflow Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workflowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="workflowName" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="executions" fill="#3b82f6" />
            <Bar dataKey="avgDuration" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

