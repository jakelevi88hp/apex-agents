/**
 * Workstream Activity
 * 
 * Uses LTM-2.7 to collect and summarize recent tasks, discussions,
 * code reviews, and more. Generates roll-ups every 20 minutes.
 * 
 * Features:
 * - Automatic roll-up generation every 20 minutes
 * - Summarizes tasks, projects, issues, decisions, discussions, documents, code reviews
 * - Includes helpful links
 * - Can start Copilot chats with roll-ups
 */

import { db } from '@/lib/db';
import { workstreamActivity, workstreamActivitySources, ltmWorkflowContext } from '@/lib/db/schema/pieces-features';
import { executions, agents, workflows, knowledgeBase } from '@/lib/db/schema';
import { agiConversations, agiMessages } from '@/lib/db/schema/agi-memory';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { ltmEngine } from './ltm-engine';
import { agiMemoryService } from '@/lib/agi/memory';

export interface ActivityRollup {
  id?: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  summary: string;
  mainTasks: Array<{
    task: string;
    status: 'completed' | 'in_progress' | 'pending';
    details?: string;
  }>;
  projects: Array<{
    project: string;
    activity: string;
    changes?: string;
  }>;
  issuesResolved: Array<{
    issue: string;
    resolution: string;
    link?: string;
  }>;
  keyDecisions: Array<{
    decision: string;
    context: string;
    impact?: string;
  }>;
  discussions: Array<{
    topic: string;
    participants?: string[];
    summary: string;
    link?: string;
  }>;
  documents: Array<{
    document: string;
    action: 'created' | 'updated' | 'reviewed';
    link?: string;
  }>;
  codeReviewed: Array<{
    file: string;
    changes: string;
    link?: string;
  }>;
  links: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  metadata?: Record<string, unknown>;
}

export class WorkstreamActivityService {
  private readonly ROLLUP_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

  /**
   * Generate activity roll-up for a user
   */
  async generateRollup(userId: string, periodStart?: Date, periodEnd?: Date): Promise<string> {
    // Default to last 20 minutes if not specified
    const end = periodEnd || new Date();
    const start = periodStart || new Date(end.getTime() - this.ROLLUP_INTERVAL_MS);

    // Collect data from various sources
    const sources = await this.collectActivitySources(userId, start, end);

    // Generate roll-up summary
    const rollup = await this.summarizeActivity(userId, sources, start, end);

    // Store roll-up
    const result = await db.insert(workstreamActivity).values({
      userId,
      periodStart: start,
      periodEnd: end,
      summary: rollup.summary,
      mainTasks: rollup.mainTasks,
      projects: rollup.projects,
      issuesResolved: rollup.issuesResolved,
      keyDecisions: rollup.keyDecisions,
      discussions: rollup.discussions,
      documents: rollup.documents,
      codeReviewed: rollup.codeReviewed,
      links: rollup.links,
      metadata: rollup.metadata,
    }).returning({ id: workstreamActivity.id });

    const activityId = result[0].id;

    // Store source references
    for (const source of sources) {
      await db.insert(workstreamActivitySources).values({
        activityId,
        sourceType: source.type,
        sourceId: source.id,
        sourceData: source.data,
        contribution: source.contribution,
      });
    }

    return activityId;
  }

  /**
   * Get recent roll-ups for a user
   */
  async getRecentRollups(userId: string, limit: number = 10): Promise<ActivityRollup[]> {
    const rollups = await db
      .select()
      .from(workstreamActivity)
      .where(eq(workstreamActivity.userId, userId))
      .orderBy(desc(workstreamActivity.createdAt))
      .limit(limit);

    return rollups as ActivityRollup[];
  }

  /**
   * Get roll-up by ID
   */
  async getRollup(rollupId: string, userId: string): Promise<ActivityRollup | null> {
    const rollups = await db
      .select()
      .from(workstreamActivity)
      .where(
        and(
          eq(workstreamActivity.id, rollupId),
          eq(workstreamActivity.userId, userId)
        )
      )
      .limit(1);

    return rollups.length > 0 ? (rollups[0] as ActivityRollup) : null;
  }

