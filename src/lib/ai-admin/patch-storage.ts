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
    try {
      console.log('[PatchStorage] Attempting to save patch for user:', userId);
      console.log('[PatchStorage] Patch data:', JSON.stringify(patch, null, 2));
      
      // Parse the patch JSON string to extract fields
      let patchData: any = {};
      try {
        patchData = JSON.parse(patch.patch);
        console.log('[PatchStorage] Parsed patch data:', JSON.stringify(patchData, null, 2));
      } catch (error) {
        console.error('[PatchStorage] Failed to parse patch JSON:', error);
        throw new Error('Invalid patch JSON format');
      }
      
      const insertData: InsertAIPatch = {
        // Don't set id - let database generate UUID
        userId: userId as any,
        request: patch.request,
        summary: patchData.summary || 'No summary provided',
        description: patchData.description || null,
        files: patch.files as any,
        testingSteps: patchData.testingSteps as any || null,
        risks: patchData.risks as any || null,
        status: 'pending',
        metadata: {
          generatedAt: patch.timestamp instanceof Date ? patch.timestamp.toISOString() : patch.timestamp,
          originalId: patch.id, // Store original agent ID in metadata
          patchData: patchData, // Store full patch data for reference
        },
      };

      console.log('[PatchStorage] Insert data:', JSON.stringify(insertData, null, 2));
      console.log('[PatchStorage] About to call db.insert...');
      
      const result = await db.insert(aiPatches).values(insertData).returning();
      
      console.log('[PatchStorage] Insert completed!');
      console.log('[PatchStorage] Result type:', typeof result);
      console.log('[PatchStorage] Result is array:', Array.isArray(result));
      console.log('[PatchStorage] Result length:', result?.length);
      console.log('[PatchStorage] Insert result:', JSON.stringify(result, null, 2));
      
      const [insertedRow] = result;
      if (!insertedRow || !insertedRow.id) {
        throw new Error('Database insert returned no data');
      }
      
      console.log('[PatchStorage] Insert returned ID:', insertedRow.id);
      console.log('[PatchStorage] Insert returned createdAt:', insertedRow.createdAt, 'Type:', typeof insertedRow.createdAt);
      
      // Neon HTTP driver may not return default timestamp values in .returning()
      // Do an explicit SELECT to get the complete row with all default values
      const [savedPatch] = await db.select().from(aiPatches).where(eq(aiPatches.id, insertedRow.id)).limit(1);
      
      if (!savedPatch) {
        throw new Error('Failed to retrieve inserted patch');
      }
      
      console.log('[PatchStorage] Retrieved patch createdAt:', savedPatch.createdAt, 'Type:', typeof savedPatch.createdAt);
      console.log('[PatchStorage] Successfully saved patch with ID:', savedPatch.id);
      return savedPatch;
    } catch (error) {
      console.error('[PatchStorage] Error saving patch:', error);
      console.error('[PatchStorage] Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
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
    // Reconstruct the patch JSON string from database fields
    const patchData = {
      files: (patch.metadata as any)?.patchData?.files || [],
      summary: patch.summary,
      description: patch.description,
      testingSteps: patch.testingSteps,
      risks: patch.risks,
      databaseChanges: (patch.metadata as any)?.patchData?.databaseChanges || { required: false, tables: [], migrations: '' },
    };
    
    return {
      id: String(patch.id), // Convert UUID to string
      timestamp: patch.createdAt, // Use createdAt as timestamp
      request: patch.request,
      patch: JSON.stringify(patchData, null, 2), // Reconstruct patch JSON string
      files: patch.files as any,
      status: patch.status as any,
    };
  }

  /**
   * Get all patches for display in history
   */
  async getAllPatches(): Promise<PatchRecord[]> {
    try {
      const patches = await db
        .select()
        .from(aiPatches)
        .orderBy(desc(aiPatches.createdAt))
        .limit(100); // Limit to last 100 patches

      return patches.map(this.convertToPatchRecord);
    } catch (error) {
      console.error('[PatchStorage] Failed to get all patches:', error);
      return [];
    }
  }
}

// Export singleton instance
export const patchStorage = new PatchStorageService();
