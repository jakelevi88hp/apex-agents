'use client';

import { useState } from 'react';
import Link from 'next/link';

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

export default function AgentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Agents</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Create Agent
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentTypes.map((agent) => (
          <div key={agent.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">{agent.icon}</div>
            <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
            <p className="text-gray-600 mb-4">{agent.description}</p>
            <button className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
              Create {agent.name}
            </button>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New Agent</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agent Name</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="My Research Agent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Agent Type</label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  {agentTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea className="w-full px-4 py-2 border rounded-lg" rows={3} placeholder="Describe what this agent will do..." />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

