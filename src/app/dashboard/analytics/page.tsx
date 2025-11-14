'use client';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, DollarSign, Clock, CheckCircle, Bot, Workflow, Zap, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const { isDarkMode } = useTheme();
  
  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = trpc.analytics.getDashboardMetrics.useQuery();
  const { data: agentsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'agents' });
  const { data: workflowsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'workflows' });
  const { data: executionsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'executions' });
  const { data: recentActivity } = trpc.analytics.getRecentActivity.useQuery({ limit: 5 });

  // Fetch analytics data
  const { data: stats } = trpc.analytics.getExecutionStats.useQuery({ days: parseInt(timeRange) });
  const { data: agentPerf } = trpc.analytics.getAgentPerformance.useQuery();
  const { data: workflowPerf } = trpc.analytics.getWorkflowPerformance.useQuery();
  const { data: executionTrend } = trpc.analytics.getExecutionTrend.useQuery({ days: parseInt(timeRange) });

  // Transform sparkline data for charts
  const agentsData = agentsSparkline?.map(value => ({ value })) || [];
  const workflowsData = workflowsSparkline?.map(value => ({ value })) || [];
  const executionsData = executionsSparkline?.map(value => ({ value })) || [];

  // Calculate progress percentages
  const agentsProgress = metrics ? Math.min((metrics.activeAgents / 15) * 100, 100) : 0;
  const workflowsProgress = metrics ? Math.min((metrics.workflows / 12) * 100, 100) : 0;
  const executionsProgress = metrics ? Math.min((metrics.executionsToday / 300) * 100, 100) : 0;

  // Agent performance data
  const agentData = agentPerf || [];

  // Workflow performance data
  const workflowData = workflowPerf || [];

  // Status distribution
  type StatusSegment = {
    name: string;
    value: number;
    color: string;
  };

  const statusData: StatusSegment[] = [
    { name: 'Completed', value: stats?.completed || 0, color: '#10b981' },
    { name: 'Failed', value: stats?.failed || 0, color: '#ef4444' },
    { name: 'Running', value: stats?.running || 0, color: '#3b82f6' },
  ];

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics & Overview</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Performance metrics, insights, and system overview</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Overview Metrics with Sparklines */}
      <div className="mb-8">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>System Overview</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Active Agents Card */}
          <div className={`group p-6 rounded-lg shadow-lg border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500/50 hover:shadow-purple-500/20' 
              : 'bg-white border-gray-200 hover:border-purple-500/50 hover:shadow-purple-500/20'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Agents</div>
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
                    <Bot className="w-5 h-5 text-purple-400" />
                  </div>
                </div>

                <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {metrics ? <AnimatedCounter value={metrics.activeAgents} /> : 0}
                </div>

                {/* Sparkline Chart */}
                <div className="h-12 mb-2 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={agentsData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#A855F7" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Progress Bar */}
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${agentsProgress}%` }}
                  ></div>
                </div>
                
                <div className={`flex items-center gap-2 mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>7-day trend</span>
                </div>
              </div>
            </div>

          {/* Workflows Card */}
          <div className={`group p-6 rounded-lg shadow-lg border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:shadow-blue-500/20' 
              : 'bg-white border-gray-200 hover:border-blue-500/50 hover:shadow-blue-500/20'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-transparent transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Workflows</div>
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-300">
                    <Workflow className="w-5 h-5 text-blue-400" />
                  </div>
                </div>

                <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {metrics ? <AnimatedCounter value={metrics.workflows} /> : 0}
                </div>

                {/* Sparkline Chart */}
                <div className="h-12 mb-2 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={workflowsData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Progress Bar */}
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${workflowsProgress}%` }}
                  ></div>
                </div>
                
                <div className={`flex items-center gap-2 mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>7-day trend</span>
                </div>
              </div>
            </div>

          {/* Executions Today Card */}
          <div className={`group p-6 rounded-lg shadow-lg border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:border-cyan-500/50 hover:shadow-cyan-500/20' 
              : 'bg-white border-gray-200 hover:border-cyan-500/50 hover:shadow-cyan-500/20'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-transparent transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Executions Today</div>
                  <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all duration-300">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>

                <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {metrics ? <AnimatedCounter value={metrics.executionsToday} /> : 0}
                </div>

                {/* Sparkline Chart */}
                <div className="h-12 mb-2 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={executionsData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#06B6D4" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Progress Bar */}
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${executionsProgress}%` }}
                  ></div>
                </div>
                
                <div className={`flex items-center gap-2 mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>
                    {metrics?.executionsTrend.direction === 'up' ? '+' : ''}
                    {metrics?.executionsTrend.change.toFixed(1)}% vs yesterday
                  </span>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-lg shadow-lg border p-6 mb-8 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 hover:border-purple-500/50'
                    : 'bg-gray-50 border-gray-200 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'completed' 
                      ? 'bg-green-500/20' 
                      : activity.status === 'running'
                      ? 'bg-blue-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : activity.status === 'running' ? (
                      <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                    ) : (
                      <Clock className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.name}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {activity.type} • {activity.status}
                      {activity.durationMs && ` • ${(activity.durationMs / 1000).toFixed(1)}s`}
                    </div>
                  </div>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(activity.startedAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Execute workflows or agents to see activity here</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analytics Section */}
      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 mt-12`}>Detailed Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Executions</div>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats?.total || 0}</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+12%</span>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>vs last period</span>
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{(stats?.successRate || 0).toFixed(1)}%</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>{stats?.completed || 0} completed</span>
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Duration</div>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{((stats?.avgDurationMs || 0) / 1000).toFixed(1)}s</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Per execution</span>
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Cost</div>
            <DollarSign className="w-5 h-5 text-cyan-500" />
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${(stats?.totalCostUsd || 0).toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>{stats?.totalTokens || 0} tokens</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Execution Trend */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Execution Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="date" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
              />
              <Legend />
              <Line type="monotone" dataKey="executions" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: { name?: string; percent?: number; value?: number }) => 
                    `${props.name || ''} ${props.percent ? (props.percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
                  borderRadius: '8px' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance */}
      <div className={`p-6 rounded-lg border mb-8 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Agent Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
              />
              <Legend />
              <Bar dataKey="executionCount" name="Executions" fill="#8b5cf6" />
              <Bar dataKey="successRate" name="Success Rate (%)" fill="#10b981" />
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Workflow Performance */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Workflow Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workflowData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: isDarkMode ? '#fff' : '#000' }}
              />
              <Legend />
              <Bar dataKey="executionCount" name="Executions" fill="#3b82f6" />
              <Bar dataKey="avgDurationMs" name="Avg Duration (ms)" fill="#06b6d4" />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
