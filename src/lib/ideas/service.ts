/**
 * Idea generation service helpers.
 *
 * Handles autonomous idea creation, persistence, and retrieval.
 */

import { desc, eq, sql } from 'drizzle-orm';
import { CreativityEngine, type CreativityTechnique } from '@/lib/agi/creativity';
import { db, ideaGenerations, ideaSuggestions } from '@/lib/db';
import type {
  IdeaGenerationOptions,
  IdeaGenerationResult,
  IdeaSuggestionWithContext,
} from './types';

const MAX_IDEA_COUNT = 10;
const MIN_IDEA_COUNT = 1;

/**
 * Runs the creativity engine and stores results in the database.
 *
 * @param options - Topic, count, technique, and trigger metadata.
 * @returns Persisted generation row and associated suggestions.
 */
export async function generateAndStoreIdeas(
  options: IdeaGenerationOptions,
): Promise<IdeaGenerationResult> {
  // Guard against invalid configuration.
  if (!options.topic || !options.topic.trim()) {
    throw new Error('A topic is required to generate ideas.');
  }

  // Clamp the requested idea count to a safe range.
  const targetCount = Math.max(
    MIN_IDEA_COUNT,
    Math.min(MAX_IDEA_COUNT, options.count ?? 3),
  );

  // Instantiate the creativity engine scoped to an optional user.
  const engine = new CreativityEngine(options.userId);

  try {
    // Produce creative ideas using the requested (or inferred) technique.
    const output = await engine.generateIdeas(
      options.topic.trim(),
      targetCount,
      options.technique,
    );

    // Detect which technique ultimately produced the ideas.
    const detectedTechnique: CreativityTechnique | undefined =
      options.technique ??
      (output.ideas[0]?.category as CreativityTechnique | undefined);

    // Shared metadata about the generation reasoning process.
    const generationMetadata = {
      approach: output.approach,
      reasoning: output.reasoning,
      connections: output.connections,
      noveltyScore: output.noveltyScore,
    };

    // Persist generation and suggestions atomically.
    const result = await db.transaction(async (tx) => {
      // Insert the generation run details.
      const [generation] = await tx
        .insert(ideaGenerations)
        .values({
          topic: options.topic.trim(),
          triggerType: options.triggerType ?? 'manual',
          technique: detectedTechnique,
          requestedCount: targetCount,
          generatedCount: output.ideas.length,
          userId: options.userId ?? null,
          metadata: generationMetadata,
        })
        .returning();

      // Prepare the suggestion rows for bulk insert.
      const suggestionRows = output.ideas.map((idea, index) => ({
        generationId: generation.id,
        rank: index + 1,
        ideaText: idea.description,
        category: idea.category,
        novelty: idea.novelty,
        feasibility: idea.feasibility,
        impact: idea.impact,
        inspirations: idea.inspirations,
        metadata: {
          ...generationMetadata,
        },
      }));

      // Insert all suggestions and return the persisted rows.
      const persistedSuggestions = await tx
        .insert(ideaSuggestions)
        .values(suggestionRows)
        .returning();

      return {
        generation,
        suggestions: persistedSuggestions,
      };
    });

    return result;
  } catch (error) {
    // Provide a succinct, developer-friendly message.
    throw new Error(
      `Failed to generate ideas: ${(error as Error).message ?? 'Unknown error'}`,
    );
  }
}

/**
 * Retrieves suggestions with optional pagination and accompanying context.
 *
 * @param limit - Maximum number of suggestions to return (default 20).
 * @param offset - Number of records to skip (default 0).
 * @returns Suggestions joined with their generation metadata and a total count.
 */
export async function listIdeaSuggestions(
  limit = 20,
  offset = 0,
): Promise<{ suggestions: IdeaSuggestionWithContext[]; total: number }> {
  // Constrain pagination inputs to sensible bounds.
  const safeLimit = Math.max(1, Math.min(100, limit));
  const safeOffset = Math.max(0, offset);

  try {
    // Fetch suggestions plus their generation metadata.
    const rows = await db
      .select({
        suggestion: ideaSuggestions,
        generation: ideaGenerations,
      })
      .from(ideaSuggestions)
      .leftJoin(
        ideaGenerations,
        eq(ideaSuggestions.generationId, ideaGenerations.id),
      )
      .orderBy(desc(ideaSuggestions.createdAt), ideaSuggestions.rank)
      .limit(safeLimit)
      .offset(safeOffset);

    // Determine the total number of stored suggestions.
    const totalResult = await db
      .select({ value: sql<number>`count(*)` })
      .from(ideaSuggestions);

    return {
      suggestions: rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  } catch (error) {
    throw new Error(
      `Failed to list idea suggestions: ${
        (error as Error).message ?? 'Unknown error'
      }`,
    );
  }
}
