/**
 * AGI Conversation History Service
 * 
 * Manages conversation history with database persistence,
 * context tracking, and intelligent summarization.
 */

import { db } from '@/lib/db';
import { agiConversations, agiMessages } from '@/lib/db/schema/agi-memory';
import { eq, desc, and } from 'drizzle-orm';
import { agiMemoryService } from './memory';

export interface AGIMessage {
  id?: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thoughts?: any;
  emotionalState?: string;
  creativity?: any;
  reasoning?: any;
  metadata?: any;
  createdAt?: Date;
}

export interface AGIConversation {
  id?: string;
  userId: string;
  title?: string;
  summary?: string;
  emotionalTone?: string;
  topics?: any;
  startedAt?: Date;
  endedAt?: Date;
  messageCount?: number;
  metadata?: any;
}

export class AGIConversationService {
  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  async createConversation(userId: string, title?: string): Promise<string> {
    const result = await db.insert(agiConversations).values({
      userId,
      title: title || 'New Conversation',
      startedAt: new Date(),
      messageCount: 0,
    }).returning({ id: agiConversations.id });

    return result[0].id;
  }

  async getConversation(conversationId: string): Promise<AGIConversation | null> {
    const conversations = await db
      .select()
      .from(agiConversations)
      .where(eq(agiConversations.id, conversationId))
      .limit(1);

    return conversations.length > 0 ? (conversations[0] as AGIConversation) : null;
  }

  async getUserConversations(userId: string, limit: number = 20): Promise<AGIConversation[]> {
    const conversations = await db
      .select()
      .from(agiConversations)
      .where(eq(agiConversations.userId, userId))
      .orderBy(desc(agiConversations.startedAt))
      .limit(limit);

    return conversations as AGIConversation[];
  }

  async updateConversation(
    conversationId: string,
    updates: Partial<AGIConversation>
  ): Promise<void> {
    await db
      .update(agiConversations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(agiConversations.id, conversationId));
  }

  async endConversation(conversationId: string): Promise<void> {
    await db
      .update(agiConversations)
      .set({
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agiConversations.id, conversationId));
  }

  async deleteConversation(conversationId: string): Promise<void> {
    // Messages will be cascade deleted
    await db
      .delete(agiConversations)
      .where(eq(agiConversations.id, conversationId));
  }

  // ============================================================================
  // MESSAGE MANAGEMENT
  // ============================================================================

  async addMessage(message: AGIMessage): Promise<string> {
    const result = await db.insert(agiMessages).values({
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      thoughts: message.thoughts,
      emotionalState: message.emotionalState,
      creativity: message.creativity,
      reasoning: message.reasoning,
      metadata: message.metadata,
    }).returning({ id: agiMessages.id });

    // Update conversation message count
    await db
      .update(agiConversations)
      .set({
        messageCount: db.$count(agiMessages, eq(agiMessages.conversationId, message.conversationId)),
        updatedAt: new Date(),
      })
      .where(eq(agiConversations.id, message.conversationId));

    // Store important messages in episodic memory
    if (message.role === 'user' && message.content.length > 20) {
      const conversation = await this.getConversation(message.conversationId);
      if (conversation) {
        await agiMemoryService.storeEpisodicMemory({
          userId: conversation.userId,
          timestamp: new Date(),
          eventType: 'conversation',
          description: message.content,
          context: {
            conversationId: message.conversationId,
            messageId: result[0].id,
          },
          importanceScore: 0.6,
        });
      }
    }

    return result[0].id;
  }

  async getMessages(conversationId: string, limit: number = 50): Promise<AGIMessage[]> {
    const messages = await db
      .select()
      .from(agiMessages)
      .where(eq(agiMessages.conversationId, conversationId))
      .orderBy(agiMessages.createdAt)
      .limit(limit);

    return messages as AGIMessage[];
  }

  async getRecentMessages(conversationId: string, count: number = 10): Promise<AGIMessage[]> {
    const messages = await db
      .select()
      .from(agiMessages)
      .where(eq(agiMessages.conversationId, conversationId))
      .orderBy(desc(agiMessages.createdAt))
      .limit(count);

    return messages.reverse() as AGIMessage[];
  }

