'use client';

import { useState } from 'react';
import { GitBranch, Plus, MessageSquare, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface Issue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  comments: number;
  html_url: string;
}

interface GitHubIssuesProps {
  repository?: string;
  onSelectIssue?: (issue: Issue) => void;
}

export default function GitHubIssues({ repository, onSelectIssue }: GitHubIssuesProps) {
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: issues, isLoading, refetch } = trpc.aiAdmin.listIssues.useQuery(
    { repository, state: filter },
    { enabled: !!repository }
  );

  const getStateIcon = (state: string) => {
    if (state === 'open') return <AlertCircle className="w-4 h-4 text-green-400" />;
    return <CheckCircle className="w-4 h-4 text-purple-400" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">GitHub Issues</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Issue
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['open', 'closed', 'all'] as const).map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === state
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
            Loading issues...
          </div>
        )}

        {!isLoading && (!issues || issues.data.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No {filter} issues found</p>
          </div>
        )}

        {issues?.data.map((issue: Issue) => (
          <button
            key={issue.number}
            onClick={() => onSelectIssue?.(issue)}
            className="w-full text-left p-4 hover:bg-gray-800 border-b border-gray-800 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getStateIcon(issue.state)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-white font-medium">
                    {issue.title}
                  </h4>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                  <span>#{issue.number}</span>
                  <span>opened {formatDate(issue.created_at)}</span>
                  <span>by {issue.user.login}</span>
                  {issue.comments > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {issue.comments}
                    </span>
                  )}
                </div>

                {issue.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.map((label) => (
                      <span
                        key={label.name}
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                          backgroundColor: `#${label.color}20`,
                          color: `#${label.color}`,
                          borderColor: `#${label.color}40`,
                          borderWidth: '1px',
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          repository={repository}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// Create Issue Modal Component
function CreateIssueModal({
  repository,
  onClose,
  onCreated,
}: {
  repository?: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const createIssueMutation = trpc.aiAdmin.createIssue.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createIssueMutation.mutateAsync({
        repository,
        title,
        body,
      });
      onCreated();
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 w-full max-w-2xl">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Create New Issue</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue..."
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            />
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
              disabled={!title.trim() || createIssueMutation.isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createIssueMutation.isLoading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
