import { NextResponse } from 'next/server';
import { initIdeaGenerationScheduler } from '@/lib/ideas/scheduler';
import { listIdeaSuggestions } from '@/lib/ideas/service';

/**
 * Provides read access to stored idea suggestions.
 *
 * Supports pagination via `limit` and `offset` query parameters.
 */
export async function GET(request: Request) {
  // Ensure the autonomous scheduler is initialised when the route is hit.
  initIdeaGenerationScheduler();

  try {
    // Parse pagination parameters from the query string.
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');

    const parsedLimit = limitParam ? Number(limitParam) : undefined;
    const parsedOffset = offsetParam ? Number(offsetParam) : undefined;

    const limit =
      parsedLimit !== undefined && Number.isFinite(parsedLimit)
        ? parsedLimit
        : undefined;
    const offset =
      parsedOffset !== undefined && Number.isFinite(parsedOffset)
        ? parsedOffset
        : undefined;

    // Fetch persisted ideas from the database.
    const { suggestions, total } = await listIdeaSuggestions(limit, offset);

    // Transform database rows into API-friendly payloads.
    const payload = suggestions.map(({ suggestion, generation }) => ({
      id: suggestion.id,
      ideaText: suggestion.ideaText,
      category: suggestion.category,
      novelty: suggestion.novelty,
      feasibility: suggestion.feasibility,
      impact: suggestion.impact,
      inspirations: suggestion.inspirations ?? [],
      rank: suggestion.rank,
      createdAt: suggestion.createdAt,
      generation: generation
        ? {
            id: generation.id,
            topic: generation.topic,
            triggerType: generation.triggerType,
            technique: generation.technique,
            requestedCount: generation.requestedCount,
            generatedCount: generation.generatedCount,
            createdAt: generation.createdAt,
            metadata: generation.metadata,
          }
        : null,
      metadata: suggestion.metadata,
    }));

    return NextResponse.json({
      suggestions: payload,
      total,
        pagination: {
          limit: limit ?? payload.length,
          offset: offset ?? 0,
        },
    });
  } catch (error) {
    console.error('[API] Failed to list ideas:', error);
    return NextResponse.json(
      { error: 'Unable to load ideas. Please try again shortly.' },
      { status: 500 },
    );
  }
}
