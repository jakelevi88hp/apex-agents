/**
 * AI Admin Conversation Manager
 * 
 * Handles conversation persistence, message history, and branching
 */

import { db } from '@/lib/db';
import {
  aiConversations,
  aiMessages,
  aiUploadedFiles,
  type AIConversation,
  type NewAIConversation,
  type AIMessage,
  type NewAIMessage,
  type AIUploadedFile,
  type NewAIUploadedFile,
} from '@/lib/db/schema';
import { eq, desc, and, lte, sql } from 'drizzle-orm';

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  title?: string
): Promise<AIConversation> {
  const [conversation] = await db
    .insert(aiConversations)
    .values({
      userId,
      title: title || 'New Conversation',
    })
    .returning();

  return conversation;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
  userId: string,
  limit: number = 50
): Promise<AIConversation[]> {
  const conversations = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.userId, userId))
    .orderBy(desc(aiConversations.updatedAt))
    .limit(limit);

  return conversations;
}

/**
 * Get a specific conversation
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<AIConversation | null> {
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.id, conversationId),
        eq(aiConversations.userId, userId)
      )
    )
    .limit(1);

  return conversation || null;
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
): Promise<void> {
  await db
    .update(aiConversations)
    .set({ title, updatedAt: new Date() })
    .where(
      and(
        eq(aiConversations.id, conversationId),
        eq(aiConversations.userId, userId)
      )
    );
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  await db
    .delete(aiConversations)
    .where(
      and(
        eq(aiConversations.id, conversationId),
        eq(aiConversations.userId, userId)
      )
    );
}

// ============================================================================
// MESSAGE MANAGEMENT
// ============================================================================

/**
 * Save a message to a conversation
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<AIMessage> {
  const [message] = await db
    .insert(aiMessages)
    .values({
      conversationId,
      role,
      content,
      metadata,
    })
    .returning();

  // Update conversation's updatedAt timestamp
  await db
    .update(aiConversations)
    .set({ updatedAt: new Date() })
    .where(eq(aiConversations.id, conversationId));

  return message;
}

/**
 * Get conversation history (all messages)
 */
export async function getConversationHistory(
  conversationId: string,
  limit?: number
): Promise<AIMessage[]> {
  const query = db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(aiMessages.createdAt);

  if (limit) {
    query.limit(limit);
  }

  return await query;
}

/**
 * Get recent messages from a conversation
 */
export async function getRecentMessages(
  conversationId: string,
  count: number = 20
): Promise<AIMessage[]> {
  const messages = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(desc(aiMessages.createdAt))
    .limit(count);

  return messages.reverse(); // Return in chronological order
}

/**
 * Get messages with uploaded files
 */
export async function getMessagesWithFiles(
  conversationId: string
): Promise<Array<AIMessage & { files: AIUploadedFile[] }>> {
  const messages = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(aiMessages.createdAt);

  // Get files for each message
  const messagesWithFiles = await Promise.all(
    messages.map(async (message) => {
      const files = await db
        .select()
        .from(aiUploadedFiles)
        .where(eq(aiUploadedFiles.messageId, message.id));

      return { ...message, files };
    })
  );

  return messagesWithFiles;
}

// ============================================================================
// FILE MANAGEMENT
// ============================================================================

/**
 * Save uploaded file metadata
 */
export async function saveUploadedFile(
  messageId: string,
  fileData: Omit<NewAIUploadedFile, 'messageId'>
): Promise<AIUploadedFile> {
  const [file] = await db
    .insert(aiUploadedFiles)
    .values({
      messageId,
      ...fileData,
    })
    .returning();

  return file;
}

/**
 * Get files for a message
 */
export async function getMessageFiles(
  messageId: string
): Promise<AIUploadedFile[]> {
  return await db
    .select()
    .from(aiUploadedFiles)
    .where(eq(aiUploadedFiles.messageId, messageId));
}

// ============================================================================
// CONVERSATION BRANCHING
// ============================================================================

/**
 * Branch a conversation from a specific message
 */
export async function branchConversation(
  sourceConversationId: string,
  branchAtMessageId: string,
  userId: string,
  newTitle?: string
): Promise<AIConversation> {
  // Verify user owns the source conversation
  const sourceConv = await getConversation(sourceConversationId, userId);
  if (!sourceConv) {
    throw new Error('Source conversation not found');
  }

  // Create new conversation
  const [newConversation] = await db
    .insert(aiConversations)
    .values({
      userId,
      title: newTitle || `Branch from ${sourceConv.title}`,
      branchFromId: sourceConversationId,
      branchAtMessageId,
    })
    .returning();

  // Get messages up to branch point
  const branchPointMessage = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.id, branchAtMessageId))
    .limit(1);

  if (branchPointMessage.length === 0) {
    throw new Error('Branch point message not found');
  }

  const messagesToCopy = await db
    .select()
    .from(aiMessages)
    .where(
      and(
        eq(aiMessages.conversationId, sourceConversationId),
        lte(aiMessages.createdAt, branchPointMessage[0].createdAt)
      )
    )
    .orderBy(aiMessages.createdAt);

  // Copy messages to new conversation
  if (messagesToCopy.length > 0) {
    await db.insert(aiMessages).values(
      messagesToCopy.map((msg) => ({
        conversationId: newConversation.id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
      }))
    );
  }

  return newConversation;
}

/**
 * Get all branches of a conversation
 */
export async function getConversationBranches(
  conversationId: string,
  userId: string
): Promise<AIConversation[]> {
  return await db
    .select()
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.branchFromId, conversationId),
        eq(aiConversations.userId, userId)
      )
    )
    .orderBy(aiConversations.createdAt);
}

/**
 * Get conversation tree (including all nested branches)
 */
export async function getConversationTree(
  rootConversationId: string,
  userId: string
): Promise<ConversationTree> {
  const root = await getConversation(rootConversationId, userId);
  if (!root) {
    throw new Error('Root conversation not found');
  }

  const branches = await getConversationBranches(rootConversationId, userId);
  
  const tree: ConversationTree = {
    conversation: root,
    branches: await Promise.all(
      branches.map((branch) => getConversationTree(branch.id, userId))
    ),
  };

  return tree;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get conversation statistics
 */
export async function getConversationStats(
  conversationId: string
): Promise<ConversationStats> {
  const [stats] = await db
    .select({
      messageCount: sql<number>`count(*)`,
      userMessageCount: sql<number>`count(*) filter (where role = 'user')`,
      assistantMessageCount: sql<number>`count(*) filter (where role = 'assistant')`,
    })
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId));

  return {
    messageCount: Number(stats.messageCount) || 0,
    userMessageCount: Number(stats.userMessageCount) || 0,
    assistantMessageCount: Number(stats.assistantMessageCount) || 0,
  };
}

/**
 * Search conversations by title or content
 */
export async function searchConversations(
  userId: string,
  query: string,
  limit: number = 20
): Promise<AIConversation[]> {
  return await db
    .select()
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.userId, userId),
        sql`${aiConversations.title} ILIKE ${`%${query}%`}`
      )
    )
    .orderBy(desc(aiConversations.updatedAt))
    .limit(limit);
}

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationTree {
  conversation: AIConversation;
  branches: ConversationTree[];
}

export interface ConversationStats {
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
}

export interface MessageWithFiles extends AIMessage {
  files: AIUploadedFile[];
}
