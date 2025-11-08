'use client';

import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationList({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const { data: conversationsData, isLoading, error } = trpc.aiAdmin.getConversations.useQuery({
    limit: 50,
  });

  const conversations = conversationsData?.data || [];

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* Header with New Conversation button */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Conversation</span>
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-400">
            Failed to load conversations
          </div>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Click "New Conversation" to start
            </p>
          </div>
        )}

        {!isLoading && !error && conversations.length > 0 && (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeConversationId === conversation.id
                    ? 'bg-purple-600 border-2 border-purple-500'
                    : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {conversation.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(conversation.updatedAt)}
                    </p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with conversation count */}
      {!isLoading && !error && conversations.length > 0 && (
        <div className="p-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
