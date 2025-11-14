'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Lightbulb,
  Loader2,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';

type IdeaGenerationSummary = {
  id: string;
  topic: string;
  triggerType: string;
  technique: string | null;
  requestedCount: number;
  generatedCount: number;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

type IdeaSuggestion = {
  id: string;
  ideaText: string;
  category: string;
  novelty: number;
  feasibility: number;
  impact: number;
  inspirations: string[];
  rank: number;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  generation: IdeaGenerationSummary | null;
};

type ApiResponse = {
  suggestions: IdeaSuggestion[];
  total: number;
};

const TECHNIQUE_OPTIONS = [
  {
    value: '',
    label: 'Auto select (recommended)',
    description: 'Let the creativity engine choose the best technique.',
  },
  {
    value: 'divergent',
    label: 'Divergent brainstorming',
    description: 'Generate many different directions quickly.',
  },
  {
    value: 'lateral',
    label: 'Lateral thinking',
    description: 'Challenge assumptions with sideways thinking.',
  },
  {
    value: 'conceptual_blending',
    label: 'Conceptual blending',
    description: 'Fuse concepts from multiple domains.',
  },
  {
    value: 'analogical',
    label: 'Analogical reasoning',
    description: 'Borrow patterns from other fields.',
  },
  {
    value: 'scamper',
    label: 'SCAMPER',
    description: 'Systematically modify and improve existing ideas.',
  },
  {
    value: 'random_stimulation',
    label: 'Random stimulation',
    description: 'Spark inspiration with unexpected prompts.',
  },
  {
    value: 'hybrid',
    label: 'Hybrid approach',
    description: 'Blend multiple creative techniques.',
  },
] as const;

const DEFAULT_TOPIC = 'Ways to accelerate Apex Agents adoption';

export default function IdeasDashboardPage() {
  // Track loading and error states for data fetching.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store the list of ideas returned from the API.
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([]);

  // Manage the idea generation form inputs.
  const [topic, setTopic] = useState(DEFAULT_TOPIC);
  const [technique, setTechnique] = useState<string>('');
  const [count, setCount] = useState<number>(3);

  // Provide feedback while the manual generation endpoint runs.
  const [isGenerating, setIsGenerating] = useState(false);

  // Automatically fetch data when the page first loads.
  useEffect(() => {
    void loadIdeas();
  }, []);

  /**
   * Loads existing ideas from the API.
   */
  const loadIdeas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas?limit=25', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = (await response.json()) as ApiResponse;
      setIdeas(data.suggestions ?? []);
    } catch (err) {
      setError('Unable to load ideas. Please refresh in a moment.');
      console.error('Failed to load ideas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles manual triggering of the idea generator.
   */
  const handleGenerateIdeas = async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          count,
          technique: technique || undefined,
          triggerType: 'manual',
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Generation failed');
      }

      await loadIdeas();
    } catch (err) {
      setError(
        'Generation failed. Try again or adjust the topic/technique settings.',
      );
      console.error('Failed to generate ideas:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Friendly helper to display percentages.
   */
  const formatScore = (value: number) =>
    `${Math.round(value * 100)}%`.padStart(4, ' ');

  /**
   * Renders the list of generated ideas.
   */
  const renderIdeas = () => {
    if (isLoading) {
      return (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3 text-purple-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading ideas...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-red-600/60 bg-red-900/20 text-red-200">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadIdeas()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      );
    }

    if (ideas.length === 0) {
      return (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-gray-800 bg-gray-900 text-gray-300">
          <Lightbulb className="h-10 w-10 text-yellow-400" />
          <p className="font-medium">No ideas yet</p>
          <p className="max-w-md text-center text-sm text-gray-400">
            Try generating a new batch of ideas. The autonomous scheduler can
            also run in the background when enabled.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="flex h-full flex-col justify-between rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg transition hover:border-purple-500/80 hover:shadow-purple-500/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-600/20 p-2 text-purple-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-purple-300">
                    Idea #{idea.rank}
                  </p>
                  <p className="text-xs text-gray-500">
                    {idea.generation?.topic ?? 'Autonomous brainstorm'}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs uppercase tracking-wide text-gray-400">
                {idea.category.replace('_', ' ')}
              </span>
            </div>

            <p className="mt-4 text-base font-medium text-gray-100">
              {idea.ideaText}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-gray-800/60 p-3 text-center">
                <p className="text-gray-400">Novelty</p>
                <p className="text-lg font-semibold text-purple-300">
                  {formatScore(idea.novelty)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-800/60 p-3 text-center">
                <p className="text-gray-400">Feasibility</p>
                <p className="text-lg font-semibold text-purple-300">
                  {formatScore(idea.feasibility)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-800/60 p-3 text-center">
                <p className="text-gray-400">Impact</p>
                <p className="text-lg font-semibold text-purple-300">
                  {formatScore(idea.impact)}
                </p>
              </div>
            </div>

            {idea.inspirations.length > 0 && (
              <div className="mt-4 text-xs text-gray-400">
                <p className="font-medium text-gray-300">Inspirations</p>
                <p>{idea.inspirations.join(', ')}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
              <span>
                Generated{' '}
                {new Date(idea.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
              {idea.generation?.triggerType && (
                <span className="rounded-full bg-gray-800 px-3 py-1 text-[10px] uppercase tracking-wider text-gray-400">
                  {idea.generation.triggerType}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <Lightbulb className="h-8 w-8 text-yellow-400" />
            Autonomous Idea Generator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Think of this module as an always-on brainstorming partner. It can
            run on an automated schedule or you can trigger fresh ideas on the
            spot whenever inspiration is needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadIdeas()}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-100 transition hover:border-purple-500 hover:text-white"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {/* Idea generation controls */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-white">
          Generate a fresh batch of ideas
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Provide a topic and optionally guide the creativity style. Think of
          the technique selector like choosing a brainstorming mindset—similar
          to picking a lens (e.g. magnifying glass vs. kaleidoscope) when
          exploring possibilities.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300">
              Brainstorm topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Describe the problem or opportunity you want to explore"
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Creativity technique
            </label>
            <select
              value={technique}
              onChange={(event) => setTechnique(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {TECHNIQUE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {TECHNIQUE_OPTIONS.find((item) => item.value === technique)
                ?.description ?? ''}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Number of ideas
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="mt-2 text-xs text-gray-500">
              Aim for smaller batches for focus. You can always generate again.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleGenerateIdeas()}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate ideas
              </>
            )}
          </button>
          <span className="text-xs text-gray-500">
            Tip: enable the background scheduler with{' '}
            <code className="rounded bg-gray-800 px-2 py-1 text-[10px] uppercase text-purple-300">
              IDEA_GENERATOR_AUTO=true
            </code>{' '}
            to automate periodic batches.
          </span>
        </div>
      </section>

      {/* Suggestions list */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Latest idea suggestions
        </h2>
        {renderIdeas()}
      </section>
    </div>
  );
}
