/**
 * Storage Usage Tracker
 * 
 * Tracks file storage usage for subscription limits
 */

import { db } from '@/server/db';
import { documents } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { SubscriptionService } from './service';

export class StorageTracker {
  /**
   * Calculate total storage used by a user (in bytes)
   */
  static async getUserStorageUsage(userId: string): Promise<number> {
    const result = await db
      .select({
        totalSize: sql<number>`COALESCE(SUM(${documents.fileSize}), 0)`,
      })
      .from(documents)
      .where(eq(documents.userId, userId));

    return result[0]?.totalSize || 0;
  }

  /**
   * Check if user can upload a file of given size
   */
  static async canUploadFile(userId: string, fileSizeBytes: number): Promise<boolean> {
    // Aggregate current usage to compare against plan limits
    const currentUsage = await this.getUserStorageUsage(userId);
    const subscription = await SubscriptionService.getUserSubscription(userId);

    if (!subscription) {
      return false;
    }

    // Get storage limit from subscription tier (stored in bytes)
    const limits = await SubscriptionService.getUsageLimits(userId);
    const storageLimit = limits.storage;

    return (currentUsage + fileSizeBytes) <= storageLimit;
  }

  /**
   * Track storage usage after file upload
   */
  static async trackFileUpload(userId: string, fileSizeBytes: number): Promise<void> {
    const totalUsage = await this.getUserStorageUsage(userId);
    // Sync the usage table with the absolute total usage in bytes
    await SubscriptionService.trackUsage(userId, 'storage', totalUsage, { mode: 'set' });
  }

  /**
   * Update storage usage after file deletion
   */
  static async trackFileDeletion(userId: string): Promise<void> {
    const totalUsage = await this.getUserStorageUsage(userId);
    // Reset the stored count so deletions are reflected immediately
    await SubscriptionService.trackUsage(userId, 'storage', totalUsage, { mode: 'set' });
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(userId: string): Promise<{
    used: number;
    limit: number;
    percentage: number;
    usedFormatted: string;
    limitFormatted: string;
  }> {
    const usedBytes = await this.getUserStorageUsage(userId);
    const limits = await SubscriptionService.getUsageLimits(userId);
    const limitBytes = limits.storage;

    // Guard against divide-by-zero when a plan has unlimited storage
    const percentage = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;

    return {
      used: usedBytes,
      limit: limitBytes,
      percentage,
      usedFormatted: this.formatBytes(usedBytes),
      limitFormatted: this.formatBytes(limitBytes),
    };
  }

  /**
   * Format bytes to human-readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

