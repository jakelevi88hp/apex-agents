import React from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/Button';

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}) => {
  const { data: conversations, isLoading, error } = trpc.aiAdmin.getConversations.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading conversations</div>;

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md max-h-full overflow-y-auto">
      <Button onClick={onNewConversation} className="mb-4 w-full bg-purple-600 hover:bg-purple-700">
        New Conversation
      </Button>
      <ul className="space-y-2">
        {conversations?.map((conversation) => (
          <li
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              conversation.id === activeConversationId
                ? 'bg-purple-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="font-bold">{conversation.title}</div>
            <div className="text-sm text-gray-400">
              {new Date(conversation.timestamp).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
