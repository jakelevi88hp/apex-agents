/**
 * AI Patch Storage Service
 * 
 * Database-backed storage for AI Admin patches
 * Replaces in-memory storage to persist across serverless function instances
 */

import { db } from '@/lib/db';
import { aiPatches, type AIPatch, type InsertAIPatch } from '@/lib/db/schema/ai-patches';
import { eq, desc } from 'drizzle-orm';
import type { PatchRecord } from './agent';

export class PatchStorageService {
  /**
   * Save a patch to the database
   */
  async savePatch(userId: string, patch: PatchRecord): Promise<AIPatch> {
    const insertData: InsertAIPatch = {
      id: patch.id as any, // Use the patch ID from the agent
      userId: userId as any,
      request: patch.request,
      summary: patch.summary,
      description: patch.description,
      files: patch.files as any,
      testingSteps: patch.testingSteps as any,
      risks: patch.risks as any,
      status: 'pending',
      metadata: {
        generatedAt: patch.generatedAt.toISOString(),
      },
    };

    const [savedPatch] = await db.insert(aiPatches).values(insertData).returning();
    return savedPatch;
  }

  /**
   * Get a patch by ID
   */
  async getPatch(patchId: string): Promise<PatchRecord | null> {
    const [patch] = await db
      .select()
      .from(aiPatches)
      .where(eq(aiPatches.id, patchId as any))
      .limit(1);

    if (!patch) {
      return null;
    }

    return this.convertToPatchRecord(patch);
  }

  /**
   * Get all patches for a user
   */
  async getUserPatches(userId: string, limit: number = 50): Promise<PatchRecord[]> {
    const patches = await db
      .select()
      .from(aiPatches)
      .where(eq(aiPatches.userId, userId as any))
      .orderBy(desc(aiPatches.createdAt))
      .limit(limit);

    return patches.map(p => this.convertToPatchRecord(p));
  }

  /**
   * Update patch status
   */
  async updatePatchStatus(
    patchId: string,
    status: 'pending' | 'applied' | 'failed' | 'rolled_back',
    error?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'applied') {
      updateData.appliedAt = new Date();
    } else if (status === 'rolled_back') {
      updateData.rolledBackAt = new Date();
    }

    if (error) {
      updateData.error = error;
    }

    await db
      .update(aiPatches)
      .set(updateData)
      .where(eq(aiPatches.id, patchId as any));
  }

  /**
   * Delete old patches (cleanup)
   */
  async deleteOldPatches(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.setDate(cutoffDate.getDate() - daysOld));

    const result = await db
      .delete(aiPatches)
      .where(eq(aiPatches.createdAt, cutoffDate));

    return 0; // Drizzle doesn't return affected rows count easily
  }

  /**
   * Convert database patch to PatchRecord format
   */
  private convertToPatchRecord(patch: AIPatch): PatchRecord {
    return {
      id: patch.id,
      request: patch.request,
      summary: patch.summary,
      description: patch.description || '',
      files: patch.files as any,
      testingSteps: (patch.testingSteps as any) || [],
      risks: (patch.risks as any) || [],
      generatedAt: patch.createdAt,
      status: patch.status as any,
    };
  }
}

// Export singleton instance
export const patchStorage = new PatchStorageService();
