import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { SuggestionService } from '../services/suggestions';

const suggestionStatusSchema = z.enum(['new', 'acknowledged', 'dismissed', 'archived']);

export const suggestionsRouter = router({
  /**
   * Retrieve suggestions for the authenticated user.
   */
  list: protectedProcedure
    .input(
      z
        .object({
          status: suggestionStatusSchema.optional(),
          limit: z.number().min(1).max(50).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return SuggestionService.getSuggestionsForUser(ctx.db, ctx.userId!, {
        status: input?.status,
        limit: input?.limit,
      });
    }),

  /**
   * Generate new suggestions and return the created records.
   */
  generate: protectedProcedure
    .input(
      z
        .object({
          refreshExisting: z.boolean().default(false),
          ideaCount: z.number().min(1).max(5).default(3),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      const payload = input ?? { refreshExisting: false, ideaCount: 3 };
      return SuggestionService.generateSuggestionsForUser(ctx.db, ctx.userId!, payload);
    }),

  /**
   * Update the status of an existing suggestion.
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: suggestionStatusSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await SuggestionService.updateSuggestionStatus(
        ctx.db,
        ctx.userId!,
        input.id,
        input.status,
      );

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Suggestion not found' });
      }

      return updated;
    }),
});
