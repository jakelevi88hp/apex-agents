/**
 * Webhook Monitoring Service
 * 
 * Tracks webhook delivery and processing
 */

import { db } from '@/server/db';
import { sql } from 'drizzle-orm';

export interface WebhookLog {
  id: string;
  event: string;
  status: 'success' | 'failed';
  error?: string;
  timestamp: Date;
  processingTime: number;
}

export class WebhookMonitor {
  /**
   * Log webhook event
   */
  static async logEvent(
    event: string,
    status: 'success' | 'failed',
    processingTime: number,
    error?: string
  ): Promise<void> {
    try {
      // Create webhook_logs table if it doesn't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS webhook_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event TEXT NOT NULL,
          status TEXT NOT NULL,
          error TEXT,
          processing_time INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Insert log
      await db.execute(sql`
        INSERT INTO webhook_logs (event, status, error, processing_time)
        VALUES (${event}, ${status}, ${error || null}, ${processingTime})
      `);
      
    } catch (err) {
      console.error('Failed to log webhook event:', err);
    }
  }
  
  /**
   * Get webhook statistics
   */
  static async getStats(hours: number = 24): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    successRate: number;
    avgProcessingTime: number;
    eventBreakdown: Record<string, number>;
  }> {
    try {
      // Get overall stats
      const statsResult = await db.execute(sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(CASE WHEN status = 'success' THEN 1 END)::int as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END)::int as failed,
          AVG(processing_time)::float as avg_time
        FROM webhook_logs
        WHERE created_at > NOW() - INTERVAL '${hours} hours'
      `);
      
      const stats = (statsResult as unknown as Array<{
        total: number;
        successful: number;
        failed: number;
        avg_time: number | null;
      }>)[0] || { total: 0, successful: 0, failed: 0, avg_time: null };
      
      const totalEvents = stats.total;
      const successfulEvents = stats.successful;
      const failedEvents = stats.failed;
      const avgProcessingTime = Math.round(stats.avg_time || 0);
      const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;
      
      // Get event breakdown
      const breakdownResult = await db.execute(sql`
        SELECT event, COUNT(*)::int as count
        FROM webhook_logs
        WHERE created_at > NOW() - INTERVAL '${hours} hours'
        GROUP BY event
      `);
      
      const eventBreakdown: Record<string, number> = {};
      (breakdownResult as unknown as Array<{ event: string; count: number }>).forEach((row) => {
        eventBreakdown[row.event] = row.count;
      });
      
      return {
        totalEvents,
        successfulEvents,
        failedEvents,
        successRate: Math.round(successRate * 10) / 10,
        avgProcessingTime,
        eventBreakdown,
      };
      
    } catch (error) {
      console.error('Failed to get webhook stats:', error);
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        successRate: 0,
        avgProcessingTime: 0,
        eventBreakdown: {},
      };
    }
  }
  
  /**
   * Get recent webhook failures
   */
  static async getRecentFailures(limit: number = 10): Promise<WebhookLog[]> {
    try {
      const results = await db.execute(sql`
        SELECT id, event, status, error, processing_time, created_at as timestamp
        FROM webhook_logs
        WHERE status = 'failed'
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
      
      const logs: WebhookLog[] = ((results as unknown as Array<{
        id: string;
        event: string;
        status: string;
        error: string | null;
        processing_time: number | null;
        timestamp: Date;
      }>).map((row) => ({
        id: row.id,
        event: row.event,
        status: (row.status === 'success' || row.status === 'failed' ? row.status : 'failed') as 'success' | 'failed',
        error: row.error || undefined,
        timestamp: new Date(row.timestamp),
        processingTime: row.processing_time ? Math.round(row.processing_time) : 0,
      })));
      
      return logs;
      
    } catch (error) {
      console.error('Failed to get recent failures:', error);
      return [];
    }
  }
  
  /**
   * Check webhook health
   */
  static async checkHealth(): Promise<{
    healthy: boolean;
    alerts: string[];
  }> {
    const alerts: string[] = [];
    const stats = await this.getStats(24);
    
    // Check success rate
    if (stats.successRate < 95) {
      alerts.push(`⚠️ Low webhook success rate: ${stats.successRate}% (target: >95%)`);
    }
    
    // Check processing time
    if (stats.avgProcessingTime > 5000) {
      alerts.push(`⚠️ Slow webhook processing: ${stats.avgProcessingTime}ms (target: <5000ms)`);
    }
    
    // Check for recent failures
    const failures = await this.getRecentFailures(5);
    if (failures.length > 0) {
      alerts.push(`⚠️ ${failures.length} webhook failures in last 24 hours`);
    }
    
    return {
      healthy: alerts.length === 0,
      alerts,
    };
  }
}

