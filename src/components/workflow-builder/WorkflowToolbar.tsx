'use client';

interface WorkflowToolbarProps {
  onSave: () => void;
  onTest: () => void;
  onDeploy: () => void;
}

export function WorkflowToolbar({ onSave, onTest, onDeploy }: WorkflowToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Workflow Builder</h2>
        <span className="text-sm text-gray-500">Drag nodes and connect them to create workflows</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          💾 Save
        </button>
        
        <button
          onClick={onTest}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🧪 Test
        </button>
        
        <button
          onClick={onDeploy}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🚀 Deploy
        </button>
      </div>
    </div>
  );
}

