/**
 * AGI Memory System Schema
 * 
 * Database schema for AGI memory persistence including:
 * - Episodic memory (personal experiences)
 * - Semantic memory (facts and knowledge)
 * - Working memory (current context)
 * - Conversation history
 */

import { pgTable, uuid, text, timestamp, real, integer, jsonb, index, varchar } from 'drizzle-orm/pg-core';
import { users } from '../schema';

// ============================================================================
// AGI EPISODIC MEMORY
// ============================================================================

export const agiEpisodicMemory = pgTable('agi_episodic_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  description: text('description').notNull(),
  context: jsonb('context'),
  emotionalValence: real('emotional_valence'), // -1.0 to 1.0 (negative to positive)
  emotionalArousal: real('emotional_arousal'), // 0.0 to 1.0 (calm to excited)
  importanceScore: real('importance_score'), // 0.0 to 1.0
  participants: jsonb('participants'),
  location: text('location'),
  outcome: text('outcome'),
  learnedLessons: jsonb('learned_lessons'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastAccessed: timestamp('last_accessed').defaultNow(),
  accessCount: integer('access_count').default(0).notNull(),
}, (table) => ({
  userIdx: index('agi_episodic_user_idx').on(table.userId),
  timestampIdx: index('agi_episodic_timestamp_idx').on(table.timestamp),
  eventTypeIdx: index('agi_episodic_event_type_idx').on(table.eventType),
  importanceIdx: index('agi_episodic_importance_idx').on(table.importanceScore),
}));

// ============================================================================
// AGI SEMANTIC MEMORY
// ============================================================================

export const agiSemanticMemory = pgTable('agi_semantic_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  concept: text('concept').notNull(),
  definition: text('definition'),
  category: varchar('category', { length: 100 }),
  properties: jsonb('properties'),
  relationships: jsonb('relationships'),
  examples: jsonb('examples'),
  confidence: real('confidence'), // 0.0 to 1.0
  source: text('source'),
  verificationStatus: varchar('verification_status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastAccessed: timestamp('last_accessed').defaultNow(),
  accessCount: integer('access_count').default(0).notNull(),
}, (table) => ({
  userIdx: index('agi_semantic_user_idx').on(table.userId),
  conceptIdx: index('agi_semantic_concept_idx').on(table.concept),
  categoryIdx: index('agi_semantic_category_idx').on(table.category),
  confidenceIdx: index('agi_semantic_confidence_idx').on(table.confidence),
}));

// ============================================================================
// AGI WORKING MEMORY
// ============================================================================

export const agiWorkingMemory = pgTable('agi_working_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull(),
  itemType: varchar('item_type', { length: 100 }).notNull(), // thought, observation, goal, constraint
  content: text('content').notNull(),
  priority: real('priority'), // 0.0 to 1.0
  activationLevel: real('activation_level'), // 0.0 to 1.0
  metadata: jsonb('metadata'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('agi_working_user_idx').on(table.userId),
  sessionIdx: index('agi_working_session_idx').on(table.sessionId),
  itemTypeIdx: index('agi_working_item_type_idx').on(table.itemType),
  expiresIdx: index('agi_working_expires_idx').on(table.expiresAt),
}));

// ============================================================================
// AGI CONVERSATION HISTORY
// ============================================================================

export const agiConversations = pgTable('agi_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title'),
  summary: text('summary'),
  emotionalTone: varchar('emotional_tone', { length: 50 }),
  topics: jsonb('topics'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  messageCount: integer('message_count').default(0).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('agi_conversations_user_idx').on(table.userId),
  startedIdx: index('agi_conversations_started_idx').on(table.startedAt),
}));

export const agiMessages = pgTable('agi_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => agiConversations.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // user, assistant, system
  content: text('content').notNull(),
  thoughts: jsonb('thoughts'),
  emotionalState: varchar('emotional_state', { length: 50 }),
  creativity: jsonb('creativity'),
  reasoning: jsonb('reasoning'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('agi_messages_conversation_idx').on(table.conversationId),
  roleIdx: index('agi_messages_role_idx').on(table.role),
  createdIdx: index('agi_messages_created_idx').on(table.createdAt),
}));

// ============================================================================
// AGI PROCEDURAL MEMORY
// ============================================================================

export const agiProceduralMemory = pgTable('agi_procedural_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  skillName: text('skill_name').notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  steps: jsonb('steps').notNull(),
  prerequisites: jsonb('prerequisites'),
  successCriteria: jsonb('success_criteria'),
  proficiencyLevel: real('proficiency_level'), // 0.0 to 1.0
  practiceCount: integer('practice_count').default(0).notNull(),
  successRate: real('success_rate'), // 0.0 to 1.0
  lastPracticed: timestamp('last_practiced'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('agi_procedural_user_idx').on(table.userId),
  skillIdx: index('agi_procedural_skill_idx').on(table.skillName),
  categoryIdx: index('agi_procedural_category_idx').on(table.category),
  proficiencyIdx: index('agi_procedural_proficiency_idx').on(table.proficiencyLevel),
}));

// ============================================================================
// AGI EMOTIONAL MEMORY
// ============================================================================

export const agiEmotionalMemory = pgTable('agi_emotional_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').references(() => agiEpisodicMemory.id, { onDelete: 'cascade' }),
  emotionType: varchar('emotion_type', { length: 50 }).notNull(), // joy, sadness, anger, fear, surprise, disgust
  intensity: real('intensity').notNull(), // 0.0 to 1.0
  valence: real('valence').notNull(), // -1.0 to 1.0 (negative to positive)
  arousal: real('arousal').notNull(), // 0.0 to 1.0 (calm to excited)
  trigger: text('trigger'),
  response: text('response'),
  regulation: jsonb('regulation'), // coping strategies used
  outcome: text('outcome'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('agi_emotional_user_idx').on(table.userId),
  eventIdx: index('agi_emotional_event_idx').on(table.eventId),
  emotionTypeIdx: index('agi_emotional_type_idx').on(table.emotionType),
  intensityIdx: index('agi_emotional_intensity_idx').on(table.intensity),
}));

// ============================================================================
// AGI CONSCIOUSNESS STATE
// ============================================================================

export const agiConsciousnessState = pgTable('agi_consciousness_state', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull(),
  consciousnessLevel: real('consciousness_level').notNull(), // 0.0 to 1.0
  attentionFocus: jsonb('attention_focus'),
  currentGoals: jsonb('current_goals'),
  metacognitiveState: jsonb('metacognitive_state'),
  emotionalState: jsonb('emotional_state'),
  creativityLevel: real('creativity_level'), // 0.0 to 1.0
  reasoningMode: varchar('reasoning_mode', { length: 50 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('agi_consciousness_user_idx').on(table.userId),
  sessionIdx: index('agi_consciousness_session_idx').on(table.sessionId),
  timestampIdx: index('agi_consciousness_timestamp_idx').on(table.timestamp),
}));
