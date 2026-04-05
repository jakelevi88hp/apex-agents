'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useErrorStore } from '@/lib/stores/errorStore';
import { createAppError, ErrorType } from '@/lib/errorHandler';
import type { agents } from '@/lib/db/schema';
import { 
  Search, BarChart3, PenTool, Code2, Target, Mail, 
  TrendingUp, Network, Plus, X, Loader2, Play, Settings, Send,
  Headphones, Users, CalendarCheck, ChevronRight, Zap, CheckCircle, Clock, Star
} from 'lucide-react';
import AgentWizard from '@/components/agent-wizard/AgentWizard';
import HelpTooltip from '@/components/ui/HelpTooltip';
import GlossaryBadge from '@/components/ui/GlossaryBadge';

type Agent = typeof agents.$inferSelect;
import AgentCardSkeleton from '@/components/AgentCardSkeleton';
import EmptyState from '@/components/EmptyState';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useRef } from 'react';

const agentTypes = [
  { 
    id: 'research', 
    name: 'Research Agent', 
    icon: Search, 
    description: 'Gather and analyze information from multiple sources',
    gradient: 'from-blue-500 to-cyan-500',
    badge: null,
  },
  { 
    id: 'analysis', 
    name: 'Analysis Agent', 
    icon: BarChart3, 
    description: 'Analyze data and identify patterns and insights',
    gradient: 'from-purple-500 to-pink-500',
    badge: null,
  },
  { 
    id: 'writing', 
    name: 'Writing Agent', 
    icon: PenTool, 
    description: 'Generate high-quality content and documentation',
    gradient: 'from-green-500 to-emerald-500',
    badge: '⭐ Best for beginners',
  },
  { 
    id: 'code', 
    name: 'Code Agent', 
    icon: Code2, 
    description: 'Write, debug, and refactor code',
    gradient: 'from-orange-500 to-red-500',
    badge: null,
  },
  { 
    id: 'decision', 
    name: 'Decision Agent', 
    icon: Target, 
    description: 'Make strategic decisions based on criteria',
    gradient: 'from-yellow-500 to-orange-500',
    badge: null,
  },
  { 
    id: 'communication', 
    name: 'Communication Agent', 
    icon: Mail, 
    description: 'Handle customer queries, emails and messaging',
    gradient: 'from-indigo-500 to-purple-500',
    badge: '⭐ Best for beginners',
  },
  { 
    id: 'monitoring', 
    name: 'Monitoring Agent', 
    icon: TrendingUp, 
    description: 'Monitor systems and alert on anomalies',
    gradient: 'from-teal-500 to-cyan-500',
    badge: null,
  },
  { 
    id: 'orchestrator', 
    name: 'Orchestrator Agent', 
    icon: Network, 
    description: 'Coordinate multiple agents for complex tasks',
    gradient: 'from-pink-500 to-rose-500',
    badge: '🔧 Advanced',
  },
];

const defaultCapabilities = {
  research: ['web_search', 'data_extraction', 'source_verification'],
  analysis: ['data_processing', 'pattern_recognition', 'statistical_analysis'],
  writing: ['content_generation', 'editing', 'formatting'],
  code: ['code_generation', 'debugging', 'refactoring', 'testing'],
  decision: ['criteria_evaluation', 'risk_assessment', 'recommendation'],
  communication: ['email', 'messaging', 'notification'],
  monitoring: ['system_monitoring', 'alerting', 'logging'],
  orchestrator: ['task_coordination', 'agent_management', 'workflow_execution'],
};

const defaultConfig = {
  research: { model: 'gpt-4-turbo', tools: ['web_browser', 'calculator'] },
  analysis: { model: 'gpt-4-turbo', tools: ['python', 'data_visualizer'] },
  writing: { model: 'gpt-4-turbo', tools: ['grammar_checker', 'style_guide'] },
  code: { model: 'gpt-4-turbo', tools: ['code_interpreter', 'debugger'] },
  decision: { model: 'gpt-4-turbo', tools: ['decision_matrix', 'risk_analyzer'] },
  communication: { model: 'gpt-4-turbo', tools: ['email_client', 'slack'] },
  monitoring: { model: 'gpt-4-turbo', tools: ['system_monitor', 'log_analyzer'] },
  orchestrator: { model: 'gpt-4-turbo', tools: ['task_planner', 'agent_coordinator'] },
};

