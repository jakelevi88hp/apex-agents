/**
 * AGI Memory System - TypeScript Implementation
 * 
 * Advanced memory system with database persistence for:
 * - Episodic memory (personal experiences)
 * - Semantic memory (facts and knowledge)
 * - Working memory (current context)
 * - Procedural memory (skills and procedures)
 * - Emotional memory (emotionally charged experiences)
 */

import { db } from '@/lib/db';
import {
  agiEpisodicMemory,
  agiSemanticMemory,
  agiWorkingMemory,
  agiProceduralMemory,
  agiEmotionalMemory,
  agiConsciousnessState,
} from '@/lib/db/schema/agi-memory';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export interface EpisodicMemory {
  id?: string;
  userId?: string;
  timestamp: Date;
  eventType: string;
  description: string;
  context?: unknown;
  emotionalValence?: number; // -1.0 to 1.0
  emotionalArousal?: number; // 0.0 to 1.0
  importanceScore?: number; // 0.0 to 1.0
  participants?: unknown;
  location?: string;
  outcome?: string;
  learnedLessons?: unknown;
}

export interface SemanticMemory {
  id?: string;
  userId?: string;
  concept: string;
  definition?: string;
  category?: string;
  properties?: unknown;
  relationships?: unknown;
  examples?: unknown;
  confidence?: number; // 0.0 to 1.0
  source?: string;
  verificationStatus?: string;
}

export interface WorkingMemoryItem {
  id?: string;
  userId?: string;
  sessionId: string;
  itemType: string; // thought, observation, goal, constraint
  content: string;
  priority?: number; // 0.0 to 1.0
  activationLevel?: number; // 0.0 to 1.0
  metadata?: unknown;
  expiresAt?: Date;
}

export interface ProceduralMemory {
  id?: string;
  userId?: string;
  skillName: string;
  description?: string;
  category?: string;
  steps: unknown;
  prerequisites?: unknown;
  successCriteria?: unknown;
  proficiencyLevel?: number; // 0.0 to 1.0
  practiceCount?: number;
  successRate?: number; // 0.0 to 1.0
  lastPracticed?: Date;
}

export interface EmotionalMemory {
  id?: string;
  userId?: string;
  eventId?: string;
  emotionType: string;
  intensity: number; // 0.0 to 1.0
  valence: number; // -1.0 to 1.0
  arousal: number; // 0.0 to 1.0
  trigger?: string;
  response?: string;
  regulation?: unknown;
  outcome?: string;
}

export interface ConsciousnessState {
  id?: string;
  userId?: string;
  sessionId: string;
  consciousnessLevel: number; // 0.0 to 1.0
  attentionFocus?: unknown;
  currentGoals?: unknown;
  metacognitiveState?: unknown;
  emotionalState?: unknown;
  creativityLevel?: number; // 0.0 to 1.0
  reasoningMode?: string;
  timestamp: Date;
}

export class AGIMemoryService {
  private workingMemoryCache: Map<string, WorkingMemoryItem[]> = new Map();
  private consciousnessCache: Map<string, ConsciousnessState> = new Map();

  // ============================================================================
  // EPISODIC MEMORY
  // ============================================================================

  async storeEpisodicMemory(memory: EpisodicMemory): Promise<string> {
    const result = await db.insert(agiEpisodicMemory).values({
      userId: memory.userId,
      timestamp: memory.timestamp,
      eventType: memory.eventType,
      description: memory.description,
      context: memory.context,
      emotionalValence: memory.emotionalValence,
      emotionalArousal: memory.emotionalArousal,
      importanceScore: memory.importanceScore,
      participants: memory.participants,
      location: memory.location,
      outcome: memory.outcome,
      learnedLessons: memory.learnedLessons,
    }).returning({ id: agiEpisodicMemory.id });

    return result[0].id;
  }

  async getEpisodicMemories(userId: string, limit: number = 10): Promise<EpisodicMemory[]> {
    const memories = await db
      .select()
      .from(agiEpisodicMemory)
      .where(eq(agiEpisodicMemory.userId, userId))
      .orderBy(desc(agiEpisodicMemory.timestamp))
      .limit(limit);

    // Update access count and last accessed
    for (const memory of memories) {
      await db
        .update(agiEpisodicMemory)
        .set({
          lastAccessed: new Date(),
          accessCount: sql`${agiEpisodicMemory.accessCount} + 1`,
        })
        .where(eq(agiEpisodicMemory.id, memory.id));
    }

    return memories as EpisodicMemory[];
  }

  async getEpisodicMemoriesByImportance(
    userId: string,
    minImportance: number = 0.7,
    limit: number = 10
  ): Promise<EpisodicMemory[]> {
    const memories = await db
      .select()
      .from(agiEpisodicMemory)
      .where(
        and(
          eq(agiEpisodicMemory.userId, userId),
          gte(agiEpisodicMemory.importanceScore, minImportance)
        )
      )
      .orderBy(desc(agiEpisodicMemory.importanceScore))
      .limit(limit);

    return memories as EpisodicMemory[];
  }

