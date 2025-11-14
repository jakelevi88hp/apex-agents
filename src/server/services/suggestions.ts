import { and, desc, eq, gte, sql } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm';
import { type NewUserSuggestion, type UserSuggestion, agents, executions, userSuggestions, workflows } from '@/lib/db/schema';
import type { db as database } from '@/lib/db';

type Database = typeof database;

/**
 * Service for generating and managing user suggestions and ideas.
 *
 * The service blends heuristic insights from user activity with automated idea
 * generation to provide actionable recommendations that can be surfaced in the UI.
 */
export class SuggestionService {
  /**
   * Generate and persist suggestions for a user.
   *
   * @param db - Drizzle database instance from the request context.
   * @param userId - Authenticated user identifier.
   * @param options - Optional generation configuration.
   * @returns Newly created suggestions.
   */
  static async generateSuggestionsForUser(
    db: Database,
    userId: string,
    options: { refreshExisting?: boolean; ideaCount?: number } = {},
  ): Promise<UserSuggestion[]> {
    try {
      if (options.refreshExisting) {
        // Archive active suggestions so refreshed ideas replace stale content.
        await db
          .update(userSuggestions)
          .set({ status: 'archived', updatedAt: new Date() })
          .where(and(eq(userSuggestions.userId, userId), eq(userSuggestions.status, 'new')));
      }

      // Gather usage metrics to drive predictions and ideas.
      const metrics = await this.getUsageMetrics(db, userId);
      // Build data-driven predictions from historical behaviour.
      const heuristicSuggestions = this.createHeuristicSuggestions(userId, metrics);
      // Create creative ideas using deterministic templates.
      const ideaSuggestions = this.createIdeaSuggestions(userId, metrics, options.ideaCount ?? 3);

      const suggestionsToInsert: Array<NewUserSuggestion> = [
        ...heuristicSuggestions,
        ...ideaSuggestions,
      ].map((suggestion) => ({
        ...suggestion,
        // Ensure timestamps exist even when relying on database defaults.
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      if (suggestionsToInsert.length === 0) {
        // Nothing to persist, so exit early.
        return [];
      }

      const inserted = await db.insert(userSuggestions).values(suggestionsToInsert).returning();
      return inserted;
    } catch (error) {
      console.error('Failed to generate suggestions', error);
      throw error;
    }
  }

  /**
   * Retrieve stored suggestions for a user with optional filters.
   *
   * @param db - Drizzle database instance from the request context.
   * @param userId - Authenticated user identifier.
   * @param filters - Optional filters such as status or limit.
   * @returns Matching suggestions ordered by recency.
   */
  static async getSuggestionsForUser(
    db: Database,
    userId: string,
    filters: { status?: string; limit?: number } = {},
  ): Promise<UserSuggestion[]> {
    try {
      const conditions: SQLWrapper[] = [eq(userSuggestions.userId, userId)];

      if (filters.status) {
        conditions.push(eq(userSuggestions.status, filters.status));
      }

      const limit = filters.limit ?? 12;

      const whereCondition =
        conditions.length === 1 ? conditions[0] : and(...conditions);

      return await db
        .select()
        .from(userSuggestions)
        // Apply composed filter conditions.
        .where(whereCondition)
        // Show newest items first.
        .orderBy(desc(userSuggestions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Failed to fetch suggestions', error);
      throw error;
    }
  }

  /**
   * Update the status of a suggestion, ensuring it belongs to the requesting user.
   *
   * @param db - Drizzle database instance from the request context.
   * @param userId - Authenticated user identifier.
   * @param suggestionId - Suggestion identifier.
   * @param status - New status value.
   * @returns Updated suggestion or null.
   */
  static async updateSuggestionStatus(
    db: Database,
    userId: string,
    suggestionId: string,
    status: 'acknowledged' | 'dismissed' | 'archived',
  ): Promise<UserSuggestion | null> {
    try {
      const [updated] = await db
        .update(userSuggestions)
        .set({ status, updatedAt: new Date(), resolvedAt: status === 'archived' ? new Date() : null })
        .where(and(eq(userSuggestions.id, suggestionId), eq(userSuggestions.userId, userId)))
        .returning();

      return updated ?? null;
    } catch (error) {
      console.error('Failed to update suggestion status', error);
      throw error;
    }
  }

  /**
   * Gather usage metrics used for heuristic and idea generation.
   *
   * @param db - Drizzle database instance.
   * @param userId - Authenticated user identifier.
   * @returns Aggregated usage metrics.
   */
  private static async getUsageMetrics(
    db: Database,
    userId: string,
  ): Promise<{
    activeAgents: number;
    workflowCount: number;
    executionsLast7Days: number;
    failedExecutionsLast7Days: number;
  }> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [agentMetric] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(and(eq(agents.userId, userId), eq(agents.status, 'active')));

    // Count how many workflows belong to the user.
    const [workflowMetric] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflows)
      .where(eq(workflows.userId, userId));

    // Capture how many executions ran in the last seven days.
    const [executionMetric] = await db
      .select({ count: sql<number>`count(*)` })
      .from(executions)
      .where(and(eq(executions.userId, userId), gte(executions.startedAt, sevenDaysAgo)));

    // Count failed executions to highlight troubleshooting opportunities.
    const [failedMetric] = await db
      .select({ count: sql<number>`count(*)` })
      .from(executions)
      .where(
        and(
          eq(executions.userId, userId),
          gte(executions.startedAt, sevenDaysAgo),
          eq(executions.status, 'failed'),
        ),
      );

    return {
      activeAgents: Number(agentMetric?.count ?? 0),
      workflowCount: Number(workflowMetric?.count ?? 0),
      executionsLast7Days: Number(executionMetric?.count ?? 0),
      failedExecutionsLast7Days: Number(failedMetric?.count ?? 0),
    };
  }

  /**
   * Produce heuristic suggestions from usage metrics.
   *
   * @param userId - Authenticated user identifier.
   * @param metrics - Aggregated usage metrics.
   * @returns Suggestion payloads ready for insertion.
   */
  private static createHeuristicSuggestions(
    userId: string,
    metrics: {
      activeAgents: number;
      workflowCount: number;
      executionsLast7Days: number;
      failedExecutionsLast7Days: number;
    },
  ): Array<NewUserSuggestion> {
    const suggestions: Array<NewUserSuggestion> = [];

    if (metrics.activeAgents < 2) {
      suggestions.push({
        userId,
        title: 'Activate a specialised agent',
        description:
          'You currently have fewer than two active agents. Consider training a specialised agent to handle repetitive tasks for you.',
        suggestionType: 'prediction',
        source: 'usage_insight',
        confidence: (0.75 + (2 - metrics.activeAgents) * 0.05).toFixed(2),
        impactScore: '0.80',
        status: 'new',
        metadata: {
          activeAgents: metrics.activeAgents,
          recommendation: 'create_agent',
        },
      });
    }

    if (metrics.workflowCount === 0) {
      suggestions.push({
        userId,
        title: 'Build your first automation workflow',
        description:
          'Kick off your productivity by creating a workflow that strings together multiple agents or tools.',
        suggestionType: 'prediction',
        source: 'usage_insight',
        confidence: '0.82',
        impactScore: '0.88',
        status: 'new',
        metadata: {
          workflowCount: metrics.workflowCount,
          recommendation: 'create_workflow',
        },
      });
    }

    if (metrics.executionsLast7Days === 0) {
      suggestions.push({
        userId,
        title: 'Schedule an automated run',
        description:
          'It looks like nothing has run in the past week. Schedule an automation to keep momentum without manual intervention.',
        suggestionType: 'prediction',
        source: 'usage_trend',
        confidence: '0.65',
        impactScore: '0.72',
        status: 'new',
        metadata: {
          executionsLast7Days: metrics.executionsLast7Days,
          recommendation: 'schedule_execution',
        },
      });
    }

    if (metrics.failedExecutionsLast7Days > 0) {
      suggestions.push({
        userId,
        title: 'Review recent failures',
        description:
          'Some executions failed in the last seven days. Investigate their logs and add retries or guards where needed.',
        suggestionType: 'prediction',
        source: 'usage_trend',
        confidence: '0.78',
        impactScore: '0.76',
        status: 'new',
        metadata: {
          failedExecutionsLast7Days: metrics.failedExecutionsLast7Days,
          recommendation: 'review_failures',
        },
      });
    }

    return suggestions;
  }

  /**
   * Generate creative idea suggestions using deterministic templates.
   *
   * @param userId - Authenticated user identifier.
   * @param metrics - Aggregated usage metrics.
   * @param ideaCount - Desired number of creative ideas.
   * @returns Creative idea suggestions ready for insertion.
   */
  private static createIdeaSuggestions(
    userId: string,
    metrics: {
      activeAgents: number;
      workflowCount: number;
      executionsLast7Days: number;
    },
    ideaCount: number,
  ): Array<NewUserSuggestion> {
    const ideaSeeds = [
      {
        title: 'Idea: onboarding workflow assistant',
        description:
          'Design a workflow that greets new teammates, gathers their preferences, and provisions the right agents automatically.',
        confidence: '0.58',
        impactScore: '0.83',
      },
      {
        title: 'Idea: insight digest agent',
        description:
          'Create an agent that compiles a daily digest from your knowledge base and recent executions to keep stakeholders aligned.',
        confidence: '0.62',
        impactScore: '0.78',
      },
      {
        title: 'Idea: proactive risk monitor',
        description:
          'Set up an agent to scan recent failures, predict potential issues, and notify you before they escalate.',
        confidence: '0.60',
        impactScore: '0.81',
      },
      {
        title: 'Idea: cross-agent collaboration hub',
        description:
          'Combine multiple agents into a coordination workflow that automatically splits and merges tasks based on complexity.',
        confidence: '0.57',
        impactScore: '0.85',
      },
      {
        title: 'Idea: adaptive scheduling intelligence',
        description:
          'Build an agent that learns when executions succeed most often and automatically reschedules runs for better success rates.',
        confidence: '0.55',
        impactScore: '0.79',
      },
    ];

    // Track current usage metrics in metadata for traceability.
    const contextMetadata = {
      activeAgents: metrics.activeAgents,
      workflowCount: metrics.workflowCount,
      executionsLast7Days: metrics.executionsLast7Days,
    };

    return ideaSeeds
      .slice(0, Math.max(1, ideaCount))
      .map<NewUserSuggestion>((idea) => ({
        userId,
        title: idea.title,
        description: idea.description,
        suggestionType: 'idea',
        source: 'creative_template',
        confidence: idea.confidence,
        impactScore: idea.impactScore,
        status: 'new',
        metadata: contextMetadata,
      }));
  }
}
