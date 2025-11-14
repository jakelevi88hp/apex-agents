'use client';

import { useEffect } from 'react';
import { Sparkles, RefreshCcw, Check, X, Lightbulb } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

/**
 * Panel that fetches, generates, and displays AI-powered user suggestions.
 *
 * This component is client-side because it relies on interactive hooks for data
 * fetching, mutations, and user-driven actions such as refreshing or dismissing
 * suggestions.
 */
export function UserSuggestionsPanel(): JSX.Element {
  // Access shared trpc utilities for cache invalidation.
  const utils = trpc.useUtils();

  // Load suggestions from the server with a sensible default limit.
  const {
    data: suggestions,
    isLoading,
    isFetching,
  } = trpc.suggestions.list.useQuery({ limit: 12 });

  // Prepare mutation that generates a fresh batch of suggestions.
  const generateMutation = trpc.suggestions.generate.useMutation({
    onSuccess: async () => {
      // Invalidate the list so the UI refreshes with the new results.
      await utils.suggestions.list.invalidate();
    },
  });

  // Prepare mutation to update statuses such as acknowledged or dismissed.
  const updateStatusMutation = trpc.suggestions.updateStatus.useMutation({
    onSuccess: async () => {
      // After updating a suggestion, refresh the cache to reflect the change.
      await utils.suggestions.list.invalidate();
    },
  });

  // Auto-generate suggestions on first load if none exist yet.
  useEffect(() => {
    // Guard against repeated calls while a generation request is already active.
    if (isLoading || generateMutation.isPending) return;
    // Trigger generation only when no suggestions are available.
    if (!suggestions || suggestions.length === 0) {
      generateMutation.mutate({ refreshExisting: false });
    }
  }, [isLoading, suggestions, generateMutation]);

  /**
   * Trigger server-side status update for a suggestion.
   *
   * @param id - Suggestion identifier.
   * @param status - Desired status value.
   */
  const handleStatusChange = (id: string, status: 'acknowledged' | 'dismissed') => {
    // Execute mutation while avoiding duplicate requests.
    updateStatusMutation.mutate({ id, status });
  };

  /**
   * Helper to convert decimal confidence to a percentage label.
   *
   * @param value - Decimal represented as string or number.
   */
  const formatPercent = (value: string | number | null | undefined) => {
    // Return placeholder when data is missing.
    if (value === null || value === undefined) return '—';
    // Parse numeric value safely and clamp to a readable range.
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(parsed)) return '—';
    // Multiply by 100 because values are stored between 0 and 1.
    return `${Math.round(parsed * 100)}%`;
  };

  return (
    <section className="space-y-4">
      {/* Header with controls */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Ideas &amp; Suggestions</h2>
        </div>
        <button
          type="button"
          onClick={() => generateMutation.mutate({ refreshExisting: true })}
          disabled={generateMutation.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-900/50"
        >
          {generateMutation.isPending ? (
            <>
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Ideas
            </>
          )}
        </button>
      </header>

      {/* Loading indicator */}
      {isLoading || isFetching ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-4 text-gray-300">
          <RefreshCcw className="h-4 w-4 animate-spin text-purple-400" />
          <span>Collecting smart suggestions for you...</span>
        </div>
      ) : null}

      {/* Empty state */}
      {!isLoading && suggestions && suggestions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/60 p-6 text-center text-gray-400">
          <p>No suggestions yet. Try generating a fresh batch.</p>
        </div>
      ) : null}

      {/* Suggestions grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {suggestions?.map((suggestion) => (
          <article
            key={suggestion.id}
            className="flex h-full flex-col justify-between rounded-lg border border-gray-700 bg-gray-800/80 p-5 shadow-lg transition hover:border-purple-500/60"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    suggestion.suggestionType === 'idea'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-purple-500/20 text-purple-200'
                  }`}
                >
                  {suggestion.suggestionType === 'idea' ? 'Creative Idea' : 'Predicted Suggestion'}
                </span>
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {suggestion.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">{suggestion.title}</h3>
              <p className="text-sm text-gray-300">{suggestion.description}</p>
            </div>

            <div className="mt-4 space-y-3">
              <dl className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-200">Confidence:</span>
                  <span>{formatPercent(suggestion.confidence)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-200">Impact:</span>
                  <span>{formatPercent(suggestion.impactScore)}</span>
                </div>
              </dl>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange(suggestion.id, 'acknowledged')}
                  className="inline-flex items-center gap-1 rounded-md bg-green-500/20 px-3 py-2 text-xs font-medium text-green-200 transition hover:bg-green-500/30"
                >
                  <Check className="h-4 w-4" />
                  Acknowledge
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(suggestion.id, 'dismissed')}
                  className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/30"
                >
                  <X className="h-4 w-4" />
                  Dismiss
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