  async getConversationContext(conversationId: string, messageLimit: number = 10): Promise<{
    conversation: AGIConversation | null;
    recentMessages: AGIMessage[];
    summary: string;
  }> {
    const conversation = await this.getConversation(conversationId);
    const recentMessages = await this.getRecentMessages(conversationId, messageLimit);

    // Generate summary
    let summary = '';
    if (conversation?.summary) {
      summary = conversation.summary;
    } else if (recentMessages.length > 0) {
      summary = `Conversation with ${recentMessages.length} messages`;
      if (conversation?.topics) {
        summary += ` about ${JSON.stringify(conversation.topics)}`;
      }
    }

    return {
      conversation,
      recentMessages,
      summary,
    };
  }

  // ============================================================================
  // CONVERSATION ANALYSIS
  // ============================================================================

  async analyzeConversation(conversationId: string): Promise<{
    topics: string[];
    emotionalTone: string;
    summary: string;
    keyInsights: string[];
  }> {
    const messages = await this.getMessages(conversationId);

    // Extract topics (simple keyword extraction)
    const topics = this.extractTopics(messages);

    // Determine emotional tone
    const emotionalTone = this.determineEmotionalTone(messages);

    // Generate summary
    const summary = this.generateSummary(messages);

    // Extract key insights
    const keyInsights = this.extractKeyInsights(messages);

    // Update conversation with analysis
    await this.updateConversation(conversationId, {
      topics,
      emotionalTone,
      summary,
    });

    return {
      topics,
      emotionalTone,
      summary,
      keyInsights,
    };
  }

  private extractTopics(messages: AGIMessage[]): string[] {
    const topics = new Set<string>();
    const keywords = [
      'code', 'design', 'problem', 'solution', 'idea', 'project',
      'help', 'question', 'answer', 'explain', 'create', 'build',
      'fix', 'error', 'bug', 'feature', 'improve', 'optimize',
    ];

    for (const message of messages) {
      const content = message.content.toLowerCase();
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          topics.add(keyword);
        }
      }
    }

    return Array.from(topics).slice(0, 5);
  }

  private determineEmotionalTone(messages: AGIMessage[]): string {
    const emotionalStates = messages
      .filter(m => m.emotionalState)
      .map(m => m.emotionalState);

    if (emotionalStates.length === 0) return 'neutral';

    // Count emotional states
    const counts: Record<string, number> = {};
    for (const state of emotionalStates) {
      counts[state!] = (counts[state!] || 0) + 1;
    }

    // Find most common
    let maxCount = 0;
    let dominantEmotion = 'neutral';
    for (const [emotion, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  private generateSummary(messages: AGIMessage[]): string {
    if (messages.length === 0) return 'Empty conversation';

    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    let summary = `Conversation with ${messages.length} messages`;

    if (userMessages.length > 0) {
      const firstUserMessage = userMessages[0].content.substring(0, 100);
      summary += `. Started with: "${firstUserMessage}${firstUserMessage.length >= 100 ? '...' : ''}"`;
    }

    if (assistantMessages.length > 0) {
      summary += `. AGI provided ${assistantMessages.length} responses`;
    }

    return summary;
  }

  private extractKeyInsights(messages: AGIMessage[]): string[] {
    const insights: string[] = [];

    // Extract insights from assistant messages with reasoning
    for (const message of messages) {
      if (message.role === 'assistant' && message.reasoning) {
        const reasoning = message.reasoning as any;
        if (reasoning.conclusion) {
          insights.push(reasoning.conclusion);
        }
      }
    }

    return insights.slice(0, 5);
  }

  // ============================================================================
  // CONVERSATION SEARCH
  // ============================================================================

  async searchConversations(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<AGIConversation[]> {
    // Simple search by title and summary
    const conversations = await db
      .select()
      .from(agiConversations)
      .where(
        and(
          eq(agiConversations.userId, userId),
          // Note: This is a simple implementation. For production, use full-text search
        )
      )
      .orderBy(desc(agiConversations.startedAt))
      .limit(limit);

    // Filter by query
    return conversations.filter(conv => 
      conv.title?.toLowerCase().includes(query.toLowerCase()) ||
      conv.summary?.toLowerCase().includes(query.toLowerCase())
    ) as AGIConversation[];
  }

  // ============================================================================
  // CONVERSATION EXPORT
  // ============================================================================

  async exportConversation(conversationId: string): Promise<{
    conversation: AGIConversation | null;
    messages: AGIMessage[];
    analysis: any;
  }> {
    const conversation = await this.getConversation(conversationId);
    const messages = await this.getMessages(conversationId);
    const analysis = await this.analyzeConversation(conversationId);

    return {
      conversation,
      messages,
      analysis,
    };
  }
}

// Export singleton instance
export const agiConversationService = new AGIConversationService();