  // ============================================================================
  // SEMANTIC MEMORY
  // ============================================================================

  async storeSemanticMemory(memory: SemanticMemory): Promise<string> {
    const result = await db.insert(agiSemanticMemory).values({
      userId: memory.userId,
      concept: memory.concept,
      definition: memory.definition,
      category: memory.category,
      properties: memory.properties,
      relationships: memory.relationships,
      examples: memory.examples,
      confidence: memory.confidence,
      source: memory.source,
      verificationStatus: memory.verificationStatus,
    }).returning({ id: agiSemanticMemory.id });

    return result[0].id;
  }

  async getSemanticMemory(userId: string, concept: string): Promise<SemanticMemory | null> {
    const memories = await db
      .select()
      .from(agiSemanticMemory)
      .where(
        and(
          eq(agiSemanticMemory.userId, userId),
          eq(agiSemanticMemory.concept, concept)
        )
      )
      .limit(1);

    if (memories.length === 0) return null;

    // Update access count
    await db
      .update(agiSemanticMemory)
      .set({
        lastAccessed: new Date(),
        accessCount: sql`${agiSemanticMemory.accessCount} + 1`,
      })
      .where(eq(agiSemanticMemory.id, memories[0].id));

    return memories[0] as SemanticMemory;
  }

  async searchSemanticMemory(userId: string, category: string, limit: number = 10): Promise<SemanticMemory[]> {
    const memories = await db
      .select()
      .from(agiSemanticMemory)
      .where(
        and(
          eq(agiSemanticMemory.userId, userId),
          eq(agiSemanticMemory.category, category)
        )
      )
      .orderBy(desc(agiSemanticMemory.confidence))
      .limit(limit);

    return memories as SemanticMemory[];
  }

  // ============================================================================
  // WORKING MEMORY
  // ============================================================================

  async storeWorkingMemory(item: WorkingMemoryItem): Promise<string> {
    const result = await db.insert(agiWorkingMemory).values({
      userId: item.userId,
      sessionId: item.sessionId,
      itemType: item.itemType,
      content: item.content,
      priority: item.priority,
      activationLevel: item.activationLevel,
      metadata: item.metadata,
      expiresAt: item.expiresAt,
    }).returning({ id: agiWorkingMemory.id });

    // Update cache
    const cacheKey = `${item.userId}:${item.sessionId}`;
    const cached = this.workingMemoryCache.get(cacheKey) || [];
    cached.push({ ...item, id: result[0].id });
    this.workingMemoryCache.set(cacheKey, cached);

    return result[0].id;
  }

