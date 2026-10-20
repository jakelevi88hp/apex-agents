import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { requireCanRun } from '../middleware/subscription';
import { executeAgent, getExecutionHistory, getExecution } from '@/lib/agent-execution/executor';

export const executionRouter = router({
  execute: protectedProcedure
    .use(requireCanRun)
    .input(z.object({
      agentId: z.string().uuid(),
      input: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await executeAgent({
        agentId: input.agentId,
        input: input.input,
        userId: ctx.userId!,
      });
      
      return result;
    }),

  getHistory: protectedProcedure
    .input(z.object({
      agentId: z.string().uuid(),
      limit: z.number().min(1).max(100).optional(),
    }))
    .query(async ({ input, ctx }) => {
      return await getExecutionHistory(input.agentId, ctx.userId!, input.limit);
    }),

  getByAgent: protectedProcedure
    .input(z.object({
      agentId: z.string().uuid(),
      limit: z.number().min(1).max(100).optional().default(50),
    }))
    .query(async ({ input, ctx }) => {
      return await getExecutionHistory(input.agentId, ctx.userId!, input.limit);
    }),

  getById: protectedProcedure
    .input(z.object({
      executionId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      return await getExecution(input.executionId, ctx.userId!);
    }),
});

