'use client';

import { Bot, Workflow, Zap, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      {/* Hero Section with Gradient */}
      <div className="mb-8 p-8 rounded-lg bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to Apex Agents</h1>
        <p className="text-gray-300">Manage your AI agents, workflows, and knowledge base</p>
      </div>
      
      {/* Metric Cards with Hover Effects and Icons */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Active Agents Card */}
        <div className="group bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500/50 hover:shadow-purple-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300 text-sm font-medium">Active Agents</div>
            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">12</div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+2 this week</span>
          </div>
        </div>

        {/* Workflows Card */}
        <div className="group bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500/50 hover:shadow-blue-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300 text-sm font-medium">Workflows</div>
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Workflow className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">8</div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+1 this week</span>
          </div>
        </div>

        {/* Executions Card */}
        <div className="group bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300 text-sm font-medium">Executions Today</div>
            <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">247</div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+18% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Recent Activity with Icons */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/50 px-4 rounded transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
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
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700 hover:bg-gray-700/50 px-4 rounded transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
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

          <div className="flex justify-between items-center py-3 hover:bg-gray-700/50 px-4 rounded transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
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

