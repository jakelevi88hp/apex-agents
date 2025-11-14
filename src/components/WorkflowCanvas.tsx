'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Bot, GitBranch, Repeat, Zap, Play, Save } from 'lucide-react';

interface AgentNodeData {
  label: string;
  agentName?: string;
  description?: string;
}

interface ConditionNodeData {
  label: string;
  condition?: string;
}

interface LoopNodeData {
  label: string;
  iterations?: number;
}

interface ParallelNodeData {
  label: string;
}

type NodeComponentProps<T> = { data: T };

// Custom Node Components
const AgentNode = ({ data }: NodeComponentProps<AgentNodeData>) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-purple-400 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-5 h-5 text-white" />
        <div className="font-bold text-white">{data.label}</div>
      </div>
      {data.agentName && (
        <div className="text-xs text-purple-100">Agent: {data.agentName}</div>
      )}
      {data.description && (
        <div className="text-xs text-purple-200 mt-1">{data.description}</div>
      )}
    </div>
  );
};

const ConditionNode = ({ data }: NodeComponentProps<ConditionNodeData>) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-yellow-400 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-5 h-5 text-white" />
        <div className="font-bold text-white">{data.label}</div>
      </div>
      {data.condition && (
        <div className="text-xs text-yellow-100">If: {data.condition}</div>
      )}
    </div>
  );
};

const LoopNode = ({ data }: NodeComponentProps<LoopNodeData>) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-green-500 to-teal-500 border-2 border-green-400 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Repeat className="w-5 h-5 text-white" />
        <div className="font-bold text-white">{data.label}</div>
      </div>
      {data.iterations && (
        <div className="text-xs text-green-100">Iterations: {data.iterations}</div>
      )}
    </div>
  );
};

const ParallelNode = ({ data }: NodeComponentProps<ParallelNodeData>) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-pink-400 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-white" />
        <div className="font-bold text-white">{data.label}</div>
      </div>
      <div className="text-xs text-pink-100">Execute in parallel</div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  condition: ConditionNode,
  loop: LoopNode,
  parallel: ParallelNode,
};

interface WorkflowCanvasProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onExecute?: () => void;
}

export default function WorkflowCanvas({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onExecute,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#9333ea',
        },
        style: {
          stroke: '#9333ea',
          strokeWidth: 2,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type: keyof typeof nodeTypes) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">Workflow Builder</h3>
          {workflowId && (
            <span className="text-sm text-gray-400">ID: {workflowId}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleExecute}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            Execute
          </button>
        </div>
      </div>

      {/* Node Palette */}
      <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400 mr-2">Add Node:</span>
        <button
          onClick={() => addNode('agent')}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded flex items-center gap-1 transition-colors"
        >
          <Bot className="w-4 h-4" />
          Agent
        </button>
        <button
          onClick={() => addNode('condition')}
          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded flex items-center gap-1 transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          Condition
        </button>
        <button
          onClick={() => addNode('loop')}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center gap-1 transition-colors"
        >
          <Repeat className="w-4 h-4" />
          Loop
        </button>
        <button
          onClick={() => addNode('parallel')}
          className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded flex items-center gap-1 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Parallel
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-900"
        >
          <Background color="#374151" gap={16} />
          <Controls className="bg-gray-800 border border-gray-700" />
          <MiniMap
            className="bg-gray-800 border border-gray-700"
            nodeColor={(node) => {
              switch (node.type) {
                case 'agent':
                  return '#9333ea';
                case 'condition':
                  return '#eab308';
                case 'loop':
                  return '#10b981';
                case 'parallel':
                  return '#ec4899';
                default:
                  return '#6b7280';
              }
            }}
          />
        </ReactFlow>
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <div className="absolute right-4 top-24 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4">
          <h4 className="text-lg font-bold text-white mb-3">Node Configuration</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Label
              </label>
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, data: { ...node.data, label: e.target.value } }
                        : node
                    )
                  );
                  setSelectedNode({
                    ...selectedNode,
                    data: { ...selectedNode.data, label: e.target.value },
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {selectedNode.type === 'agent' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={selectedNode.data.agentName || ''}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, agentName: e.target.value } }
                          : node
                      )
                    );
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Select an agent..."
                />
              </div>
            )}

            {selectedNode.type === 'condition' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Condition
                </label>
                <input
                  type="text"
                  value={selectedNode.data.condition || ''}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, condition: e.target.value } }
                          : node
                      )
                    );
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., result.success === true"
                />
              </div>
            )}

            {selectedNode.type === 'loop' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Iterations
                </label>
                <input
                  type="number"
                  value={selectedNode.data.iterations || 1}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, iterations: parseInt(e.target.value) } }
                          : node
                      )
                    );
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>
            )}

            <button
              onClick={() => {
                setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
                setSelectedNode(null);
              }}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
