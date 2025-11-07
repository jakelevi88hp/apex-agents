/**
 * AI Admin tRPC Router
 * 
 * Provides API endpoints for the AI Admin Chat Agent
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { getAIAdminAgent } from '@/lib/ai-admin/agent';
import { patchStorage } from '@/lib/ai-admin/patch-storage';
import { TRPCError } from '@trpc/server';

// Admin authentication middleware
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Check if user is admin by querying the database
  console.log('[AI Admin] Checking admin access for userId:', ctx.userId);
  
  const { db } = await import('@/lib/db');
  const { users } = await import('@/lib/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const user = await db
    .select({ role: users.role, email: users.email })
    .from(users)
    .where(eq(users.id, ctx.userId))
    .limit(1);

  console.log('[AI Admin] User query result:', user);
  const isAdmin = user[0]?.role === 'admin' || user[0]?.role === 'owner';
  console.log('[AI Admin] isAdmin:', isAdmin, 'role:', user[0]?.role);

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required. Please contact your administrator.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});

export const aiAdminRouter = router({
  /**
   * Chat with AI Admin (no patch generation)
   */
  chat: adminProcedure
    .input(
      z.object({
        message: z.string().min(1, 'Message cannot be empty'),
        conversationHistory: z.array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = getAIAdminAgent();
        const response = await agent.chat(input.message, input.conversationHistory || []);
        
        return {
          success: true,
          message: response,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Chat failed: ${error}`,
        });
      }
    }),

  /**
   * Analyze the codebase
   */
  analyzeCodebase: adminProcedure.query(async () => {
    try {
      const agent = getAIAdminAgent();
      const analysis = await agent.analyzeCodebase();
      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Analysis failed: ${error}`,
      });
    }
  }),

  /**
   * Generate a patch from natural language request
   */
  generatePatch: adminProcedure
    .input(
      z.object({
        request: z.string().min(1, 'Request cannot be empty'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const agent = getAIAdminAgent();
        const patch = await agent.generatePatch(input.request);
        
        // Save patch to database for persistence across serverless instances
        console.log('[generatePatch] Original agent patch ID:', patch.id, 'Type:', typeof patch.id);
        const savedPatch = await patchStorage.savePatch(ctx.userId, patch);
        console.log('[generatePatch] Saved patch to database with UUID:', savedPatch.id, 'Type:', typeof savedPatch.id);
        
        // Return the saved patch with database UUID, not the original agent patch
        // Convert UUID and Date objects to strings for tRPC serialization
        const responseData = {
          id: String(savedPatch.id), // Convert UUID to string
          request: savedPatch.request,
          summary: savedPatch.summary,
          description: savedPatch.description || '',
          files: savedPatch.files,
          testingSteps: savedPatch.testingSteps || [],
          risks: savedPatch.risks || [],
          generatedAt: savedPatch.createdAt ? savedPatch.createdAt.toISOString() : new Date().toISOString(), // Convert Date to ISO string with fallback
          status: savedPatch.status,
        };
        console.log('[generatePatch] savedPatch.createdAt:', savedPatch.createdAt, 'Type:', typeof savedPatch.createdAt);
        console.log('[generatePatch] Returning patch ID to frontend:', responseData.id, 'Type:', typeof responseData.id);
        
        return {
          success: true,
          data: responseData,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Patch generation failed: ${error}`,
        });
      }
    }),

  /**
   * Apply a generated patch
   */
  applyPatch: adminProcedure
    .input(
      z.object({
        patchId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log('[applyPatch] Requested patch ID:', input.patchId, 'Type:', typeof input.patchId, 'Length:', input.patchId.length);
        console.log('[applyPatch] Patch ID bytes:', Array.from(input.patchId).map(c => c.charCodeAt(0)));
        
        // Get patch from database instead of in-memory storage
        const patch = await patchStorage.getPatch(input.patchId);
        console.log('[applyPatch] Found patch in database:', patch ? 'YES' : 'NO');
        if (patch) {
          console.log('[applyPatch] Retrieved patch ID from DB:', patch.id);
        }

        if (!patch) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Patch not found in database: ${input.patchId}`,
          });
        }

        const agent = getAIAdminAgent();
        const success = await agent.applyPatch(patch);
        
        // Update patch status in database
        await patchStorage.updatePatchStatus(
          input.patchId,
          success ? 'applied' : 'failed',
          success ? undefined : 'Application failed'
        );
        console.log('[applyPatch] Updated patch status:', success ? 'applied' : 'failed');

        return {
          success,
          data: patch,
        };
      } catch (error) {
        // Mark patch as failed in database
        try {
          await patchStorage.updatePatchStatus(
            input.patchId,
            'failed',
            String(error)
          );
        } catch (dbError) {
          console.error('[applyPatch] Failed to update patch status:', dbError);
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Patch application failed: ${error}`,
        });
      }
    }),

  /**
   * Rollback a patch
   */
  rollbackPatch: adminProcedure
    .input(
      z.object({
        patchId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = getAIAdminAgent();
        const success = await agent.rollbackPatch(input.patchId);

        return {
          success,
          message: success ? 'Patch rolled back successfully' : 'Rollback failed',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Rollback failed: ${error}`,
        });
      }
    }),

  /**
   * Get patch history
   */
  getPatchHistory: adminProcedure.query(async () => {
    try {
      const agent = getAIAdminAgent();
      const history = await agent.getPatchHistory();

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get patch history: ${error}`,
      });
    }
  }),

  /**
   * Get specific patch details
   */
  getPatch: adminProcedure
    .input(
      z.object({
        patchId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const agent = getAIAdminAgent();
        const patch = agent.getPatch(input.patchId);

        if (!patch) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Patch not found',
          });
        }

        return {
          success: true,
          data: patch,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get patch: ${error}`,
        });
      }
    }),

  /**
   * Execute a natural language command (generate + apply in one step)
   */
  executeCommand: adminProcedure
    .input(
      z.object({
        command: z.string().min(1, 'Command cannot be empty'),
        autoApply: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = getAIAdminAgent();

        // Generate patch
        const patch = await agent.generatePatch(input.command);

        // Auto-apply if requested
        if (input.autoApply) {
          const success = await agent.applyPatch(patch);
          return {
            success,
            data: patch,
            applied: success,
          };
        }

        return {
          success: true,
          data: patch,
          applied: false,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Command execution failed: ${error}`,
        });
      }
    }),
});

