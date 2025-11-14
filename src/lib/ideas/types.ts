/**
 * Idea generation shared types.
 */

import type { CreativityTechnique } from '@/lib/agi/creativity';
import type { IdeaGenerationRow, IdeaSuggestionRow } from '@/lib/db';

/**
 * Specifies where an idea generation request originated.
 */
export type IdeaTriggerType = 'manual' | 'scheduled' | 'interval' | 'api';

/**
 * Options for requesting autonomous idea generation.
 */
export interface IdeaGenerationOptions {
  /** Topic or problem statement to brainstorm around. */
  topic: string;
  /** Number of ideas to attempt generating (defaults to 3). */
  count?: number;
  /** Optional technique to bias the creativity engine. */
  technique?: CreativityTechnique;
  /** Describes how the idea generation was triggered (defaults to manual). */
  triggerType?: IdeaTriggerType;
  /** Optional user identifier to associate with the generation run. */
  userId?: string;
}

/**
 * Result describing the persisted generation run and its ideas.
 */
export interface IdeaGenerationResult {
  /** Database record describing the generation run. */
  generation: IdeaGenerationRow;
  /** Persisted suggestions created by the run. */
  suggestions: IdeaSuggestionRow[];
}

/**
 * Structured suggestion information with generation context for UI rendering.
 */
export interface IdeaSuggestionWithContext {
  /** Persisted suggestion record. */
  suggestion: IdeaSuggestionRow;
  /** Optional generation context linked to the suggestion. */
  generation: IdeaGenerationRow | null;
}
