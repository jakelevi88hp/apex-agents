'use client';

import { useState } from 'react';
import { GitBranch, Plus, Trash2, Eye, GitMerge } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface Branch {
  id: string;
  title: string;
  branchFromId: string | null;
  branchAtMessageId: string | null;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationBranchingProps {
  conversationId: string;
  onSelectBranch: (branchId: string) => void;
  onCreateBranch: (atMessageId: string) => void;
}

export default function ConversationBranching({
  conversationId,
  onSelectBranch,
  onCreateBranch,
}: ConversationBranchingProps) {
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const { data: branches, refetch } = trpc.aiAdmin.getConversationBranches.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );

  const deleteBranchMutation = trpc.aiAdmin.deleteConversation.useMutation();

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;

    try {
      await deleteBranchMutation.mutateAsync({ conversationId: branchId });
      refetch();
    } catch (error) {
      console.error('Failed to delete branch:', error);
    }
  };

  const buildBranchTree = (branches: Branch[]): BranchNode[] => {
    const branchMap = new Map<string, BranchNode>();
    const roots: BranchNode[] = [];

    // Create nodes
    branches.forEach(branch => {
      branchMap.set(branch.id, {
        ...branch,
        children: [],
      });
    });

    // Build tree
    branches.forEach(branch => {
      const node = branchMap.get(branch.id)!;
      if (branch.branchFromId) {
        const parent = branchMap.get(branch.branchFromId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = branches?.data ? buildBranchTree(branches.data) : [];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Conversation Branches</h3>
          </div>
          <button
            onClick={() => setShowBranchModal(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Branch
          </button>
        </div>
      </div>

      {/* Branch Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        {tree.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No branches yet</p>
            <p className="text-sm mt-2">Create a branch to explore different conversation paths</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tree.map(node => (
              <BranchTreeNode
                key={node.id}
                node={node}
                level={0}
                currentId={conversationId}
                onSelect={onSelectBranch}
                onDelete={handleDeleteBranch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Branch Modal */}
      {showBranchModal && (
        <CreateBranchModal
          conversationId={conversationId}
          onClose={() => setShowBranchModal(false)}
          onCreated={(branchId) => {
            setShowBranchModal(false);
            onSelectBranch(branchId);
            refetch();
          }}
        />
      )}
    </div>
  );
}

interface BranchNode extends Branch {
  children: BranchNode[];
}

function BranchTreeNode({
  node,
  level,
  currentId,
  onSelect,
  onDelete,
}: {
  node: BranchNode;
  level: number;
  currentId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = node.id === currentId;

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-purple-600/20 border-2 border-purple-500'
            : 'bg-gray-800 hover:bg-gray-750 border-2 border-transparent'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {node.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 text-gray-400 hover:text-white"
          >
            <GitBranch className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium truncate">
              {node.title || 'Untitled Branch'}
            </h4>
            {isActive && (
              <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{node.messageCount} messages</span>
            <span>{new Date(node.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelect(node.id)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="View branch"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!isActive && (
            <button
              onClick={() => onDelete(node.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
              title="Delete branch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map(child => (
            <BranchTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              currentId={currentId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateBranchModal({
  conversationId,
  onClose,
  onCreated,
}: {
  conversationId: string;
  onClose: () => void;
  onCreated: (branchId: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [atMessageId, setAtMessageId] = useState('');

  const createBranchMutation = trpc.aiAdmin.createConversationBranch.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createBranchMutation.mutateAsync({
        conversationId,
        title,
        atMessageId: atMessageId || undefined,
      });

      if (result.success && result.data) {
        onCreated(result.data.id);
      }
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Create New Branch</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Branch Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter branch title"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Branch From Message (Optional)
            </label>
            <input
              type="text"
              value={atMessageId}
              onChange={(e) => setAtMessageId(e.target.value)}
              placeholder="Message ID to branch from"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to branch from the latest message
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createBranchMutation.isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Create Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
