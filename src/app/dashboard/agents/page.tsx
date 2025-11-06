'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { 
  Search, BarChart3, PenTool, Code2, Target, Mail, 
  TrendingUp, Network, Plus, X, Loader2, Play, Settings, Send 
} from 'lucide-react';
import AgentWizard from '@/components/agent-wizard/AgentWizard';

const agentTypes = [
  { 
    id: 'research', 
    name: 'Research Agent', 
    icon: Search, 
    description: 'Gather and analyze information from multiple sources',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'analysis', 
    name: 'Analysis Agent', 
    icon: BarChart3, 
    description: 'Analyze data and identify patterns and insights',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'writing', 
    name: 'Writing Agent', 
    icon: PenTool, 
    description: 'Generate high-quality content and documentation',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'code', 
    name: 'Code Agent', 
    icon: Code2, 
    description: 'Write, debug, and refactor code',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    id: 'decision', 
    name: 'Decision Agent', 
    icon: Target, 
    description: 'Make strategic decisions based on criteria',
    gradient: 'from-yellow-500 to-orange-500'
  },
  { 
    id: 'communication', 
    name: 'Communication Agent', 
    icon: Mail, 
    description: 'Handle external communications',
    gradient: 'from-indigo-500 to-purple-500'
  },
  { 
    id: 'monitoring', 
    name: 'Monitoring Agent', 
    icon: TrendingUp, 
    description: 'Monitor systems and alert on anomalies',
    gradient: 'from-teal-500 to-cyan-500'
  },
  { 
    id: 'orchestrator', 
    name: 'Orchestrator Agent', 
    icon: Network, 
    description: 'Coordinate multiple agents for complex tasks',
    gradient: 'from-pink-500 to-rose-500'
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

export default function AgentsPage() {
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

  // Fetch user's created agents
  const { data: userAgents, isLoading: agentsLoading, refetch } = trpc.agents.list.useQuery();

  // Create agent mutation
  const createAgentMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      setShowCreateModal(false);
      setFormData({ name: '', type: 'research', description: '' });
      refetch(); // Refresh the agents list
    },
  });

  // Execute agent mutation
  const executeAgentMutation = trpc.agents.execute.useMutation({
    onSuccess: (data) => {
      setExecutionResult(data);
    },
  });

  const handleCreateAgent = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({ ...formData, type: typeId as keyof typeof defaultCapabilities });
    setShowCreateModal(true);
  };

  const handleExecuteAgent = (agent: any) => {
    setSelectedAgent(agent);
    setExecuteData({ objective: '', context: {} });
    setExecutionResult(null);
    setShowExecuteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAgentMutation.mutateAsync({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        config: defaultConfig[formData.type],
        capabilities: defaultCapabilities[formData.type],
      });
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const handleExecuteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await executeAgentMutation.mutateAsync({
        agentId: selectedAgent.id,
        objective: executeData.objective,
        context: executeData.context,
      });
    } catch (error) {
      console.error('Failed to execute agent:', error);
    }
  };

  const selectedAgentType = agentTypes.find(t => t.id === formData.type);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Agents</h1>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          New Agent
        </button>
      </div>

      {/* User's Created Agents */}
      {userAgents && userAgents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Agents</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAgents.map((agent: any) => {
              const agentType = agentTypes.find(t => t.id === agent.type);
              const IconComponent = agentType?.icon || Search;
              
              return (
                <div
                  key={agent.id}
                  className="group bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-purple-500/30 hover:border-purple-500 hover:shadow-purple-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
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
                    <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 hover:scale-105 transition-all duration-200">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
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
                  <div className={`inline-flex p-4 rounded-lg bg-gradient-to-br ${agent.gradient} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="e.g., Market Research Assistant"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as keyof typeof defaultCapabilities })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  {agentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  rows={3}
                  placeholder="Describe what this agent will do..."
                  required
                />
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Included Capabilities:</h4>
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
              </div>

              {createAgentMutation.error && (
                <div className="p-3 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm">
                  Error creating agent: {createAgentMutation.error.message}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objective / Command
                </label>
                <textarea
                  value={executeData.objective}
                  onChange={(e) => setExecuteData({ ...executeData, objective: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  rows={4}
                  placeholder="What do you want this agent to do? e.g., Research the latest AI trends in 2024..."
                  required
                />
              </div>

              {executeAgentMutation.error && (
                <div className="p-3 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm">
                  Error executing agent: {executeAgentMutation.error.message}
                </div>
              )}

              {executionResult && (
                <div className="p-4 bg-green-900/20 border border-green-500/50 rounded">
                  <h4 className="font-semibold text-green-300 mb-2">Execution Result:</h4>
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap overflow-auto max-h-64">
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
                      Executing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Execute
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

