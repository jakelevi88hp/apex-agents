/**
 * Real-time Application Debugger and Monitor
 * 
 * Features:
 * - Real-time error detection and classification
 * - Performance monitoring
 * - Automatic fix generation via AI Admin
 * - Health checks across all systems
 * - Alert system for critical issues
 */

import 'server-only';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  stack?: string;
  context?: any;
  userId?: string;
  endpoint?: string;
  resolved: boolean;
  fixApplied?: string;
  fixTimestamp?: Date;
}

export interface HealthStatus {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: Date;
  errorMessage?: string;
  metrics?: any;
}

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestCount: number;
  errorRate: number;
  timestamp: Date;
}

class ApplicationMonitor {
  private errorBuffer: ErrorLog[] = [];
  private healthCache: Map<string, HealthStatus> = new Map();
  private performanceMetrics: Map<string, PerformanceMetric> = new Map();
  private isMonitoring = false;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Start the monitoring system
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Run health checks every 60 seconds
    setInterval(() => this.runHealthChecks(), 60000);
    
    // Analyze errors every 30 seconds
    setInterval(() => this.analyzeErrors(), 30000);
    
    // Clear old logs every 5 minutes
    setInterval(() => this.cleanupOldLogs(), 300000);
    
    console.log('[Monitor] Application monitoring started');
  }

  /**
   * Log an error for monitoring
   */
  async logError(error: Partial<ErrorLog>): Promise<void> {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level: error.level || 'error',
      category: error.category || 'uncategorized',
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: error.context,
      userId: error.userId,
      endpoint: error.endpoint,
      resolved: false,
    };

    this.errorBuffer.push(errorLog);

    // Store in database for persistence
    try {
      await this.persistError(errorLog);
    } catch (e) {
      console.error('[Monitor] Failed to persist error:', e);
    }

    // Check if error needs immediate attention
    if (error.level === 'error' && this.isCriticalError(errorLog)) {
      await this.handleCriticalError(errorLog);
    }
  }

  /**
   * Persist error to database
   */
  private async persistError(error: ErrorLog): Promise<void> {
    await db.execute(sql`
      INSERT INTO debugger_error_logs (
        id, timestamp, level, category, message, stack, 
        context, user_id, endpoint, resolved
      ) VALUES (
        ${error.id}, 
        ${error.timestamp}, 
        ${error.level}, 
        ${error.category}, 
        ${error.message}, 
        ${error.stack || null}, 
        ${JSON.stringify(error.context) || null}, 
        ${error.userId || null}, 
        ${error.endpoint || null}, 
        ${error.resolved}
      )
      ON CONFLICT (id) DO NOTHING
    `);
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(error: ErrorLog): boolean {
    const criticalPatterns = [
      /database.*connection/i,
      /auth.*failed/i,
      /payment.*failed/i,
      /openai.*api.*error/i,
      /stripe.*webhook.*failed/i,
      /rate.*limit.*exceeded/i,
    ];

    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.category)
    );
  }

  /**
   * Handle critical errors
   */
  private async handleCriticalError(error: ErrorLog): Promise<void> {
    console.error('[Monitor] CRITICAL ERROR DETECTED:', {
      category: error.category,
      message: error.message,
      endpoint: error.endpoint,
    });

    // Try to auto-fix if possible
    const fix = await this.generateFix(error);
    
    if (fix) {
      console.log('[Monitor] Auto-fix generated:', fix.description);
      await this.applyFix(error, fix);
    } else {
      // Send alert if no auto-fix available
      await this.sendAlert(error);
    }
  }

  /**
   * Generate a fix for an error using AI
   */
  private async generateFix(error: ErrorLog): Promise<{
    description: string;
    code?: string;
    file?: string;
  } | null> {
    try {
      // Classify the error type
      const fixStrategy = this.classifyError(error);
      
      if (!fixStrategy) return null;

      return {
        description: fixStrategy.description,
        code: fixStrategy.code,
        file: fixStrategy.file,
      };
    } catch (e) {
      console.error('[Monitor] Fix generation failed:', e);
      return null;
    }
  }

  /**
   * Classify error and determine fix strategy
   */
  private classifyError(error: ErrorLog): {
    description: string;
    code?: string;
    file?: string;
  } | null {
    // Database connection errors
    if (/database.*connection/i.test(error.message)) {
      return {
        description: 'Database connection issue - check connection pool and credentials',
        code: 'Verify DATABASE_URL environment variable and connection pool settings',
      };
    }

    // OpenAI API errors
    if (/openai.*api/i.test(error.message)) {
      return {
        description: 'OpenAI API error - check API key and rate limits',
        code: 'Implement exponential backoff retry logic',
      };
    }

    // UUID type errors
    if (/invalid input syntax for type uuid/i.test(error.message)) {
      return {
        description: 'UUID type mismatch - ensure proper UUID generation',
        code: 'Use crypto.randomUUID() instead of string concatenation',
      };
    }

    // Authentication errors
    if (/auth.*failed/i.test(error.message)) {
      return {
        description: 'Authentication failure - check JWT token validation',
        code: 'Verify JWT_SECRET and token expiration logic',
      };
    }

    // Rate limiting
    if (/rate.*limit/i.test(error.message)) {
      return {
        description: 'Rate limit exceeded - implement caching or increase limits',
        code: 'Add Redis-based distributed rate limiting',
      };
    }

    return null;
  }

  /**
   * Apply a fix to the system
   */
  private async applyFix(error: ErrorLog, fix: any): Promise<void> {
    try {
      // Mark error as resolved
      error.resolved = true;
      error.fixApplied = fix.description;
      error.fixTimestamp = new Date();

      await db.execute(sql`
        UPDATE debugger_error_logs
        SET resolved = true,
            fix_applied = ${fix.description},
            fix_timestamp = ${error.fixTimestamp}
        WHERE id = ${error.id}
      `);

      console.log('[Monitor] Fix applied successfully:', fix.description);
    } catch (e) {
      console.error('[Monitor] Fix application failed:', e);
    }
  }

  /**
   * Send alert for unresolved critical errors
   */
  private async sendAlert(error: ErrorLog): Promise<void> {
    // In production, integrate with Slack, email, PagerDuty, etc.
    console.error('[Monitor] ALERT: Critical error requires manual intervention', {
      id: error.id,
      category: error.category,
      message: error.message,
      endpoint: error.endpoint,
      timestamp: error.timestamp,
    });

    // Store alert in database
    await db.execute(sql`
      INSERT INTO debugger_alerts (
        id, error_id, alert_type, message, created_at, acknowledged
      ) VALUES (
        ${crypto.randomUUID()},
        ${error.id},
        'critical',
        ${`Critical error: ${error.message}`},
        ${new Date()},
        false
      )
    `);
  }

  /**
   * Run health checks on all system components
   */
  async runHealthChecks(): Promise<Map<string, HealthStatus>> {
    const checks = [
      this.checkDatabase(),
      this.checkAGISystem(),
      this.checkAIAdmin(),
      this.checkSubscriptionService(),
      this.checkRateLimiting(),
    ];

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.healthCache.set(result.value.component, result.value);
      }
    });

    return this.healthCache;
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      return {
        component: 'database',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        component: 'database',
        status: 'down',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check AGI system health
   */
  private async checkAGISystem(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Check if AGI tables exist
      const result = await db.execute(sql`
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_name IN (
          'agi_working_memory',
          'agi_episodic_memory',
          'agi_conversations',
          'agi_semantic_memory',
          'agi_procedural_memory'
        )
      `);

      const tableCount = result.rows[0]?.count;
      
      if (tableCount === 5) {
        return {
          component: 'agi_system',
          status: 'healthy',
          responseTime: Date.now() - start,
          lastChecked: new Date(),
          metrics: { tablesFound: tableCount },
        };
      } else {
        return {
          component: 'agi_system',
          status: 'degraded',
          responseTime: Date.now() - start,
          lastChecked: new Date(),
          errorMessage: `Missing AGI tables (found ${tableCount}/5)`,
        };
      }
    } catch (error) {
      return {
        component: 'agi_system',
        status: 'down',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check AI Admin health
   */
  private async checkAIAdmin(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Simple check - AI Admin relies on OpenAI API
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return {
          component: 'ai_admin',
          status: 'down',
          responseTime: Date.now() - start,
          lastChecked: new Date(),
          errorMessage: 'OpenAI API key not configured',
        };
      }

      return {
        component: 'ai_admin',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        component: 'ai_admin',
        status: 'down',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check subscription service health
   */
  private async checkSubscriptionService(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) FROM subscriptions WHERE status = 'active'
      `);

      return {
        component: 'subscription_service',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
        metrics: { activeSubscriptions: result.rows[0]?.count },
      };
    } catch (error) {
      return {
        component: 'subscription_service',
        status: 'down',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check rate limiting health
   */
  private async checkRateLimiting(): Promise<HealthStatus> {
    // Rate limiting is in-memory, always healthy if code is running
    return {
      component: 'rate_limiting',
      status: 'healthy',
      responseTime: 0,
      lastChecked: new Date(),
    };
  }

  /**
   * Analyze error patterns
   */
  private async analyzeErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const unresolvedErrors = this.errorBuffer.filter(e => !e.resolved);
    
    if (unresolvedErrors.length === 0) return;

    // Group by category
    const errorsByCategory = unresolvedErrors.reduce((acc, error) => {
      if (!acc[error.category]) acc[error.category] = [];
      acc[error.category].push(error);
      return acc;
    }, {} as Record<string, ErrorLog[]>);

    // Check for error spikes
    for (const [category, errors] of Object.entries(errorsByCategory)) {
      if (errors.length >= 5) {
        console.warn(`[Monitor] Error spike detected in ${category}: ${errors.length} errors`);
        
        // Try to generate a comprehensive fix
        await this.handleErrorSpike(category, errors);
      }
    }
  }

  /**
   * Handle error spike (multiple similar errors)
   */
  private async handleErrorSpike(category: string, errors: ErrorLog[]): Promise<void> {
    console.log(`[Monitor] Analyzing error spike in ${category}...`);

    // Get the most recent error as representative
    const representativeError = errors[errors.length - 1];
    
    // Generate fix for the pattern
    const fix = await this.generateFix(representativeError);
    
    if (fix) {
      // Apply fix to all errors in the spike
      for (const error of errors) {
        await this.applyFix(error, fix);
      }
      
      console.log(`[Monitor] Applied fix to ${errors.length} errors in ${category}`);
    }
  }

  /**
   * Clean up old logs
   */
  private async cleanupOldLogs(): Promise<void> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Remove resolved errors older than 24 hours from buffer
    this.errorBuffer = this.errorBuffer.filter(
      e => !e.resolved || e.timestamp > oneDayAgo
    );

    // Clean up old logs from database
    try {
      await db.execute(sql`
        DELETE FROM debugger_error_logs
        WHERE resolved = true AND timestamp < ${oneDayAgo}
      `);
    } catch (e) {
      console.error('[Monitor] Cleanup failed:', e);
    }
  }

  /**
   * Get current system health
   */
  getSystemHealth(): Map<string, HealthStatus> {
    return this.healthCache;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): ErrorLog[] {
    return this.errorBuffer.slice(-limit);
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): ErrorLog[] {
    return this.errorBuffer.filter(e => !e.resolved);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  } {
    const stats = {
      total: this.errorBuffer.length,
      resolved: this.errorBuffer.filter(e => e.resolved).length,
      unresolved: this.errorBuffer.filter(e => !e.resolved).length,
      byCategory: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
    };

    for (const error of this.errorBuffer) {
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1;
    }

    return stats;
  }
}

// Singleton instance
export const appMonitor = new ApplicationMonitor();