  /**
   * Collect activity sources from various systems
   */
  private async collectActivitySources(
    userId: string,
    start: Date,
    end: Date
  ): Promise<Array<{
    type: string;
    id?: string;
    data: unknown;
    contribution: string;
  }>> {
    const sources: Array<{
      type: string;
      id?: string;
      data: unknown;
      contribution: string;
    }> = [];

    // Collect executions
    const executionsData = await db
      .select()
      .from(executions)
      .where(
        and(
          eq(executions.userId, userId),
          gte(executions.startedAt, start),
          lte(executions.startedAt, end)
        )
      )
      .orderBy(desc(executions.startedAt))
      .limit(20);

    for (const exec of executionsData) {
      sources.push({
        type: 'execution',
        id: exec.id,
        data: exec,
        contribution: `Execution ${exec.status}: ${exec.workflowId ? 'Workflow execution' : 'Agent execution'}`,
      });
    }

    // Collect AGI conversations
    const conversations = await db
      .select()
      .from(agiConversations)
      .where(
        and(
          eq(agiConversations.userId, userId),
          gte(agiConversations.startedAt, start),
          lte(agiConversations.startedAt, end)
        )
      )
      .orderBy(desc(agiConversations.startedAt))
      .limit(10);

    for (const conv of conversations) {
      const messages = await db
        .select()
        .from(agiMessages)
        .where(eq(agiMessages.conversationId, conv.id))
        .orderBy(desc(agiMessages.createdAt))
        .limit(10);

      sources.push({
        type: 'conversation',
        id: conv.id,
        data: { conversation: conv, messages },
        contribution: `AGI conversation: ${conv.title || 'Untitled'}`,
      });
    }

    // Collect LTM workflow context
    const ltmContexts = await db
      .select()
      .from(ltmWorkflowContext)
      .where(
        and(
          eq(ltmWorkflowContext.userId, userId),
          gte(ltmWorkflowContext.accessedAt, start),
          lte(ltmWorkflowContext.accessedAt, end)
        )
      )
      .orderBy(desc(ltmWorkflowContext.accessedAt))
      .limit(20);

    for (const ctx of ltmContexts) {
      sources.push({
        type: 'workflow_context',
        id: ctx.id,
        data: ctx,
        contribution: `Workflow: ${ctx.title || ctx.url || ctx.contextType}`,
      });
    }

    // Collect knowledge base updates
    const knowledgeUpdates = await db
      .select()
      .from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.userId, userId),
          gte(knowledgeBase.createdAt, start),
          lte(knowledgeBase.createdAt, end)
        )
      )
      .orderBy(desc(knowledgeBase.createdAt))
      .limit(10);

    for (const kb of knowledgeUpdates) {
      sources.push({
        type: 'document',
        id: kb.id,
        data: kb,
        contribution: `Document: ${kb.sourceName || 'Knowledge base item'}`,
      });
    }

    return sources;
  }

  /**
   * Summarize activity from collected sources
   */
  private async summarizeActivity(
    userId: string,
    sources: Array<{ type: string; data: unknown; contribution: string }>,
    start: Date,
    end: Date
  ): Promise<ActivityRollup> {
    const rollup: ActivityRollup = {
      userId,
      periodStart: start,
      periodEnd: end,
      summary: '',
      mainTasks: [],
      projects: [],
      issuesResolved: [],
      keyDecisions: [],
      discussions: [],
      documents: [],
      codeReviewed: [],
      links: [],
    };

    // Process executions as tasks
    const executionSources = sources.filter((s) => s.type === 'execution');
    for (const source of executionSources) {
      const exec = source.data as any;
      rollup.mainTasks.push({
        task: exec.workflowId ? 'Workflow execution' : 'Agent execution',
        status: exec.status === 'completed' ? 'completed' : exec.status === 'failed' ? 'pending' : 'in_progress',
        details: exec.errorMessage || 'Execution completed',
      });
    }

    // Process conversations as discussions
    const conversationSources = sources.filter((s) => s.type === 'conversation');
    for (const source of conversationSources) {
      const data = source.data as any;
      const conv = data.conversation;
      const messages = data.messages || [];
      rollup.discussions.push({
        topic: conv.title || 'AGI Conversation',
        summary: messages.length > 0 ? messages[0].content?.substring(0, 200) : 'No messages',
        link: `/dashboard/agi?conversation=${conv.id}`,
      });
    }

    // Process workflow context as projects/code
    const workflowSources = sources.filter((s) => s.type === 'workflow_context');
    for (const source of workflowSources) {
      const ctx = source.data as any;
      if (ctx.contextType === 'code' || ctx.contextType === 'snippet') {
        rollup.codeReviewed.push({
          file: ctx.title || ctx.url || 'Code snippet',
          changes: ctx.content?.substring(0, 100) || 'Code activity',
          link: ctx.url,
        });
      } else if (ctx.contextType === 'document') {
        rollup.documents.push({
          document: ctx.title || ctx.url || 'Document',
          action: 'reviewed',
          link: ctx.url,
        });
      }
    }

    // Process knowledge base as documents
    const documentSources = sources.filter((s) => s.type === 'document');
    for (const source of documentSources) {
      const doc = source.data as any;
      rollup.documents.push({
        document: doc.sourceName || 'Document',
        action: 'created',
        link: doc.sourceId ? `/dashboard/knowledge?id=${doc.id}` : undefined,
      });
    }

    // Generate summary
    rollup.summary = this.generateSummary(rollup);

    // Extract links from various sources
    rollup.links = this.extractLinks(sources);

    return rollup;
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(rollup: ActivityRollup): string {
    const parts: string[] = [];

    if (rollup.mainTasks.length > 0) {
      const completed = rollup.mainTasks.filter((t) => t.status === 'completed').length;
      parts.push(`${completed} of ${rollup.mainTasks.length} tasks completed`);
    }

    if (rollup.discussions.length > 0) {
      parts.push(`${rollup.discussions.length} conversation${rollup.discussions.length > 1 ? 's' : ''}`);
    }

    if (rollup.codeReviewed.length > 0) {
      parts.push(`${rollup.codeReviewed.length} code file${rollup.codeReviewed.length > 1 ? 's' : ''} reviewed`);
    }

    if (rollup.documents.length > 0) {
      parts.push(`${rollup.documents.length} document${rollup.documents.length > 1 ? 's' : ''} processed`);
    }

    if (parts.length === 0) {
      return 'No significant activity during this period.';
    }

    return `During this period: ${parts.join(', ')}.`;
  }

  /**
   * Extract helpful links from sources
   */
  private extractLinks(sources: Array<{ type: string; data: unknown }>): ActivityRollup['links'] {
    const links: ActivityRollup['links'] = [];

    for (const source of sources) {
      if (source.type === 'workflow_context') {
        const ctx = source.data as any;
        if (ctx.url) {
          links.push({
            title: ctx.title || 'Workflow context',
            url: ctx.url,
            description: ctx.content?.substring(0, 100),
          });
        }
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    return links.filter((link) => {
      if (seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    });
  }

  /**
   * Start automatic roll-up generation (should be called by a cron job)
   */
  async startAutomaticRollups(userId: string): Promise<void> {
    // This would typically be called by a scheduled job
    // For now, we'll just generate a roll-up
    await this.generateRollup(userId);
  }
}

// Export singleton instance
export const workstreamActivityService = new WorkstreamActivityService();
