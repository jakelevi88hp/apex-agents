'use client';

import { useEffect, useState } from 'react';
import { Bot, Workflow, Zap, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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

// Generate sample data for sparklines
const generateSparklineData = (trend: 'up' | 'down' | 'stable') => {
  const baseValue = 50;
  const data = [];
  
  for (let i = 0; i < 7; i++) {
    let value;
    if (trend === 'up') {
      value = baseValue + i * 5 + Math.random() * 10;
    } else if (trend === 'down') {
      value = baseValue - i * 3 + Math.random() * 10;
    } else {
      value = baseValue + Math.random() * 10 - 5;
    }
    data.push({ value });
  }
  
  return data;
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const agentsData = generateSparklineData('up');
  const workflowsData = generateSparklineData('up');
  const executionsData = generateSparklineData('up');

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
              {mounted ? <AnimatedCounter value={12} /> : '12'}
            </div>
            
            {/* Sparkline Chart */}
            <div className="h-12 mb-2 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={agentsData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+2 this week</span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: mounted ? '80%' : '0%' }}
              ></div>
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
              {mounted ? <AnimatedCounter value={8} /> : '8'}
            </div>
            
            {/* Sparkline Chart */}
            <div className="h-12 mb-2 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workflowsData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+1 this week</span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: mounted ? '65%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Executions Card */}
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
              {mounted ? <AnimatedCounter value={247} duration={1500} /> : '247'}
            </div>
            
            {/* Sparkline Chart */}
            <div className="h-12 mb-2 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={executionsData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+18% vs yesterday</span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: mounted ? '92%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity with Icons */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/50 px-4 rounded transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Research Agent completed task</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  2 minutes ago
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium">
              Completed
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/50 px-4 rounded transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <div className="relative">
                  <Workflow className="w-5 h-5 text-blue-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white">Workflow "Data Analysis" started</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  15 minutes ago
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Running
            </span>
          </div>

          <div className="flex justify-between items-center py-3 hover:bg-gray-700/50 px-4 rounded transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-white">New agent "Market Analyzer" created</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  1 hour ago
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm font-medium">
              Created
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

