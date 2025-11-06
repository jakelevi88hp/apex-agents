'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Copy,
  Settings as SettingsIcon,
  BarChart3,
  History,
  Save,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  DollarSign,
  TrendingUp,
  Edit2,
} from 'lucide-react';

type TabType = 'overview' | 'configuration' | 'history' | 'analytics';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const agentId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedConfig, setEditedConfig] = useState<any>(null);

  // Fetch agent data
  const { data: agent, isLoading, refetch } = trpc.agents.get.useQuery({ id: agentId });
  const { data: executions } = trpc.executions.getByAgent.useQuery({ agentId }, { enabled: !!agentId });
  const { data: analytics } = trpc.analytics.getAgentAnalytics.useQuery({ agentId }, { enabled: !!agentId });

  // Mutations
  const updateAgent = trpc.agents.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
      setEditedConfig(null);
    },
  });

  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/agents');
    },
  });

  const toggleStatus = trpc.agents.toggleStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const duplicateAgent = trpc.agents.duplicate.useMutation({
    onSuccess: (newAgent) => {
      router.push(`/dashboard/agents/${newAgent.id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Agent not found
        </h2>
        <button
          onClick={() => router.push('/dashboard/agents')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Agents
        </button>
      </div>
    );
  }

  const agentConfig = agent.config as any;

  const handleSaveConfig = () => {
    updateAgent.mutate({
      id: agentId,
      config: editedConfig,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      deleteAgent.mutate({ id: agentId });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'configuration', label: 'Configuration', icon: SettingsIcon },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/agents')}
          className={`flex items-center gap-2 mb-4 ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {agent.name}
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {agent.description}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  agent.status === 'active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}
              >
                {agent.status}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Type: {agent.type}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggleStatus.mutate({ id: agentId })}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                agent.status === 'active'
                  ? isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {agent.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4 inline mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 inline mr-2" />
                  Activate
                </>
              )}
            </button>
            <button
              onClick={() => duplicateAgent.mutate({ id: agentId })}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <Copy className="w-4 h-4 inline mr-2" />
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-500'
                    : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Executions
                  </span>
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {executions?.length || 0}
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Success Rate
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.successRate?.toFixed(1) || 0}%
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg Duration
                  </span>
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.avgDuration ? `${(analytics.avgDuration / 1000).toFixed(1)}s` : '0s'}
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Cost
                  </span>
                  <DollarSign className="w-4 h-4 text-cyan-500" />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics?.totalCost?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Agent Info */}
            <div
              className={`p-6 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Agent Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Model
                  </span>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {agentConfig?.model || 'gpt-4-turbo'}
                  </p>
                </div>
                <div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Temperature
                  </span>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {agentConfig?.temperature || 0.7}
                  </p>
                </div>
                <div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Max Tokens
                  </span>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {agentConfig?.maxTokens || 2000}
                  </p>
                </div>
                <div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Created
                  </span>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            {agentConfig?.capabilities && (
              <div
                className={`p-6 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agentConfig.capabilities.map((cap: string) => (
                    <span
                      key={cap}
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30"
                    >
                      {cap.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'configuration' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Agent Configuration
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditedConfig(agentConfig);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4 inline mr-2" />
                  Edit Configuration
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedConfig(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div
              className={`p-6 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Model
                  </label>
                  {isEditing ? (
                    <select
                      value={editedConfig?.model || 'gpt-4-turbo'}
                      onChange={(e) => setEditedConfig({ ...editedConfig, model: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    </select>
                  ) : (
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {agentConfig?.model || 'gpt-4-turbo'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Temperature ({isEditing ? editedConfig?.temperature || 0.7 : agentConfig?.temperature || 0.7})
                  </label>
                  {isEditing ? (
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={editedConfig?.temperature || 0.7}
                      onChange={(e) => setEditedConfig({ ...editedConfig, temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  ) : (
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {agentConfig?.temperature || 0.7}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Tokens
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedConfig?.maxTokens || 2000}
                      onChange={(e) => setEditedConfig({ ...editedConfig, maxTokens: parseInt(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {agentConfig?.maxTokens || 2000}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    System Prompt
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedConfig?.systemPrompt || agent.description}
                      onChange={(e) => setEditedConfig({ ...editedConfig, systemPrompt: e.target.value })}
                      rows={6}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`font-medium whitespace-pre-wrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {agentConfig?.systemPrompt || agent.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Execution History
            </h3>
            {executions && executions.length > 0 ? (
              <div className="space-y-3">
                {executions.map((execution: any) => (
                  <div
                    key={execution.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {execution.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : execution.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        )}
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {execution.status}
                        </span>
                      </div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(execution.startedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Duration: {execution.durationMs ? `${(execution.durationMs / 1000).toFixed(2)}s` : 'N/A'}
                      </span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Tokens: {execution.tokensUsed || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No execution history yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`p-6 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Success Rate Trend
                </h4>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-3xl font-bold text-green-500">
                    {analytics?.successRate?.toFixed(1) || 0}%
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overall success rate
                  </p>
                </div>
              </div>

              <div
                className={`p-6 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cost Analysis
                </h4>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-cyan-500" />
                  <p className="text-3xl font-bold text-cyan-500">
                    ${analytics?.totalCost?.toFixed(2) || '0.00'}
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total cost to date
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
