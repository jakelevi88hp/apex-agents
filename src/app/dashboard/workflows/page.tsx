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

export default function WorkflowsPage() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [showAddStep, setShowAddStep] = useState(false);

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      type,
    };
    setSteps([...steps, newStep]);
    setShowAddStep(false);
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
                  <div className="text-sm text-gray-500">
                    {step.agentType && `Agent: ${step.agentType}`}
                    {step.action && ` - ${step.action}`}
                  </div>
                </div>
                <button className="text-red-500 hover:text-red-700">×</button>
              </div>
            ))}

            {steps.length === 0 && (
              <div className="text-center py-12 text-gray-400">
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
            <div className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold">Daily Market Analysis</div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Automated market research and report generation
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>4 steps</span>
                <span>•</span>
                <span>Runs daily at 9 AM</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold">Content Creation Pipeline</div>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Draft</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Research, write, and publish blog posts
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>6 steps</span>
                <span>•</span>
                <span>Manual trigger</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold">Customer Support Automation</div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Analyze tickets and draft responses
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>3 steps</span>
                <span>•</span>
                <span>Event-triggered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Templates */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Workflow Templates</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">Data Analysis</div>
            <div className="text-sm text-gray-600">Automated data collection and analysis</div>
          </div>
          <div className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer">
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-semibold mb-1">Content Generation</div>
            <div className="text-sm text-gray-600">Research and create content</div>
          </div>
          <div className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer">
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold mb-1">Market Research</div>
            <div className="text-sm text-gray-600">Comprehensive market analysis</div>
          </div>
        </div>
      </div>
    </div>
  );
}

