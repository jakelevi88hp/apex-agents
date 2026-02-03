'use client';
import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import { LayoutGrid, List, HelpCircle } from 'lucide-react';

interface WorkflowStep {
  id: string;
  type: 'agent' | 'condition' | 'loop' | 'parallel';
  agentId?: string;
  action?: string;
  condition?: string;
  iterations?: number;
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
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);

  // Fetch workflows from database
  const { data: workflows, isLoading, refetch } = trpc.workflows.list.useQuery();
  const { data: agents } = trpc.agents.list.useQuery();
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
    onError: (error) => {
      alert(`Workflow execution failed: ${error.message}`);
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

  /**
   * Update a workflow step by id.
   * @param stepId - Step identifier to update.
   * @param updates - Partial updates for the step.
   */
  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps((current) =>
      current.map((step) => (step.id === stepId ? { ...step, ...updates } : step))
    );
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

    const missingAgentSteps = steps.filter((step) => step.type === 'agent' && !step.agentId);
    if (missingAgentSteps.length > 0) {
      alert('Please select an agent for every agent step before saving.');
      return;
    }

    if (steps.length === 0) {
      alert('Please add at least one step to your workflow.');
      return;
    }

    createWorkflow.mutate({
      name: newWorkflowName,
      description: newWorkflowDescription,
      trigger: { type: 'manual' },
      steps: steps.map(step => ({
        id: step.id,
        type: step.type,
        agentId: step.agentId,
        action: step.action,
        condition: step.condition,
        iterations: step.iterations,
        config: {
          prompt: step.action,
          condition: step.condition,
          iterations: step.iterations,
          steps: step.children,
        },
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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Workflows</h1>
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                viewMode === 'visual'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Visual
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/docs"
            title="Open workflow documentation"
            className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Docs
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            title="Create a new workflow"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Workflow
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="h-[calc(100vh-12rem)] bg-gray-800 rounded-lg overflow-hidden">
          <WorkflowCanvas
            workflowId={selectedWorkflowId || undefined}
            onSave={(nodes, edges) => {
              console.log('Saving workflow:', { nodes, edges });
              // TODO: Convert nodes/edges to workflow steps and save
            }}
            onExecute={() => {
              console.log('Executing workflow');
              // TODO: Execute the workflow
            }}
          />
        </div>
      ) : (
      <div className="grid md:grid-cols-2 gap-6">
        {/* Workflow Builder */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-white mb-4">Workflow Builder</h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col gap-3 p-4 border border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white capitalize">{step.type}</div>
                  <div className="text-sm text-gray-400">
                    {step.agentId && `Agent: ${agents?.find((agent) => agent.id === step.agentId)?.name || 'Selected'}`}
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

                {step.type === 'agent' && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-gray-400">Agent</label>
                      <select
                        value={step.agentId || ''}
                        onChange={(event) => updateStep(step.id, { agentId: event.target.value || undefined })}
                        className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">Select an agent</option>
                        {agents?.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Instruction</label>
                      <input
                        value={step.action || ''}
                        onChange={(event) => updateStep(step.id, { action: event.target.value })}
                        placeholder="Describe what this agent should do"
                        className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {step.type === 'condition' && (
                  <div>
                    <label className="text-xs text-gray-400">Condition</label>
                    <input
                      value={step.condition || ''}
                      onChange={(event) => updateStep(step.id, { condition: event.target.value })}
                      placeholder="e.g. output.confidence > 0.8"
                      className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}

                {step.type === 'loop' && (
                  <div>
                    <label className="text-xs text-gray-400">Iterations</label>
                    <input
                      type="number"
                      min={1}
                      value={step.iterations || 1}
                      onChange={(event) => updateStep(step.id, { iterations: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}
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
            title="Add a new step to your workflow"
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
                    <span>{((workflow.trigger as { type?: string })?.type) || 'Manual'} trigger</span>
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
      )}

      {/* Workflow Templates */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-white mb-4">Workflow Templates</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div
            onClick={() => {
              setNewWorkflowName('Data Analysis Workflow');
              setNewWorkflowDescription('Automated data collection and analysis');
              setSteps([
                { id: crypto.randomUUID(), type: 'agent', action: 'Collect data from the specified sources.' },
                { id: crypto.randomUUID(), type: 'agent', action: 'Analyze the collected data and summarize findings.' },
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
                { id: crypto.randomUUID(), type: 'agent', action: 'Research the topic and gather key points.' },
                { id: crypto.randomUUID(), type: 'agent', action: 'Draft the final content using the research.' },
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
                { id: crypto.randomUUID(), type: 'agent', action: 'Collect market data and competitor insights.' },
                { id: crypto.randomUUID(), type: 'agent', action: 'Generate a concise market report.' },
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

            {executeWorkflow.error && (
              <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {executeWorkflow.error.message}
              </div>
            )}
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
                  {((selectedWorkflow.trigger as { type?: string })?.type) || 'Manual'}
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

