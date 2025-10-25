'use client';

import { useState } from 'react';

interface WorkflowStep {
  id: string;
  type: 'agent' | 'condition' | 'loop' | 'parallel';
  agentType?: string;
  action?: string;
  condition?: string;
  children?: WorkflowStep[];
}

interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft';
  steps: number;
  trigger: string;
  stepDetails?: WorkflowStep[];
}

export default function WorkflowsPage() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [showAddStep, setShowAddStep] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<SavedWorkflow | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  const savedWorkflows: SavedWorkflow[] = [
    {
      id: '1',
      name: 'Daily Market Analysis',
      description: 'Automated market research and report generation',
      status: 'active',
      steps: 4,
      trigger: 'Runs daily at 9 AM',
    },
    {
      id: '2',
      name: 'Content Creation Pipeline',
      description: 'Research, write, and publish blog posts',
      status: 'draft',
      steps: 6,
      trigger: 'Manual trigger',
    },
    {
      id: '3',
      name: 'Customer Support Automation',
      description: 'Analyze tickets and draft responses',
      status: 'active',
      steps: 3,
      trigger: 'Event-triggered',
    },
  ];

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      type,
    };
    setSteps([...steps, newStep]);
    setShowAddStep(false);
  };

  const handleWorkflowClick = (workflow: SavedWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowWorkflowModal(true);
  };

  const handleExecuteWorkflow = (workflowId: string) => {
    alert(`Executing workflow: ${savedWorkflows.find(w => w.id === workflowId)?.name}`);
  };

  const handleEditWorkflow = (workflowId: string) => {
    alert(`Edit functionality coming soon for: ${savedWorkflows.find(w => w.id === workflowId)?.name}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Workflows</h1>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Create Workflow
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Workflow Builder */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Workflow Builder</h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold capitalize">{step.type}</div>
                  <div className="text-sm text-gray-700">
                    {step.agentType && `Agent: ${step.agentType}`}
                    {step.action && ` - ${step.action}`}
                  </div>
                </div>
                <button className="text-red-500 hover:text-red-700">×</button>
              </div>
            ))}

            {steps.length === 0 && (
              <div className="text-center py-12 text-gray-700">
                No steps added yet. Click "Add Step" to begin.
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddStep(true)}
            className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            + Add Step
          </button>

          {showAddStep && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => addStep('agent')}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-semibold">Agent</div>
              </button>
              <button
                onClick={() => addStep('condition')}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="text-2xl mb-2">🔀</div>
                <div className="font-semibold">Condition</div>
              </button>
              <button
                onClick={() => addStep('loop')}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="text-2xl mb-2">🔁</div>
                <div className="font-semibold">Loop</div>
              </button>
              <button
                onClick={() => addStep('parallel')}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Parallel</div>
              </button>
            </div>
          )}
        </div>

        {/* Saved Workflows */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Saved Workflows</h2>
          
          <div className="space-y-4">
            {savedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => handleWorkflowClick(workflow)}
                className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer hover:border-purple-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold">{workflow.name}</div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      workflow.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {workflow.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {workflow.description}
                </div>
                <div className="flex gap-2 text-xs text-gray-700">
                  <span>{workflow.steps} steps</span>
                  <span>•</span>
                  <span>{workflow.trigger}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Templates */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Workflow Templates</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div
            onClick={() => alert('Creating workflow from Data Analysis template...')}
            className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer hover:border-purple-300"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">Data Analysis</div>
            <div className="text-sm text-gray-700">Automated data collection and analysis</div>
          </div>
          <div
            onClick={() => alert('Creating workflow from Content Generation template...')}
            className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer hover:border-purple-300"
          >
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-semibold mb-1">Content Generation</div>
            <div className="text-sm text-gray-700">Research and create content</div>
          </div>
          <div
            onClick={() => alert('Creating workflow from Market Research template...')}
            className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer hover:border-purple-300"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold mb-1">Market Research</div>
            <div className="text-sm text-gray-700">Comprehensive market analysis</div>
          </div>
        </div>
      </div>

      {/* Workflow Detail Modal */}
      {showWorkflowModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedWorkflow.name}</h2>
                <p className="text-gray-700">{selectedWorkflow.description}</p>
              </div>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 text-sm text-gray-700 mb-4">
                <span className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      selectedWorkflow.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedWorkflow.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </span>
                <span><span className="font-semibold">Steps:</span> {selectedWorkflow.steps}</span>
                <span><span className="font-semibold">Trigger:</span> {selectedWorkflow.trigger}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Workflow Steps:</h3>
                <div className="space-y-2">
                  {Array.from({ length: selectedWorkflow.steps }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                        {i + 1}
                      </div>
                      <span className="text-gray-700">Step {i + 1} - Agent execution</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleExecuteWorkflow(selectedWorkflow.id);
                  setShowWorkflowModal(false);
                }}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Execute Workflow
              </button>
              <button
                onClick={() => {
                  handleEditWorkflow(selectedWorkflow.id);
                  setShowWorkflowModal(false);
                }}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Edit Workflow
              </button>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

