'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

interface WorkflowStep {
  id: string;
  type: 'agent' | 'condition' | 'loop' | 'parallel';
  agentType?: string;
  action?: string;
  condition?: string;
  children?: WorkflowStep[];
}

export default function WorkflowsPage() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [showAddStep, setShowAddStep] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  // Fetch workflows from database
  const { data: workflows, isLoading, refetch } = trpc.workflows.list.useQuery();
  const { data: selectedWorkflow } = trpc.workflows.get.useQuery(
    { id: selectedWorkflowId! },
    { enabled: !!selectedWorkflowId }
  );

  // Mutations
  const createWorkflow = trpc.workflows.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      setSteps([]);
    },
  });

  const executeWorkflow = trpc.workflows.execute.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        alert(`Workflow executed successfully! Execution ID: ${result.executionId}`);
      } else {
        alert(`Workflow execution failed: ${result.error}`);
      }
      refetch();
    },
  });

  const updateWorkflow = trpc.workflows.update.useMutation({
    onSuccess: () => {
      refetch();
      alert('Workflow updated successfully!');
    },
  });

  const deleteWorkflow = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      refetch();
      setShowWorkflowModal(false);
      alert('Workflow deleted successfully!');
    },
  });

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      type,
    };
    setSteps([...steps, newStep]);
    setShowAddStep(false);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const handleWorkflowClick = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setShowWorkflowModal(true);
  };

  const handleExecuteWorkflow = (workflowId: string) => {
    executeWorkflow.mutate({ workflowId });
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow.mutate({ id: workflowId });
    }
  };

  const handleToggleStatus = (workflowId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    updateWorkflow.mutate({ id: workflowId, status: newStatus as 'active' | 'draft' });
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    createWorkflow.mutate({
      name: newWorkflowName,
      description: newWorkflowDescription,
      trigger: { type: 'manual' },
      steps: steps.map(step => ({
        id: step.id,
        type: step.type,
        agentType: step.agentType,
        action: step.action,
        condition: step.condition,
      })),
      agents: [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Workflows</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Create Workflow
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Workflow Builder */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-white mb-4">Workflow Builder</h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4 p-4 border border-gray-700 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white capitalize">{step.type}</div>
                  <div className="text-sm text-gray-400">
                    {step.agentType && `Agent: ${step.agentType}`}
                    {step.action && ` - ${step.action}`}
                  </div>
                </div>
                <button
                  onClick={() => removeStep(step.id)}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  ×
                </button>
              </div>
            ))}

            {steps.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No steps added yet. Click "Add Step" to begin.
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddStep(true)}
            className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-700 transition text-gray-300"
          >
            + Add Step
          </button>

          {showAddStep && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => addStep('agent')}
                className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 text-white"
              >
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-semibold">Agent</div>
              </button>
              <button
                onClick={() => addStep('condition')}
                className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 text-white"
              >
                <div className="text-2xl mb-2">🔀</div>
                <div className="font-semibold">Condition</div>
              </button>
              <button
                onClick={() => addStep('loop')}
                className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 text-white"
              >
                <div className="text-2xl mb-2">🔁</div>
                <div className="font-semibold">Loop</div>
              </button>
              <button
                onClick={() => addStep('parallel')}
                className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 text-white"
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Parallel</div>
              </button>
            </div>
          )}
        </div>

        {/* Saved Workflows */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-white mb-4">Saved Workflows</h2>
          
          {workflows && workflows.length > 0 ? (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  onClick={() => handleWorkflowClick(workflow.id)}
                  className="p-4 border border-gray-700 rounded-lg hover:shadow-lg transition cursor-pointer hover:border-purple-500 hover:shadow-purple-500/20 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-gray-900"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-white">{workflow.name}</div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                        workflow.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {workflow.status === 'active' && (
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      )}
                      {workflow.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {workflow.description || 'No description'}
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>{Array.isArray(workflow.steps) ? workflow.steps.length : 0} steps</span>
                    <span>•</span>
                    <span>{workflow.trigger?.type || 'Manual'} trigger</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No workflows yet. Create your first workflow!
            </div>
          )}
        </div>
      </div>

      {/* Workflow Templates */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-white mb-4">Workflow Templates</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div
            onClick={() => {
              setNewWorkflowName('Data Analysis Workflow');
              setNewWorkflowDescription('Automated data collection and analysis');
              setSteps([
                { id: crypto.randomUUID(), type: 'agent', agentType: 'data-collector' },
                { id: crypto.randomUUID(), type: 'agent', agentType: 'data-analyzer' },
              ]);
              setShowCreateModal(true);
            }}
            className="p-4 border border-gray-700 rounded-lg hover:shadow-md transition cursor-pointer hover:border-purple-500 text-white"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">Data Analysis</div>
            <div className="text-sm text-gray-400">Automated data collection and analysis</div>
          </div>
          <div
            onClick={() => {
              setNewWorkflowName('Content Generation Workflow');
              setNewWorkflowDescription('Research and create content');
              setSteps([
                { id: crypto.randomUUID(), type: 'agent', agentType: 'researcher' },
                { id: crypto.randomUUID(), type: 'agent', agentType: 'writer' },
              ]);
              setShowCreateModal(true);
            }}
            className="p-4 border border-gray-700 rounded-lg hover:shadow-md transition cursor-pointer hover:border-purple-500 text-white"
          >
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-semibold mb-1">Content Generation</div>
            <div className="text-sm text-gray-400">Research and create content</div>
          </div>
          <div
            onClick={() => {
              setNewWorkflowName('Market Research Workflow');
              setNewWorkflowDescription('Comprehensive market analysis');
              setSteps([
                { id: crypto.randomUUID(), type: 'agent', agentType: 'market-researcher' },
                { id: crypto.randomUUID(), type: 'agent', agentType: 'report-generator' },
              ]);
              setShowCreateModal(true);
            }}
            className="p-4 border border-gray-700 rounded-lg hover:shadow-md transition cursor-pointer hover:border-purple-500 text-white"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold mb-1">Market Research</div>
            <div className="text-sm text-gray-400">Comprehensive market analysis</div>
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter workflow name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter workflow description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steps ({steps.length})
                </label>
                <div className="bg-gray-900 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {steps.length > 0 ? (
                    <div className="space-y-2">
                      {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {i + 1}
                          </div>
                          <span className="capitalize">{step.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No steps added yet</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateWorkflow}
                disabled={createWorkflow.isPending}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {createWorkflow.isPending ? 'Creating...' : 'Create Workflow'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Detail Modal */}
      {showWorkflowModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedWorkflow.name}</h2>
                <p className="text-gray-400">{selectedWorkflow.description || 'No description'}</p>
              </div>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-white">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      selectedWorkflow.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {selectedWorkflow.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </span>
                <span>
                  <span className="font-semibold text-white">Steps:</span>{' '}
                  {Array.isArray(selectedWorkflow.steps) ? selectedWorkflow.steps.length : 0}
                </span>
                <span>
                  <span className="font-semibold text-white">Trigger:</span>{' '}
                  {selectedWorkflow.trigger?.type || 'Manual'}
                </span>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-3">Workflow Steps:</h3>
                <div className="space-y-2">
                  {Array.isArray(selectedWorkflow.steps) && selectedWorkflow.steps.length > 0 ? (
                    selectedWorkflow.steps.map((step: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {i + 1}
                        </div>
                        <span className="capitalize">{step.type || 'Unknown'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">No steps configured</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleExecuteWorkflow(selectedWorkflow.id);
                  setShowWorkflowModal(false);
                }}
                disabled={executeWorkflow.isPending}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {executeWorkflow.isPending ? 'Executing...' : 'Execute Workflow'}
              </button>
              <button
                onClick={() => handleToggleStatus(selectedWorkflow.id, selectedWorkflow.status)}
                disabled={updateWorkflow.isPending}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {selectedWorkflow.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDeleteWorkflow(selectedWorkflow.id)}
                disabled={deleteWorkflow.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

