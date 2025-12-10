/**
 * Semantic Search tRPC Router
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
// TODO: embeddings table not yet created in schema
import { eq, sql } from 'drizzle-orm';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export const searchRouter = router({
  /**
   * Semantic search across knowledge base
   */
  semanticSearch: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
      threshold: z.number().min(0).max(1).default(0.7),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Embeddings table not yet implemented
        // For now, use keyword search as the primary method
        console.log('Using keyword search (embeddings table not yet implemented)');
        
        // Keyword search implementation
        const keywordResults = await db
          .select({
            id: documents.id,
            name: documents.name,
            summary: documents.summary,
            source: documents.source,
            mimeType: documents.mimeType,
          })
          .from(documents)
          .where(eq(documents.userId, ctx.userId!))
          .limit(input.limit);

        // Filter by keyword match
        const filtered = keywordResults.filter(doc => 
          doc.name?.toLowerCase().includes(input.query.toLowerCase()) ||
          doc.summary?.toLowerCase().includes(input.query.toLowerCase())
        );

        return {
          success: true,
          data: {
            query: input.query,
            results: filtered.map(doc => ({
              id: doc.id,
              documentId: doc.id,
              title: doc.name || 'Untitled',
              content: doc.summary || '',
              source: doc.source || '',
              type: doc.mimeType || 'unknown',
              similarity: 0.5, // Default similarity for keyword match
              metadata: {},
            })),
            count: filtered.length,
          },
          fallback: true,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Search error:', error);
        return {
          success: false,
          error: message,
          data: {
            query: input.query,
            results: [],
            count: 0,
          },
        };
      }
    }),

  /**
   * Get search suggestions based on recent queries
   */
  getSearchSuggestions: protectedProcedure
    .input(z.object({
      prefix: z.string().optional(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ input, ctx }) => {
      // Get unique document names and common phrases
      const suggestions = await db
        .select({
          name: documents.name,
          mimeType: documents.mimeType,
        })
        .from(documents)
        .where(eq(documents.userId, ctx.userId!))
        .limit(input.limit * 2);

      // Filter by prefix if provided
      const filtered = input.prefix
        ? suggestions.filter(s => 
            s.name?.toLowerCase().startsWith(input.prefix!.toLowerCase())
          )
        : suggestions;

      return {
        success: true,
        data: filtered
          .slice(0, input.limit)
          .map(s => ({
            text: s.name || 'Untitled',
            type: s.mimeType || 'unknown',
          })),
      };
    }),

  /**
   * Get search history for user
   */
  getSearchHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      // This would query a search_history table if we had one
      // For now, return empty array
      return {
        success: true,
        data: [],
      };
    }),
});