const STARTER_TEMPLATES = [
  {
    id: 'customer_support',
    name: 'Customer Support Bot',
    agentType: 'communication' as const,
    description: 'Handle customer queries, FAQs, and support tickets automatically',
    icon: Headphones,
    gradient: 'from-blue-500 to-cyan-500',
    blurb: 'Answer FAQs and handle customer queries 24/7',
  },
  {
    id: 'lead_qualifier',
    name: 'Lead Qualifier',
    agentType: 'decision' as const,
    description: 'Score and qualify inbound leads based on your criteria automatically',
    icon: Users,
    gradient: 'from-green-500 to-emerald-500',
    blurb: 'Score and qualify inbound leads automatically',
  },
  {
    id: 'content_writer',
    name: 'Content Writer',
    agentType: 'writing' as const,
    description: 'Generate blog posts, emails, social media copy, and marketing content',
    icon: PenTool,
    gradient: 'from-purple-500 to-pink-500',
    blurb: 'Generate blog posts, emails, and marketing copy',
  },
  {
    id: 'meeting_summarizer',
    name: 'Meeting Summarizer',
    agentType: 'analysis' as const,
    description: 'Turn meeting notes into summaries, action items, and follow-ups',
    icon: CalendarCheck,
    gradient: 'from-yellow-500 to-orange-500',
    blurb: 'Turn meeting notes into action items and summaries',
  },
  {
    id: 'email_responder',
    name: 'Email Responder',
    agentType: 'communication' as const,
    description: 'Draft contextual, professional email replies based on context',
    icon: Mail,
    gradient: 'from-indigo-500 to-purple-500',
    blurb: 'Draft and send contextual email replies',
  },
] as const;

type StarterTemplate = (typeof STARTER_TEMPLATES)[number];



