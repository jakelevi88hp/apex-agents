import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-yellow-50 border-2 ${
        selected ? 'border-yellow-500' : 'border-yellow-300'
      } min-w-[200px]`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <span className="text-yellow-600 text-sm font-bold">?</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">
            {data.label || 'Condition'}
          </div>
          <div className="text-xs text-gray-500">
            If/Else Logic
          </div>
        </div>
      </div>

      {data.condition && (
        <div className="text-xs text-gray-700 mt-2 p-2 bg-white rounded font-mono">
          {data.condition}
        </div>
      )}

      <div className="flex justify-between mt-3">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="w-3 h-3 bg-green-500"
          style={{ left: '30%' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="w-3 h-3 bg-red-500"
          style={{ left: '70%' }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className="ml-4">True</span>
        <span className="mr-4">False</span>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

