'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

const agentTypes = [
  { id: 'research', name: 'Research Agent', icon: '🔍', description: 'Gather and analyze information from multiple sources' },
  { id: 'analysis', name: 'Analysis Agent', icon: '📊', description: 'Analyze data and identify patterns and insights' },
  { id: 'writing', name: 'Writing Agent', icon: '✍️', description: 'Generate high-quality content and documentation' },
  { id: 'code', name: 'Code Agent', icon: '💻', description: 'Write, debug, and refactor code' },
  { id: 'decision', name: 'Decision Agent', icon: '🎯', description: 'Make strategic decisions based on criteria' },
  { id: 'communication', name: 'Communication Agent', icon: '📧', description: 'Handle external communications' },
  { id: 'monitoring', name: 'Monitoring Agent', icon: '📈', description: 'Monitor systems and alert on anomalies' },
  { id: 'orchestrator', name: 'Orchestrator Agent', icon: '🎭', description: 'Coordinate multiple agents for complex tasks' },
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
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'research' as keyof typeof defaultCapabilities,
    description: '',
  });

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

  const handleCreateAgent = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({ ...formData, type: typeId as keyof typeof defaultCapabilities });
    setShowCreateModal(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Agents</h1>
            <p className="text-gray-600 mt-2">Create and manage your AI agents</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            + Create Agent
          </button>
        </div>

        {/* User's Created Agents Section */}
        {userAgents && userAgents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Agents</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userAgents.map((agent) => {
                const agentType = agentTypes.find(t => t.id === agent.type);
                return (
                  <div 
                    key={agent.id} 
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl">{agentType?.icon || '🤖'}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        agent.status === 'active' ? 'bg-green-100 text-green-800' : 
                        agent.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                    <p className="text-sm text-gray-700 mb-2">{agentType?.name}</p>
                    {agent.description && (
                      <p className="text-gray-700 mb-4 text-sm">{agent.description}</p>
                    )}
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-all"
                      >
                        Execute
                      </button>
                      <button 
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Templates Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Templates</h2>
          <p className="text-gray-600 mb-6">Choose a template to create a new agent</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentTypes.map((agent) => (
              <div 
                key={agent.id} 
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200"
              >
                <div className="text-5xl mb-4">{agent.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                <p className="text-gray-700 mb-6 min-h-[48px]">{agent.description}</p>
                <button 
                  onClick={() => handleCreateAgent(agent.id)}
                  className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
                >
                  Create {agent.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Agent</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Agent Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900" 
                    placeholder="My Research Agent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Agent Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as keyof typeof defaultCapabilities })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                  >
                    {agentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description (Optional)</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900" 
                    rows={4} 
                    placeholder="Describe what this agent will do..." 
                  />
                </div>
                
                {/* Show capabilities for selected type */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Included Capabilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {defaultCapabilities[formData.type].map((cap) => (
                      <span key={cap} className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {createAgentMutation.error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Error creating agent:</p>
                    <p className="text-sm">{createAgentMutation.error.message}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)} 
                    disabled={createAgentMutation.isPending}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={createAgentMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {createAgentMutation.isPending ? 'Creating...' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

