'use client';

import { useCallback, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AgentNode } from './nodes/AgentNode';
import { TriggerNode } from './nodes/TriggerNode';
import { ConditionNode } from './nodes/ConditionNode';
import { NodeSidebar } from './NodeSidebar';
import { WorkflowToolbar } from './WorkflowToolbar';

type WorkflowNodeType = 'agent' | 'trigger' | 'condition';
type WorkflowNodeData = Record<string, unknown>;
type WorkflowNode = Node<WorkflowNodeData>;
type WorkflowEdge = Edge;

const nodeTypes = {
  agent: AgentNode,
  trigger: TriggerNode,
  condition: ConditionNode,
};

interface WorkflowBuilderProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  onSave?: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
}

export function WorkflowBuilder({
  initialNodes = [],
  initialEdges = [],
  onSave,
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowNodeData>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Load agents from API
  const { data: agentsData, isLoading: agentsLoading } = trpc.agents.list.useQuery();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(
    (type: WorkflowNodeType, data: WorkflowNodeData) => {
      const newNode: WorkflowNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const updateNodeData = useCallback(
    (nodeId: string, newData: WorkflowNodeData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  return (
    <div className="h-screen flex flex-col">
      <WorkflowToolbar
        onSave={handleSave}
        onTest={() => console.log('Test workflow')}
        onDeploy={() => console.log('Deploy workflow')}
      />
      
      <div className="flex-1 flex">
        <NodeSidebar onAddNode={addNode} />
        
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Node Settings</h3>
              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Node Type
                </label>
                <p className="text-sm text-gray-600 capitalize">{selectedNode.type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedNode.type === 'agent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent
                  </label>
                  <select
                    value={selectedNode.data.agentId || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { agentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={agentsLoading}
                  >
                    <option value="">
                      {agentsLoading ? 'Loading agents...' : 'Select an agent...'}
                    </option>
                    {agentsData?.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <textarea
                    value={selectedNode.data.condition || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })}
                    placeholder="e.g., output.confidence > 0.8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

