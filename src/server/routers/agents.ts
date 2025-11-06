import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { agents, executions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { AgentFactory } from '@/lib/ai/agents';
import { checkUsageLimit } from '../middleware/subscription';

export const agentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(agents).where(eq(agents.userId, ctx.userId!));
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db.select().from(agents).where(eq(agents.id, input.id));
      return agent;
    }),

  create: protectedProcedure
    .use(checkUsageLimit('agents', 1))
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      type: z.enum(['research', 'analysis', 'writing', 'code', 'decision', 'communication', 'monitoring', 'orchestrator', 'custom']),
      config: z.record(z.string(), z.any()),
      capabilities: z.record(z.string(), z.boolean()).or(z.array(z.string())),
      constraints: z.record(z.string(), z.any()).optional(),
      promptTemplate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [newAgent] = await ctx.db.insert(agents).values({
        userId: ctx.userId!,
        ...input,
      }).returning();
      return newAgent;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      description: z.string().optional(),
      config: z.record(z.string(), z.any()).optional(),
      status: z.enum(['active', 'inactive', 'archived']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [updated] = await ctx.db.update(agents)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(agents.id, id))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(agents).where(eq(agents.id, input.id));
      return { success: true };
    }),

  execute: protectedProcedure
    .input(z.object({
      agentId: z.string().uuid(),
      objective: z.string(),
      context: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db.select().from(agents).where(eq(agents.id, input.agentId));
      
      if (!agent) throw new Error('Agent not found');

      const agentInstance = AgentFactory.createAgent({
        id: agent.id,
        name: agent.name,
        type: agent.type as any,
        model: (agent.config as any).model || 'gpt-4-turbo',
        tools: (agent.config as any).tools || [],
        capabilities: (agent.capabilities as any) || [],
      });

      const [execution] = await ctx.db.insert(executions).values({
        agentId: agent.id,
        userId: ctx.userId!,
        status: 'running',
        inputData: { objective: input.objective, context: input.context },
      }).returning();

      try {
        const result = await agentInstance.execute(input.objective, input.context);

        await ctx.db.update(executions)
          .set({
            status: 'completed',
            outputData: result,
            completedAt: new Date(),
            durationMs: Date.now() - execution.startedAt.getTime(),
          })
          .where(eq(executions.id, execution.id));

        return { executionId: execution.id, result };
      } catch (error: any) {
        await ctx.db.update(executions)
          .set({
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          })
          .where(eq(executions.id, execution.id));

        throw error;
      }
    }),

  getExecutions: protectedProcedure
    .input(z.object({ agentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select()
        .from(executions)
        .where(eq(executions.agentId, input.agentId))
        .orderBy(desc(executions.startedAt))
        .limit(50);
    }),
});

