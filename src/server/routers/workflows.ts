import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { workflows, executions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getWorkflowExecutor } from '@/lib/workflow-engine/executor';

export const workflowsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(workflows).where(eq(workflows.userId, ctx.userId!));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      trigger: z.record(z.string(), z.any()),
      steps: z.array(z.record(z.string(), z.any())),
      agents: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const [workflow] = await ctx.db.insert(workflows).values({
        userId: ctx.userId!,
        ...input,
      }).returning();
      return workflow;
    }),

  execute: protectedProcedure
    .input(z.object({
      workflowId: z.string().uuid(),
      inputData: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const executor = getWorkflowExecutor();
        const result = await executor.executeWorkflow({
          workflowId: input.workflowId,
          userId: ctx.userId!,
          inputData: input.inputData,
          variables: {},
        });

        return {
          success: result.status === 'completed',
          executionId: result.executionId,
          data: result.outputData,
          durationMs: result.durationMs,
          error: result.errorMessage,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  getExecutionStatus: protectedProcedure
    .input(z.object({
      executionId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const [execution] = await ctx.db
        .select()
        .from(executions)
        .where(eq(executions.id, input.executionId));

      if (!execution) {
        throw new Error('Execution not found');
      }

      return execution;
    }),

  getExecutionHistory: protectedProcedure
    .input(z.object({
      workflowId: z.string().uuid(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(executions)
        .where(eq(executions.workflowId, input.workflowId))
        .orderBy(desc(executions.startedAt))
        .limit(input.limit);
    }),
});

