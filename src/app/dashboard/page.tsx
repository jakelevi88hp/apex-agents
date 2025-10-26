'use client';

import { useEffect, useState } from 'react';
import { Bot, Workflow, Zap, TrendingUp, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { trpc } from '@/lib/trpc/client';

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real metrics from database
  const { data: metrics, isLoading: metricsLoading } = trpc.analytics.getDashboardMetrics.useQuery();
  const { data: agentsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'agents' });
  const { data: workflowsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'workflows' });
  const { data: executionsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'executions' });
  const { data: recentActivity } = trpc.analytics.getRecentActivity.useQuery({ limit: 5 });

  // Transform sparkline data for charts
  const agentsData = agentsSparkline?.map(value => ({ value })) || [];
  const workflowsData = workflowsSparkline?.map(value => ({ value })) || [];
  const executionsData = executionsSparkline?.map(value => ({ value })) || [];

  // Calculate progress percentages
  const agentsProgress = metrics ? Math.min((metrics.activeAgents / 15) * 100, 100) : 0;
  const workflowsProgress = metrics ? Math.min((metrics.workflows / 12) * 100, 100) : 0;
  const executionsProgress = metrics ? Math.min((metrics.executionsToday / 300) * 100, 100) : 0;

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section with Gradient */}
      <div className="mb-8 p-8 rounded-lg bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Apex Agents</h1>
          <p className="text-gray-300">Manage your AI agents, workflows, and knowledge base</p>
        </div>
      </div>
      
      {/* Metric Cards with Sparklines and Animations */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Active Agents Card */}
        <div className="group bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500/50 hover:shadow-purple-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-300 text-sm font-medium">Active Agents</div>
              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              {mounted && metrics ? <AnimatedCounter value={metrics.activeAgents} /> : metrics?.activeAgents || 0}
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
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${agentsProgress}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>7-day trend</span>
            </div>
          </div>
        </div>

        {/* Workflows Card */}
        <div className="group bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500/50 hover:shadow-blue-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-transparent transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-300 text-sm font-medium">Workflows</div>
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-300">
                <Workflow className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              {mounted && metrics ? <AnimatedCounter value={metrics.workflows} /> : metrics?.workflows || 0}
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
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${workflowsProgress}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>7-day trend</span>
            </div>
          </div>
        </div>

        {/* Executions Today Card */}
        <div className="group bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-transparent transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-300 text-sm font-medium">Executions Today</div>
              <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all duration-300">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              {mounted && metrics ? <AnimatedCounter value={metrics.executionsToday} /> : metrics?.executionsToday || 0}
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
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${executionsProgress}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>
                {metrics?.executionsTrend.direction === 'up' ? '+' : ''}
                {metrics?.executionsTrend.change.toFixed(1)}% vs yesterday
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors"
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
                    <div className="text-white font-medium">{activity.name}</div>
                    <div className="text-sm text-gray-400">
                      {activity.type} • {activity.status}
                      {activity.durationMs && ` • ${(activity.durationMs / 1000).toFixed(1)}s`}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(activity.startedAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Execute workflows or agents to see activity here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

