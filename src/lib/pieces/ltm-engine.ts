/**
 * LTM-2.7 (Long-Term Memory Engine)
 * 
 * Captures live context from workflow over a 7-day period, enhancing
 * ability to recall and access past materials.
 * 
 * Features:
 * - Contextual Recall: Remembers websites, code, snippets
 * - Natural Language Queries: Ask contextual questions about workflow
 * - Integrated Access: Available via API and UI
 */

import { db } from '@/lib/db';
import { ltmWorkflowContext, ltmQueries } from '@/lib/db/schema/pieces-features';
import { eq, and, gte, desc, sql, or, like } from 'drizzle-orm';
import { agiMemoryService } from '@/lib/agi/memory';

export interface WorkflowContext {
  id?: string;
  userId: string;
  contextType: 'website' | 'code' | 'snippet' | 'file' | 'document';
  title?: string;
  url?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  importance?: {
    score: number; // 0.0 to 1.0
    factors: string[];
  };
  accessedAt?: Date;
  expiresAt?: Date;
}

export interface NaturalLanguageQuery {
  id?: string;
  userId: string;
  query: string;
  resolvedAnchors?: Array<{
    url?: string;
    path?: string;
    contextId: string;
    confidence: number;
  }>;
  contextIds?: string[];
}

export class LTMEngine {
  private readonly RETENTION_DAYS = 7;

  /**
   * Capture workflow context (website visit, code snippet, file access, etc.)
   */
  async captureContext(context: WorkflowContext): Promise<string> {
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.RETENTION_DAYS);

    const result = await db.insert(ltmWorkflowContext).values({
      userId: context.userId,
      contextType: context.contextType,
      title: context.title,
      url: context.url,
      content: context.content,
      metadata: context.metadata,
      tags: context.tags,
      importance: context.importance,
      accessedAt: context.accessedAt || new Date(),
      expiresAt,
    }).returning({ id: ltmWorkflowContext.id });

    // Also store in AGI episodic memory for long-term retention
    if (context.importance && context.importance.score > 0.7) {
      await agiMemoryService.storeEpisodicMemory({
        userId: context.userId,
        timestamp: new Date(),
        eventType: `workflow_${context.contextType}`,
        description: context.title || context.url || 'Workflow context captured',
        context: {
          url: context.url,
          content: context.content?.substring(0, 500), // Truncate for memory
          metadata: context.metadata,
        },
        importanceScore: context.importance.score,
      });
    }

