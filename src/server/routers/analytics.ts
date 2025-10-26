/**
 * Analytics tRPC Router
 * 
 * Provides real-time metrics from the database
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/lib/db';
import { agents, workflows, executions } from '@/lib/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

export const analyticsRouter = router({
  /**
   * Get dashboard metrics
   */
  getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Get active agents count
    const activeAgents = await db
      .select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(and(eq(agents.userId, userId), eq(agents.status, 'active')));

    // Get workflows count
    const workflowsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflows)
      .where(eq(workflows.userId, userId));

    // Get today's executions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayExecutions = await db
      .select({ count: sql<number>`count(*)` })
      .from(executions)
      .where(and(eq(executions.userId, userId), gte(executions.startedAt, today)));

    // Get yesterday's executions for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayExecutions = await db
      .select({ count: sql<number>`count(*)` })
      .from(executions)
      .where(
        and(
          eq(executions.userId, userId),
          gte(executions.startedAt, yesterday),
          sql`${executions.startedAt} < ${today}`
        )
      );

    // Calculate percentage change
    const todayCount = Number(todayExecutions[0]?.count || 0);
    const yesterdayCount = Number(yesterdayExecutions[0]?.count || 0);
    const percentChange =
      yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : 0;

    return {
      activeAgents: Number(activeAgents[0]?.count || 0),
      workflows: Number(workflowsCount[0]?.count || 0),
      executionsToday: todayCount,
      executionsTrend: {
        change: percentChange,
        direction: percentChange >= 0 ? 'up' : 'down',
      },
    };
  }),

  /**
   * Get sparkline data for last 7 days
   */
  getSparklineData: protectedProcedure
    .input(
      z.object({
        metric: z.enum(['agents', 'workflows', 'executions']),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const days = 7;
      const data: number[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        if (input.metric === 'executions') {
          const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(executions)
            .where(
              and(
                eq(executions.userId, userId),
                gte(executions.startedAt, date),
                sql`${executions.startedAt} < ${nextDate}`
              )
            );

          data.push(Number(result[0]?.count || 0));
        } else if (input.metric === 'agents') {
          const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(agents)
            .where(
              and(
                eq(agents.userId, userId),
                eq(agents.status, 'active'),
                sql`${agents.createdAt} <= ${nextDate}`
              )
            );

          data.push(Number(result[0]?.count || 0));
        } else if (input.metric === 'workflows') {
          const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(workflows)
            .where(
              and(
                eq(workflows.userId, userId),
                sql`${workflows.createdAt} <= ${nextDate}`
              )
            );

          data.push(Number(result[0]?.count || 0));
        }
      }

      return data;
    }),

  /**
   * Get recent activity
   */
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const recentExecutions = await db
        .select({
          id: executions.id,
          status: executions.status,
          startedAt: executions.startedAt,
          completedAt: executions.completedAt,
          durationMs: executions.durationMs,
          workflowId: executions.workflowId,
          agentId: executions.agentId,
        })
        .from(executions)
        .where(eq(executions.userId, userId))
        .orderBy(desc(executions.startedAt))
        .limit(input.limit);

      // Get workflow and agent names
      const activity = await Promise.all(
        recentExecutions.map(async (execution) => {
          let name = 'Unknown';
          let type = 'execution';

          if (execution.workflowId) {
            const workflow = await db
              .select({ name: workflows.name })
              .from(workflows)
              .where(eq(workflows.id, execution.workflowId))
              .limit(1);

            if (workflow[0]) {
              name = workflow[0].name;
              type = 'workflow';
            }
          } else if (execution.agentId) {
            const agent = await db
              .select({ name: agents.name })
              .from(agents)
              .where(eq(agents.id, execution.agentId))
              .limit(1);

            if (agent[0]) {
              name = agent[0].name;
              type = 'agent';
            }
          }

          return {
            id: execution.id,
            name,
            type,
            status: execution.status,
            startedAt: execution.startedAt,
            completedAt: execution.completedAt,
            durationMs: execution.durationMs,
          };
        })
      );

      return activity;
    }),

  /**
   * Get execution statistics
   */
  getExecutionStats: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const stats = await db
        .select({
          total: sql<number>`count(*)`,
          completed: sql<number>`count(*) filter (where ${executions.status} = 'completed')`,
          failed: sql<number>`count(*) filter (where ${executions.status} = 'failed')`,
          running: sql<number>`count(*) filter (where ${executions.status} = 'running')`,
          avgDuration: sql<number>`avg(${executions.durationMs})`,
          totalCost: sql<number>`sum(${executions.costUsd})`,
          totalTokens: sql<number>`sum(${executions.tokensUsed})`,
        })
        .from(executions)
        .where(and(eq(executions.userId, userId), gte(executions.startedAt, startDate)));

      const result = stats[0] || {};

      return {
        total: Number(result.total || 0),
        completed: Number(result.completed || 0),
        failed: Number(result.failed || 0),
        running: Number(result.running || 0),
        successRate:
          Number(result.total || 0) > 0
            ? (Number(result.completed || 0) / Number(result.total || 0)) * 100
            : 0,
        avgDurationMs: Number(result.avgDuration || 0),
        totalCostUsd: Number(result.totalCost || 0),
        totalTokens: Number(result.totalTokens || 0),
      };
    }),

  /**
   * Get agent performance metrics
   */
  getAgentPerformance: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const agentStats = await db
      .select({
        agentId: executions.agentId,
        count: sql<number>`count(*)`,
        successRate: sql<number>`
          (count(*) filter (where ${executions.status} = 'completed')::float / count(*)) * 100
        `,
        avgDuration: sql<number>`avg(${executions.durationMs})`,
      })
      .from(executions)
      .where(and(eq(executions.userId, userId), sql`${executions.agentId} is not null`))
      .groupBy(executions.agentId);

    // Get agent names
    const performance = await Promise.all(
      agentStats.map(async (stat) => {
        if (!stat.agentId) return null;

        const agent = await db
          .select({ name: agents.name, type: agents.type })
          .from(agents)
          .where(eq(agents.id, stat.agentId))
          .limit(1);

        if (!agent[0]) return null;

        return {
          agentId: stat.agentId,
          name: agent[0].name,
          type: agent[0].type,
          executionCount: Number(stat.count || 0),
          successRate: Number(stat.successRate || 0),
          avgDurationMs: Number(stat.avgDuration || 0),
        };
      })
    );

    return performance.filter((p) => p !== null);
  }),

  /**
   * Get workflow performance metrics
   */
  getWorkflowPerformance: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const workflowStats = await db
      .select({
        workflowId: executions.workflowId,
        count: sql<number>`count(*)`,
        successRate: sql<number>`
          (count(*) filter (where ${executions.status} = 'completed')::float / count(*)) * 100
        `,
        avgDuration: sql<number>`avg(${executions.durationMs})`,
      })
      .from(executions)
      .where(and(eq(executions.userId, userId), sql`${executions.workflowId} is not null`))
      .groupBy(executions.workflowId);

    // Get workflow names
    const performance = await Promise.all(
      workflowStats.map(async (stat) => {
        if (!stat.workflowId) return null;

        const workflow = await db
          .select({ name: workflows.name })
          .from(workflows)
          .where(eq(workflows.id, stat.workflowId))
          .limit(1);

        if (!workflow[0]) return null;

        return {
          workflowId: stat.workflowId,
          name: workflow[0].name,
          executionCount: Number(stat.count || 0),
          successRate: Number(stat.successRate || 0),
          avgDurationMs: Number(stat.avgDuration || 0),
        };
      })
    );

    return performance.filter((p) => p !== null);
  }),
});

