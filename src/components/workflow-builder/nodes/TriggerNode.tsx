import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'manual': return '👆';
      case 'schedule': return '⏰';
      case 'webhook': return '🔗';
      case 'event': return '⚡';
      default: return '▶️';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-green-50 border-2 ${
        selected ? 'border-green-500' : 'border-green-300'
      } min-w-[200px]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 text-sm">
            {getTriggerIcon(data.triggerType)}
          </span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">
            {data.label || 'Trigger'}
          </div>
          <div className="text-xs text-gray-600 capitalize">
            {data.triggerType || 'manual'}
          </div>
        </div>
      </div>

      {data.schedule && (
        <div className="text-xs text-gray-600 mt-2 p-2 bg-white rounded">
          Schedule: {data.schedule}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';