  async getWorkingMemory(userId: string, sessionId: string): Promise<WorkingMemoryItem[]> {
    // Check cache first
    const cacheKey = `${userId}:${sessionId}`;
    const cached = this.workingMemoryCache.get(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const items = await db
      .select()
      .from(agiWorkingMemory)
      .where(
        and(
          eq(agiWorkingMemory.userId, userId),
          eq(agiWorkingMemory.sessionId, sessionId),
          sql`${agiWorkingMemory.expiresAt} IS NULL OR ${agiWorkingMemory.expiresAt} > NOW()`
        )
      )
      .orderBy(desc(agiWorkingMemory.priority));

    // Update cache
    this.workingMemoryCache.set(cacheKey, items as WorkingMemoryItem[]);

    return items as WorkingMemoryItem[];
  }

  async clearWorkingMemory(userId: string, sessionId: string): Promise<void> {
    await db
      .delete(agiWorkingMemory)
      .where(
        and(
          eq(agiWorkingMemory.userId, userId),
          eq(agiWorkingMemory.sessionId, sessionId)
        )
      );

    // Clear cache
    const cacheKey = `${userId}:${sessionId}`;
    this.workingMemoryCache.delete(cacheKey);
  }

  async cleanupExpiredWorkingMemory(): Promise<void> {
    await db
      .delete(agiWorkingMemory)
      .where(
        and(
          sql`${agiWorkingMemory.expiresAt} IS NOT NULL`,
          lte(agiWorkingMemory.expiresAt, new Date())
        )
      );
  }

  // ============================================================================
  // PROCEDURAL MEMORY
  // ============================================================================

  async storeProceduralMemory(memory: ProceduralMemory): Promise<string> {
    const result = await db.insert(agiProceduralMemory).values({
      userId: memory.userId,
      skillName: memory.skillName,
      description: memory.description,
      category: memory.category,
      steps: memory.steps,
      prerequisites: memory.prerequisites,
      successCriteria: memory.successCriteria,
      proficiencyLevel: memory.proficiencyLevel,
      practiceCount: memory.practiceCount,
      successRate: memory.successRate,
      lastPracticed: memory.lastPracticed,
    }).returning({ id: agiProceduralMemory.id });

    return result[0].id;
  }

  async getProceduralMemory(userId: string, skillName: string): Promise<ProceduralMemory | null> {
    const memories = await db
      .select()
      .from(agiProceduralMemory)
      .where(
        and(
          eq(agiProceduralMemory.userId, userId),
          eq(agiProceduralMemory.skillName, skillName)
        )
      )
      .limit(1);

    return memories.length > 0 ? (memories[0] as ProceduralMemory) : null;
  }

  async updateProceduralProficiency(
    userId: string,
    skillName: string,
    success: boolean
  ): Promise<void> {
    const memory = await this.getProceduralMemory(userId, skillName);
    if (!memory) return;

    const practiceCount = (memory.practiceCount || 0) + 1;
    const currentSuccesses = (memory.successRate || 0) * (memory.practiceCount || 0);
    const newSuccesses = currentSuccesses + (success ? 1 : 0);
    const successRate = newSuccesses / practiceCount;
    const proficiencyLevel = Math.min(1.0, successRate * (1 + Math.log10(practiceCount + 1) / 3));

    await db
      .update(agiProceduralMemory)
      .set({
        practiceCount,
        successRate,
        proficiencyLevel,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(agiProceduralMemory.userId, userId),
          eq(agiProceduralMemory.skillName, skillName)
        )
      );
  }

  // ============================================================================
  // EMOTIONAL MEMORY
  // ============================================================================

  async storeEmotionalMemory(memory: EmotionalMemory): Promise<string> {
    const result = await db.insert(agiEmotionalMemory).values({
      userId: memory.userId,
      eventId: memory.eventId,
      emotionType: memory.emotionType,
      intensity: memory.intensity,
      valence: memory.valence,
      arousal: memory.arousal,
      trigger: memory.trigger,
      response: memory.response,
      regulation: memory.regulation,
      outcome: memory.outcome,
    }).returning({ id: agiEmotionalMemory.id });

    return result[0].id;
  }

  async getEmotionalMemories(userId: string, limit: number = 10): Promise<EmotionalMemory[]> {
    const memories = await db
      .select()
      .from(agiEmotionalMemory)
      .where(eq(agiEmotionalMemory.userId, userId))
      .orderBy(desc(agiEmotionalMemory.createdAt))
      .limit(limit);

    return memories as EmotionalMemory[];
  }

  async getEmotionalMemoriesByType(
    userId: string,
    emotionType: string,
    limit: number = 10
  ): Promise<EmotionalMemory[]> {
    const memories = await db
      .select()
      .from(agiEmotionalMemory)
      .where(
        and(
          eq(agiEmotionalMemory.userId, userId),
          eq(agiEmotionalMemory.emotionType, emotionType)
        )
      )
      .orderBy(desc(agiEmotionalMemory.intensity))
      .limit(limit);

    return memories as EmotionalMemory[];
  }

  // ============================================================================
  // CONSCIOUSNESS STATE
  // ============================================================================

  async storeConsciousnessState(state: ConsciousnessState): Promise<string> {
    const result = await db.insert(agiConsciousnessState).values({
      userId: state.userId,
      sessionId: state.sessionId,
      consciousnessLevel: state.consciousnessLevel,
      attentionFocus: state.attentionFocus,
      currentGoals: state.currentGoals,
      metacognitiveState: state.metacognitiveState,
      emotionalState: state.emotionalState,
      creativityLevel: state.creativityLevel,
      reasoningMode: state.reasoningMode,
      timestamp: state.timestamp,
    }).returning({ id: agiConsciousnessState.id });

    // Update cache
    const cacheKey = `${state.userId}:${state.sessionId}`;
    this.consciousnessCache.set(cacheKey, { ...state, id: result[0].id });

    return result[0].id;
  }

  async getLatestConsciousnessState(userId: string, sessionId: string): Promise<ConsciousnessState | null> {
    // Check cache first
    const cacheKey = `${userId}:${sessionId}`;
    const cached = this.consciousnessCache.get(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const states = await db
      .select()
      .from(agiConsciousnessState)
      .where(
        and(
          eq(agiConsciousnessState.userId, userId),
          eq(agiConsciousnessState.sessionId, sessionId)
        )
      )
      .orderBy(desc(agiConsciousnessState.timestamp))
      .limit(1);

    if (states.length === 0) return null;

    const state = states[0] as ConsciousnessState;
    this.consciousnessCache.set(cacheKey, state);

    return state;
  }

  // ============================================================================
  // MEMORY CONSOLIDATION
  // ============================================================================

  async consolidateMemories(userId: string): Promise<void> {
    // Get recent working memory items
    const recentSessions = await db
      .selectDistinct({ sessionId: agiWorkingMemory.sessionId })
      .from(agiWorkingMemory)
      .where(eq(agiWorkingMemory.userId, userId))
      .limit(10);

    for (const { sessionId } of recentSessions) {
      const workingItems = await this.getWorkingMemory(userId, sessionId);

      // Consolidate important items to episodic memory
      for (const item of workingItems) {
        if ((item.priority || 0) > 0.7) {
          await this.storeEpisodicMemory({
            userId,
            timestamp: new Date(),
            eventType: item.itemType,
            description: item.content,
            context: item.metadata,
            importanceScore: item.priority,
          });
        }
      }
    }

    // Clean up old working memory
    await this.cleanupExpiredWorkingMemory();
  }
}

// Export singleton instance
export const agiMemoryService = new AGIMemoryService();
