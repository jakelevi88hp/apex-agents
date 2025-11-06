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
        await patchStorage.savePatch(ctx.userId, patch);
        console.log('[generatePatch] Saved patch to database:', patch.id);
        
        return {
          success: true,
          data: patch,
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
        console.log('[applyPatch] Requested patch ID:', input.patchId);
        
        // Get patch from database instead of in-memory storage
        const patch = await patchStorage.getPatch(input.patchId);
        console.log('[applyPatch] Found patch in database:', patch ? 'YES' : 'NO');

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
      const history = agent.getPatchHistory();

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

