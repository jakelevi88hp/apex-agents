import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { workflows, executions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const workflowsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(workflows).where(eq(workflows.userId, ctx.userId!));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      trigger: z.record(z.any()),
      steps: z.array(z.record(z.any())),
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
      inputData: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [workflow] = await ctx.db.select().from(workflows).where(eq(workflows.id, input.workflowId));
      
      if (!workflow) throw new Error('Workflow not found');

      const [execution] = await ctx.db.insert(executions).values({
        workflowId: workflow.id,
        userId: ctx.userId!,
        status: 'running',
        inputData: input.inputData,
      }).returning();

      return { executionId: execution.id };
    }),
});

