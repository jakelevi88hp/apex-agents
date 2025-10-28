import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const AgentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 ${
        selected ? 'border-blue-500' : 'border-gray-300'
      } min-w-[200px]`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 text-sm font-bold">🤖</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">
            {data.label || 'Agent'}
          </div>
          <div className="text-xs text-gray-500">
            {data.agentType || 'Not configured'}
          </div>
        </div>
      </div>

      {data.agentId && (
        <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
          Agent ID: {data.agentId.slice(0, 8)}...
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