export default function AgentsPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addError } = useErrorStore();
  
  // State declarations
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'research' as keyof typeof defaultCapabilities,
    description: '',
  });
  const [executeData, setExecuteData] = useState({
    objective: '',
    context: {},
  });
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [justCreatedAgent, setJustCreatedAgent] = useState<string | null>(null);
  const [executionElapsed, setExecutionElapsed] = useState(0);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'executions'>('created');
  
  // Bulk operations state
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // Fetch user's created agents
  const { data: userAgents, isLoading: agentsLoading, refetch } = trpc.agents.list.useQuery();

  // Execution timer — counts up while agent is running
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (executeAgentMutation?.isPending) {
      setExecutionElapsed(0);
      interval = setInterval(() => setExecutionElapsed((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [executeAgentMutation?.isPending]);

  // Create agent mutation
  const createAgentMutation = trpc.agents.create.useMutation({
    onSuccess: (data: any) => {
      setShowCreateModal(false);
      const createdName = formData.name;
      setFormData({ name: '', type: 'research', description: '' });
      setJustCreatedAgent(createdName);
      setTimeout(() => setJustCreatedAgent(null), 8000);
      refetch();
    },
    onError: (error) => {
      const appError = createAppError(
        ErrorType.CLIENT_ERROR,
        `Failed to create agent: ${error.message}`,
        {
          originalError: new Error(error.message),
          context: { operation: 'create', agentType: formData.type },
          recoverable: true,
          retryable: true,
        }
      );
      addError(appError);
    },
  });

  // Execute agent mutation
  const executeAgentMutation = trpc.agents.execute.useMutation({
    onSuccess: (data) => {
      setExecutionResult(data);
    },
    onError: (error) => {
      const appError = createAppError(
        ErrorType.CLIENT_ERROR,
        `Failed to execute agent: ${error.message}`,
        {
          originalError: new Error(error.message),
          context: { operation: 'execute', agentId: selectedAgent?.id },
          recoverable: true,
          retryable: true,
        }
      );
      addError(appError);
    },
  });

  // Bulk operations mutations
  const bulkDeleteMutation = trpc.agents.bulkDelete.useMutation({
    onSuccess: (data) => {
      refetch();
      const appError = createAppError(
        ErrorType.CLIENT_ERROR,
        `Successfully deleted ${data.count} agent(s)${data.failed ? `. Failed: ${data.failed}` : ''}`,
        {
          context: { operation: 'bulkDelete', count: data.count, failed: data.failed },
          recoverable: true,
          retryable: false,
        }
      );
      addError(appError);
    },
    onError: (error) => {
      const appError = createAppError(
        ErrorType.CLIENT_ERROR,
        `Failed to delete agents: ${error.message}`,
        {
          originalError: new Error(error.message),
          context: { operation: 'bulkDelete', count: selectedAgents.size },
          recoverable: true,
          retryable: true,
        }
      );
      addError(appError);
    },
  });

  const bulkUpdateStatusMutation = trpc.agents.bulkUpdateStatus.useMutation({
    onSuccess: (data) => {
      refetch();
      const appError = createAppError(
        ErrorType.CLIENT_ERROR,
        `Successfully updated ${data.count} agent(s)${data.failed ? `. Failed: ${data.failed}` : ''}`,
        {
          context: { operation: 'bulkUpdateStatus', count: data.count, failed: data.failed },
          recoverable: true,
          retryable: false,
        }
      );
      addError(appError);
    },
    onError: (error) => {
      const appError = createAppError(
        ErrorType.CLIENT_ERROR,
        `Failed to update agents: ${error.message}`,
        {
          originalError: new Error(error.message),
          context: { operation: 'bulkUpdateStatus', count: selectedAgents.size },
          recoverable: true,
          retryable: true,
        }
      );
      addError(appError);
    },
  });

  const handleCreateAgent = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({ ...formData, type: typeId as keyof typeof defaultCapabilities });
    setShowCreateModal(true);
  };

  const handleExecuteAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setExecuteData({ objective: '', context: {} });
    setExecutionResult(null);
    setShowExecuteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      const validationError = createAppError(
        ErrorType.VALIDATION_ERROR,
        'Agent name is required',
        {
          context: { field: 'name' },
          recoverable: true,
          retryable: false,
        }
      );
      addError(validationError);
      return;
    }
    
    createAgentMutation.mutate({
      name: formData.name,
      type: formData.type,
      description: formData.description,
      config: defaultConfig[formData.type],
      capabilities: defaultCapabilities[formData.type],
    });
  };

  const handleExecuteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!executeData.objective.trim()) {
      const validationError = createAppError(
        ErrorType.VALIDATION_ERROR,
        'Objective is required to execute an agent',
        {
          context: { field: 'objective' },
          recoverable: true,
          retryable: false,
        }
      );
      addError(validationError);
      return;
    }
    
    executeAgentMutation.mutate({
      agentId: selectedAgent.id,
      objective: executeData.objective,
      context: executeData.context,
    });
  };

  const selectedAgentType = agentTypes.find(t => t.id === formData.type);

  // Bulk operations handlers
  const toggleAgentSelection = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
  };

  const selectAllFiltered = () => {
    const allIds = new Set(filteredAgents.map((a) => a.id));
    setSelectedAgents(allIds);
  };

  const clearSelection = () => {
    setSelectedAgents(new Set());
    setBulkActionMode(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedAgents.size} agent(s)? This cannot be undone.`)) return;
    
    await bulkDeleteMutation.mutateAsync({ ids: Array.from(selectedAgents) });
    clearSelection();
  };

  const handleBulkPause = async () => {
    await bulkUpdateStatusMutation.mutateAsync({ 
      ids: Array.from(selectedAgents), 
      status: 'inactive' 
    });
    clearSelection();
  };

  const handleBulkActivate = async () => {
    await bulkUpdateStatusMutation.mutateAsync({ 
      ids: Array.from(selectedAgents), 
      status: 'active' 
    });
    clearSelection();
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      meta: true,
      callback: () => setShowWizard(true),
      description: 'Create new agent',
    },
    {
      key: 'k',
      meta: true,
      callback: () => searchInputRef.current?.focus(),
      description: 'Focus search',
    },
    {
      key: 'b',
      meta: true,
      callback: () => setBulkActionMode(!bulkActionMode),
      description: 'Toggle bulk select',
    },
    {
      key: 'Escape',
      callback: () => {
        if (bulkActionMode) clearSelection();
        if (showWizard) setShowWizard(false);
        if (showExecuteModal) setShowExecuteModal(false);
      },
      description: 'Cancel/Close',
    },
  ]);


  // Handle onboarding pending — auto-fill form if wizard selected a use case
  useEffect(() => {
    try {
      const pending = localStorage.getItem('apex_onboarding_pending');
      if (pending) {
        const { name, type, description } = JSON.parse(pending);
        localStorage.removeItem('apex_onboarding_pending');
        setFormData({ name, type, description });
        setSelectedType(type);
        setShowCreateModal(true);
      }
    } catch { /* ignore */ }
  }, []);

  const handleUseTemplate = (template: StarterTemplate) => {
    setFormData({
      name: template.name,
      type: template.agentType,
      description: template.description,
    });
    setSelectedType(template.agentType);
    setShowCreateModal(true);
  };

  // Filter and sort agents
  const filteredAgents = userAgents?.filter((agent: Agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a: Agent, b: Agent) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0; // executions sort would need execution count data
  }) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Agents</h1>
          {userAgents && userAgents.length > 0 && (
            <button
              onClick={() => setBulkActionMode(!bulkActionMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                bulkActionMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {bulkActionMode ? 'Cancel Selection' : 'Select Multiple'}
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {bulkActionMode && selectedAgents.size > 0 && (
        <div className="mb-6 bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                {selectedAgents.size} agent{selectedAgents.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAllFiltered}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Select all {filteredAgents.length}
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Clear selection
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkActivate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Activate
              </button>
              <button
                onClick={handleBulkPause}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                Pause
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {userAgents && userAgents.length > 0 && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search agents... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="all">All Types</option>
                {agentTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-gray-400">Sort by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sortBy === 'name'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('created')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sortBy === 'created'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Created
              </button>
            </div>
            <span className="text-sm text-gray-400 ml-auto">
              {filteredAgents.length} of {userAgents.length} agents
            </span>
          </div>
        </div>
      )}

      {/* Post-create success banner */}
      {justCreatedAgent && (
        <div className="mb-6 flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">
                ✅ <strong>{justCreatedAgent}</strong> was created!
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Ready to run. Click <strong>Execute</strong> on the card below to give it a task.</p>
            </div>
          </div>
          <button onClick={() => setJustCreatedAgent(null)} className="text-gray-500 hover:text-gray-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {agentsLoading && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Agents</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!agentsLoading && (!userAgents || userAgents.length === 0) && (
        <EmptyState
          icon={Network}
          title="No agents yet"
          description="Create your first AI agent to automate tasks, analyze data, or assist with research. Get started with our templates or build from scratch."
          actionLabel="Create Your First Agent"
          onAction={() => setShowWizard(true)}
        />
      )}

      {/* User's Created Agents */}
      {!agentsLoading && userAgents && userAgents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Agents</h2>
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No agents match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => {
              const agentType = agentTypes.find(t => t.id === agent.type);
              const IconComponent = agentType?.icon || Search;
              
              return (
                <div
                  key={agent.id}
                  className={`group bg-gray-800 p-6 rounded-lg shadow-lg border-2 transition-all duration-300 ${
                    selectedAgents.has(agent.id)
                      ? 'border-purple-500 shadow-purple-500/50 shadow-2xl'
                      : 'border-purple-500/30 hover:border-purple-500 hover:shadow-purple-500/30 hover:shadow-2xl hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    {bulkActionMode && (
                      <input
                        type="checkbox"
                        checked={selectedAgents.has(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id)}
                        className="mr-3 mt-1 w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${agentType?.gradient || 'from-purple-500 to-blue-500'} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs font-medium">
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{agent.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{agent.description}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleExecuteAgent(agent)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Execute
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/agents/${agent.id}`);
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 hover:scale-105 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Starter Templates — shown when user has no agents */}
      {!agentsLoading && (!userAgents || userAgents.length === 0) && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Start with a Template</h2>
              <p className="text-gray-400 text-sm">Pre-configured agents ready in seconds</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  className="group bg-gray-800 border border-gray-700 hover:border-purple-500/60 rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${template.gradient} mb-4`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-snug">{template.blurb}</p>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 text-purple-300 hover:text-white border border-purple-500/40 hover:border-transparent rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Use Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Starter Templates — shown when user has no agents */}
      {!agentsLoading && (!userAgents || userAgents.length === 0) && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Start with a Template</h2>
              <p className="text-gray-400 text-sm">Pre-configured agents ready in seconds</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  className="group bg-gray-800 border border-gray-700 hover:border-purple-500/60 rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${template.gradient} mb-4`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-snug">{template.blurb}</p>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 text-purple-300 hover:text-white border border-purple-500/40 hover:border-transparent rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Use Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Starter Templates — shown when user has no agents */}
      {!agentsLoading && (!userAgents || userAgents.length === 0) && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Start with a Template</h2>
              <p className="text-gray-400 text-sm">Pre-configured agents ready in seconds</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  className="group bg-gray-800 border border-gray-700 hover:border-purple-500/60 rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${template.gradient} mb-4`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-snug">{template.blurb}</p>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 hover:border-transparent rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Use Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent Templates */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Agent Templates</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agentTypes.map((agent) => {
            const IconComponent = agent.icon;
            
            return (
              <div
                key={agent.id}
                className="group bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-transparent hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => handleCreateAgent(agent.id)}
              >
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${agent.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex p-4 rounded-lg bg-gradient-to-br ${agent.gradient} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    {agent.badge && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        agent.badge.includes('beginners')
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {agent.badge}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                    {agent.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">{agent.description}</p>
                  
                  <button className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105">
                    <Plus className="w-4 h-4" />
                    Create Agent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && selectedAgentType && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${selectedAgentType.gradient}`}>
                  <selectedAgentType.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create {selectedAgentType.name}</h2>
                  <p className="text-gray-400 mt-1">{selectedAgentType.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-200 hover:rotate-90 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
                  Agent Name
                  <HelpTooltip text="Give your agent a clear, descriptive name. You can always rename it later. Example: 'Customer Support Bot' or 'Blog Writer'." position="right" />
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="e.g., My Customer Support Bot"
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Keep it descriptive so you can identify it later.</p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
                  Agent Type
                  <GlossaryBadge term="agent type" position="right" />
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as keyof typeof defaultCapabilities })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  {agentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}{type.badge ? ` — ${type.badge}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Not sure? <span className="text-purple-400">Communication</span> or <span className="text-purple-400">Writing</span> are easiest to start with.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
                  What should this agent do?
                  <HelpTooltip text="Describe the agent's purpose in plain English. This becomes its built-in instructions. Be specific — the more detail you give, the better it performs." position="right" />
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  rows={3}
                  placeholder="e.g., Answer customer questions about our products, handle refund requests, and escalate complex issues to a human."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Think of this as a job description for your AI employee.</p>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="flex items-center gap-1.5 font-semibold text-white mb-2 text-sm">
                  Included Capabilities
                  <GlossaryBadge term="capabilities" position="right" />
                </h4>
                <div className="flex flex-wrap gap-2">
                  {defaultCapabilities[formData.type].map((cap) => (
                    <span
                      key={cap}
                      className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {cap.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">These are automatically set based on the agent type you chose.</p>
              </div>

              {createAgentMutation.error && (
                <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-sm">
                  <p className="text-red-300 font-medium mb-0.5">⚠️ Couldn&apos;t create the agent</p>
                  <p className="text-red-400/80 text-xs">Something went wrong on our end. Please try again — your settings are still saved.</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 hover:scale-105 transition-all duration-200"
                  disabled={createAgentMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAgentMutation.isPending}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createAgentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Agent
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execute Agent Modal */}
      {showExecuteModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${agentTypes.find(t => t.id === selectedAgent.type)?.gradient || 'from-purple-500 to-blue-500'}`}>
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Execute {selectedAgent.name}</h2>
                  <p className="text-gray-400 mt-1">{selectedAgent.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowExecuteModal(false)}
                className="text-gray-400 hover:text-gray-200 hover:rotate-90 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleExecuteSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
                  What should the agent do right now?
                  <GlossaryBadge term="objective" position="right" />
                </label>
                <textarea
                  value={executeData.objective}
                  onChange={(e) => setExecuteData({ ...executeData, objective: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  rows={4}
                  placeholder="Describe the task in plain English. e.g., Write a short blog post about the benefits of AI automation for small businesses."
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Be specific — the more detail you give, the better the result.</p>
              </div>

              {/* Running indicator with elapsed timer */}
              {executeAgentMutation.isPending && (
                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-purple-300 font-medium text-sm">Agent is working…</p>
                      <p className="text-purple-400/70 text-xs">This usually takes 5–20 seconds</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{executionElapsed}s</span>
                    </div>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: `${Math.min(executionElapsed * 5, 90)}%`, transition: 'width 1s linear' }} />
                  </div>
                </div>
              )}

              {executeAgentMutation.error && (
                <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-sm">
                  <p className="text-red-300 font-medium mb-0.5">⚠️ The agent couldn&apos;t complete that task</p>
                  <p className="text-red-400/80 text-xs">Try rephrasing your objective, or check that your agent is configured correctly in Settings.</p>
                </div>
              )}

              {executionResult && (
                <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <h4 className="font-semibold text-green-300 text-sm">Task completed!</h4>
                  </div>
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap overflow-auto max-h-64 bg-gray-800 rounded-lg p-3">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExecuteModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 hover:scale-105 transition-all duration-200"
                  disabled={executeAgentMutation.isPending}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={executeAgentMutation.isPending}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {executeAgentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Run Agent
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Wizard */}
      {showWizard && (
        <AgentWizard
          onClose={() => setShowWizard(false)}
          onComplete={async (agentData) => {
            try {
              await createAgentMutation.mutateAsync({
                name: agentData.name,
                type: agentData.type,
                description: agentData.description,
                config: {
                  model: agentData.model,
                  temperature: agentData.temperature,
                  maxTokens: agentData.maxTokens,
                  tools: agentData.tools,
                },
                capabilities: agentData.capabilities,
                promptTemplate: agentData.promptTemplate,
              });
              setShowWizard(false);
            } catch (error) {
              console.error('Failed to create agent:', error);
            }
          }}
        />
      )}
    </div>
  );
}

