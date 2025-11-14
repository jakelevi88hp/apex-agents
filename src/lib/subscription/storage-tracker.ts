/**
 * Storage Usage Tracker
 * 
 * Tracks file storage usage for subscription limits
 */

import { db } from '@/server/db';
import { documents } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { SubscriptionService } from './service';

export class StorageTracker {
  /**
   * Calculate total storage used by a user (in bytes)
   */
  static async getUserStorageUsage(userId: string): Promise<number> {
    const result = await db
      .select({
        totalSize: sql<number>`COALESCE(SUM(${documents.size}), 0)`,
      })
      .from(documents)
      .where(eq(documents.userId, userId));

    return result[0]?.totalSize || 0;
  }

  /**
   * Check if user can upload a file of given size
   */
  static async canUploadFile(userId: string, fileSizeBytes: number): Promise<boolean> {
    const currentUsage = await this.getUserStorageUsage(userId);
    const subscription = await SubscriptionService.getUserSubscription(userId);

    if (!subscription) {
      return false;
    }

    // Get storage limit from subscription tier (in GB, convert to bytes)
    const limits = await SubscriptionService.getUsageLimits(userId);
    const storageLimit = limits.storage * 1024 * 1024 * 1024; // Convert GB to bytes

    return (currentUsage + fileSizeBytes) <= storageLimit;
  }

  /**
   * Track storage usage after file upload
   */
  static async trackFileUpload(userId: string, fileSizeBytes: number): Promise<void> {
    const totalUsage = await this.getUserStorageUsage(userId);
    
    // Update usage tracking in bytes, but store as GB for consistency
    const usageInGB = totalUsage / (1024 * 1024 * 1024);
    
    await SubscriptionService.trackUsage(userId, 'storage', usageInGB);
  }

  /**
   * Update storage usage after file deletion
   */
  static async trackFileDeletion(userId: string): Promise<void> {
    const totalUsage = await this.getUserStorageUsage(userId);
    const usageInGB = totalUsage / (1024 * 1024 * 1024);
    
    await SubscriptionService.trackUsage(userId, 'storage', usageInGB);
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
    const limitBytes = limits.storage * 1024 * 1024 * 1024;

    const percentage = (usedBytes / limitBytes) * 100;

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

