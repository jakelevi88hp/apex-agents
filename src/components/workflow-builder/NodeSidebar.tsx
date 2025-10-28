'use client';

interface NodeSidebarProps {
  onAddNode: (type: string, data: any) => void;
}

export function NodeSidebar({ onAddNode }: NodeSidebarProps) {
  const nodeTypes = [
    {
      type: 'trigger',
      label: 'Trigger',
      icon: '▶️',
      description: 'Start the workflow',
      color: 'bg-green-50 border-green-300',
    },
    {
      type: 'agent',
      label: 'Agent',
      icon: '🤖',
      description: 'Execute an AI agent',
      color: 'bg-blue-50 border-blue-300',
    },
    {
      type: 'condition',
      label: 'Condition',
      icon: '?',
      description: 'If/else logic',
      color: 'bg-yellow-50 border-yellow-300',
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Nodes</h3>
      
      <div className="space-y-3">
        {nodeTypes.map((node) => (
          <button
            key={node.type}
            onClick={() => onAddNode(node.type, { label: node.label })}
            className={`w-full p-3 rounded-lg border-2 ${node.color} hover:shadow-md transition-shadow text-left`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{node.icon}</span>
              <span className="font-medium text-gray-900">{node.label}</span>
            </div>
            <p className="text-xs text-gray-600">{node.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">How to use</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Click a node to add it</li>
          <li>• Drag to position nodes</li>
          <li>• Connect nodes by dragging handles</li>
          <li>• Click a node to configure it</li>
        </ul>
      </div>
    </div>
  );
}