    return result[0].id;
  }

  /**
   * Get recent workflow context for a user
   */
  async getRecentContext(
    userId: string,
    contextType?: WorkflowContext['contextType'],
    limit: number = 20
  ): Promise<WorkflowContext[]> {
    const conditions = [
      eq(ltmWorkflowContext.userId, userId),
      gte(ltmWorkflowContext.expiresAt, new Date()), // Only non-expired
    ];

    if (contextType) {
      conditions.push(eq(ltmWorkflowContext.contextType, contextType));
    }

    const contexts = await db
      .select()
      .from(ltmWorkflowContext)
      .where(and(...conditions))
      .orderBy(desc(ltmWorkflowContext.accessedAt))
      .limit(limit);

    return contexts as WorkflowContext[];
  }

  /**
   * Search workflow context by query (natural language or keywords)
   */
  async searchContext(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<WorkflowContext[]> {
    // Search in title, content, and tags
    const searchTerm = `%${query.toLowerCase()}%`;

    const contexts = await db
      .select()
      .from(ltmWorkflowContext)
      .where(
        and(
          eq(ltmWorkflowContext.userId, userId),
          gte(ltmWorkflowContext.expiresAt, new Date()),
          or(
            like(sql`LOWER(${ltmWorkflowContext.title})`, searchTerm),
            like(sql`LOWER(${ltmWorkflowContext.content})`, searchTerm),
            sql`EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(${ltmWorkflowContext.tags}) tag
              WHERE LOWER(tag) LIKE ${searchTerm}
            )`
          )
        )
      )
      .orderBy(desc(ltmWorkflowContext.accessedAt))
      .limit(limit);

    return contexts as WorkflowContext[];
  }

  /**
   * Process natural language query and resolve anchors
   * Examples:
   * - "link to Firestore database I was working in last week"
   * - "summarize the brief on plugin updates in the Google doc Tim shared"
   */
  async processNaturalLanguageQuery(
    userId: string,
    query: string
  ): Promise<NaturalLanguageQuery> {
    // Extract keywords and time references from query
    const keywords = this.extractKeywords(query);
    const timeReference = this.extractTimeReference(query);

    // Search for relevant contexts
    const contexts = await this.searchContext(userId, keywords.join(' '), 20);

    // Filter by time if specified
    let filteredContexts = contexts;
    if (timeReference) {
      const cutoffDate = this.getDateFromTimeReference(timeReference);
      filteredContexts = contexts.filter(
        (ctx) => ctx.accessedAt && new Date(ctx.accessedAt) >= cutoffDate
      );
    }

    // Resolve anchors (URLs/paths) with confidence scores
    const resolvedAnchors = filteredContexts.map((ctx) => ({
      url: ctx.url,
      path: ctx.url?.startsWith('/') ? ctx.url : undefined,
      contextId: ctx.id!,
      confidence: this.calculateConfidence(query, ctx),
    })).sort((a, b) => b.confidence - a.confidence);

    // Store the query
    const result = await db.insert(ltmQueries).values({
      userId,
      query,
      resolvedAnchors,
      contextIds: filteredContexts.map((ctx) => ctx.id!),
    }).returning({ id: ltmQueries.id });

    return {
      id: result[0].id,
      userId,
      query,
      resolvedAnchors,
      contextIds: filteredContexts.map((ctx) => ctx.id!),
    };
  }

  /**
   * Get clickable URL or path for a context
   */
  async getContextAnchor(contextId: string): Promise<{ url?: string; path?: string } | null> {
    const contexts = await db
      .select()
      .from(ltmWorkflowContext)
      .where(eq(ltmWorkflowContext.id, contextId))
      .limit(1);

    if (contexts.length === 0) return null;

    const ctx = contexts[0];
    return {
      url: ctx.url || undefined,
      path: ctx.url?.startsWith('/') ? ctx.url : undefined,
    };
  }

  /**
   * Summarize content of a webpage/document from context
   */
  async summarizeContext(contextId: string): Promise<string> {
    const contexts = await db
      .select()
      .from(ltmWorkflowContext)
      .where(eq(ltmWorkflowContext.id, contextId))
      .limit(1);

    if (contexts.length === 0) {
      return 'Context not found';
    }

    const ctx = contexts[0];
    const content = ctx.content || ctx.title || 'No content available';

    // Simple summarization (in production, use LLM)
    if (content.length <= 200) {
      return content;
    }

    // Truncate and add summary indicator
    return `${content.substring(0, 200)}... [Full content available in context]`;
  }

  /**
   * Clean up expired contexts (older than 7 days)
   */
  async cleanupExpiredContexts(): Promise<number> {
    const result = await db
      .delete(ltmWorkflowContext)
      .where(sql`${ltmWorkflowContext.expiresAt} < NOW()`)
      .returning({ id: ltmWorkflowContext.id });

    return result.length;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private extractKeywords(query: string): string[] {
    // Simple keyword extraction (in production, use NLP)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'was', 'were', 'is', 'are']);
    const words = query.toLowerCase().split(/\s+/);
    return words.filter((word) => word.length > 2 && !stopWords.has(word));
  }

  private extractTimeReference(query: string): string | null {
    const timePatterns = [
      /last\s+(week|month|day)/i,
      /yesterday/i,
      /today/i,
      /this\s+(week|month)/i,
      /\d+\s+(days?|weeks?|months?)\s+ago/i,
    ];

    for (const pattern of timePatterns) {
      const match = query.match(pattern);
      if (match) return match[0];
    }

    return null;
  }

  private getDateFromTimeReference(reference: string): Date {
    const now = new Date();
    const lower = reference.toLowerCase();

    if (lower.includes('yesterday')) {
      now.setDate(now.getDate() - 1);
      return now;
    }

    if (lower.includes('last week') || lower.includes('week ago')) {
      now.setDate(now.getDate() - 7);
      return now;
    }

    if (lower.includes('last month') || lower.includes('month ago')) {
      now.setMonth(now.getMonth() - 1);
      return now;
    }

    // Default to 7 days ago
    now.setDate(now.getDate() - 7);
    return now;
  }

  private calculateConfidence(query: string, context: WorkflowContext): number {
    let confidence = 0.5; // Base confidence

    const queryLower = query.toLowerCase();
    const titleLower = (context.title || '').toLowerCase();
    const contentLower = (context.content || '').toLowerCase();

    // Title match increases confidence
    if (titleLower.includes(queryLower) || queryLower.includes(titleLower)) {
      confidence += 0.3;
    }

    // Content match increases confidence
    if (contentLower.includes(queryLower)) {
      confidence += 0.2;
    }

    // Importance score affects confidence
    if (context.importance) {
      confidence += context.importance.score * 0.2;
    }

    return Math.min(1.0, confidence);
  }
}

// Export singleton instance
export const ltmEngine = new LTMEngine();
