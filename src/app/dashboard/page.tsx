'use client';

import { useEffect, useState } from 'react';
import { Bot, Workflow, Zap, TrendingUp, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { trpc } from '@/lib/trpc/client';
import VoiceCommandPanel from '@/components/VoiceCommandPanel';
import { UserSuggestionsPanel } from '@/components/dashboard/UserSuggestions';

/**
 * Animate numbers from 0 to a target value so dashboard cards feel alive.
 * @param value Target number to display.
 * @param duration Milliseconds the animation should take.
 * @returns JSX element showing the animated count.
 */
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0); // Track the current animated value

  useEffect(() => {
    let startTime: number; // Store when the animation begins
    let animationFrame: number; // Store the current frame id for cleanup

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp; // Initialize the start time on first frame
      const progress = Math.min((timestamp - startTime) / duration, 1); // Normalize progress between 0 and 1

      setCount(Math.floor(progress * value)); // Update the counter based on progress

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate); // Continue animating until target reached
      }
    };

    animationFrame = requestAnimationFrame(animate); // Kick off the animation loop
    return () => cancelAnimationFrame(animationFrame); // Prevent leaked frames on unmount
  }, [value, duration]);

  return <span>{count}</span>;
}

/**
 * Render the main dashboard with hero messaging, metric cards, activity feed, and suggestions.
 * @returns Dashboard page layout with live data bindings.
 */
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false); // Track mount to avoid hydration mismatches

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true)); // Defer flag flip until after paint
    return () => cancelAnimationFrame(frameId); // Ensure timer stops if component unmounts early
  }, []);

  const { data: metrics, isLoading: metricsLoading } = trpc.analytics.getDashboardMetrics.useQuery(); // Pull summary metrics
  const { data: agentsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'agents' }); // Fetch agent trend line
  const { data: workflowsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'workflows' }); // Fetch workflow trend line
  const { data: executionsSparkline } = trpc.analytics.getSparklineData.useQuery({ metric: 'executions' }); // Fetch execution trend line
  const { data: recentActivity } = trpc.analytics.getRecentActivity.useQuery({ limit: 5 }); // Fetch latest activities

  const agentsData = agentsSparkline?.map((value) => ({ value })) || []; // Normalize agent sparkline data for recharts
  const workflowsData = workflowsSparkline?.map((value) => ({ value })) || []; // Normalize workflow sparkline data
  const executionsData = executionsSparkline?.map((value) => ({ value })) || []; // Normalize execution sparkline data

  const agentsProgress = metrics ? Math.min((metrics.activeAgents / 15) * 100, 100) : 0; // Limit agent progress bar to 100%
  const workflowsProgress = metrics ? Math.min((metrics.workflows / 12) * 100, 100) : 0; // Limit workflow progress bar to 100%
  const executionsProgress = metrics ? Math.min((metrics.executionsToday / 300) * 100, 100) : 0; // Limit execution progress bar to 100%

  if (metricsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse" />
        <div className="relative z-10">
          <h1 className="mb-2 text-4xl font-bold text-white">Welcome to Apex Agents</h1>
          <p className="text-gray-300">Manage your AI agents, workflows, and knowledge base</p>
        </div>
      </div>

      <VoiceCommandPanel /> {/* Allow users to issue commands by voice */}

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-purple-500/10 group-hover:to-transparent" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300">Active Agents</div>
              <div className="rounded-lg bg-purple-500/20 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/30">
                <Bot className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div className="mb-2 text-4xl font-bold text-white">
              {mounted && metrics ? <AnimatedCounter value={metrics.activeAgents} /> : metrics?.activeAgents || 0}
            </div>
            <div className="mb-2 -mx-2 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={agentsData}>
                  <Line type="monotone" dataKey="value" stroke="#A855F7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out" style={{ width: `${agentsProgress}%` }} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span>7-day trend</span>
            </div>
          </div>
        </div>

        <div className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 transition-all duration-300 group-hover:from-blue-500/10 group-hover:to-transparent" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300">Workflows</div>
              <div className="rounded-lg bg-blue-500/20 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/30">
                <Workflow className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div className="mb-2 text-4xl font-bold text-white">
              {mounted && metrics ? <AnimatedCounter value={metrics.workflows} /> : metrics?.workflows || 0}
            </div>
            <div className="mb-2 -mx-2 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workflowsData}>
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out" style={{ width: `${workflowsProgress}%` }} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span>7-day trend</span>
            </div>
          </div>
        </div>

        <div className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 transition-all duration-300 group-hover:from-cyan-500/10 group-hover:to-transparent" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300">Executions Today</div>
              <div className="rounded-lg bg-cyan-500/20 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/30">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="mb-2 text-4xl font-bold text-white">
              {mounted && metrics ? <AnimatedCounter value={metrics.executionsToday} /> : metrics?.executionsToday || 0}
            </div>
            <div className="mb-2 -mx-2 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={executionsData}>
                  <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000 ease-out" style={{ width: `${executionsProgress}%` }} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span>
                {metrics?.executionsTrend.direction === 'up' ? '+' : ''}
                {metrics?.executionsTrend.change.toFixed(1)}% vs yesterday
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-lg border border-gray-600 bg-gray-700/50 p-4 transition-colors hover:border-purple-500/50">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${activity.status === 'completed' ? 'bg-green-500/20' : activity.status === 'running' ? 'bg-blue-500/20' : 'bg-red-500/20'}`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : activity.status === 'running' ? (
                      <Clock className="h-5 w-5 animate-pulse text-blue-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{activity.name}</div>
                    <div className="text-sm text-gray-400">
                      {activity.type} • {activity.status}
                      {activity.durationMs && ` • ${(activity.durationMs / 1000).toFixed(1)}s`}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">{new Date(activity.startedAt).toLocaleTimeString()}</div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400">
              <Clock className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No recent activity</p>
              <p className="mt-1 text-sm">Execute workflows or agents to see activity here</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <UserSuggestionsPanel /> {/* Surface data-driven suggestions to help admins act quickly */}
      </div>
    </div>
  );
}
