/**
 * Monitoring and Alerting System
 * 
 * Tracks security events, performance metrics, and sends alerts
 * Integrates with Sentry for error tracking and Vercel for deployment monitoring
 */

import * as Sentry from '@sentry/nextjs';

export interface AlertEvent {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'availability' | 'error';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit_exceeded' | 'unauthorized_access' | 'invalid_token' | 'permission_denied';
  userId?: string;
  ip: string;
  endpoint: string;
  details?: Record<string, unknown>;
}

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
}

/**
 * Alert thresholds for automatic alerting
 */
export const ALERT_THRESHOLDS = {
  // Security thresholds
  authFailuresPerMinute: 10,
  rateLimitExceededPerMinute: 50,
  unauthorizedAccessPerMinute: 5,

  // Performance thresholds
  slowResponseTime: 5000, // 5 seconds
  errorRateThreshold: 0.05, // 5%
  highMemoryUsage: 0.85, // 85% of heap

  // Availability thresholds
  dbConnectionFailures: 3,
  healthCheckFailures: 2,
};

/**
 * In-memory event tracking for alerting
 */
class AlertingSystem {
  private securityEvents: SecurityEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private alertHistory: AlertEvent[] = [];

  constructor() {
    // Clean up old events every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Record a security event
   */
  recordSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push({
      ...event,
    });

    // Check if alert should be triggered
    this.checkSecurityAlerts();

    // Log to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(`Security Event: ${event.type}`, 'warning', {
        tags: {
          event_type: event.type,
          endpoint: event.endpoint,
        },
        extra: event.details,
      });
    }
  }

  /**
   * Record a performance metric
   */
  recordPerformanceMetric(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric);

    // Check if alert should be triggered
    this.checkPerformanceAlerts(metric);

    // Log slow requests to Sentry
    if (metric.responseTime > ALERT_THRESHOLDS.slowResponseTime) {
      Sentry.captureMessage(
        `Slow Request: ${metric.endpoint}`,
        'warning',
        {
          tags: {
            endpoint: metric.endpoint,
            method: metric.method,
            response_time: metric.responseTime,
          },
        }
      );
    }
  }

  /**
   * Check security event thresholds and trigger alerts
   */
  private checkSecurityAlerts(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Filter events from the last minute
    const recentEvents = this.securityEvents.filter(
      (event) => (event as any).timestamp > oneMinuteAgo
    );

    // Count events by type
    const eventCounts = recentEvents.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Check thresholds
    if (eventCounts['auth_failure'] > ALERT_THRESHOLDS.authFailuresPerMinute) {
      this.sendAlert({
        severity: 'high',
        category: 'security',
        title: 'High Authentication Failure Rate',
        message: `${eventCounts['auth_failure']} authentication failures in the last minute`,
        metadata: { event_count: eventCounts['auth_failure'] },
      });
    }

    if (eventCounts['rate_limit_exceeded'] > ALERT_THRESHOLDS.rateLimitExceededPerMinute) {
      this.sendAlert({
        severity: 'medium',
        category: 'security',
        title: 'High Rate Limit Violations',
        message: `${eventCounts['rate_limit_exceeded']} rate limit violations in the last minute`,
        metadata: { event_count: eventCounts['rate_limit_exceeded'] },
      });
    }

    if (eventCounts['unauthorized_access'] > ALERT_THRESHOLDS.unauthorizedAccessPerMinute) {
      this.sendAlert({
        severity: 'high',
        category: 'security',
        title: 'Potential Security Attack',
        message: `${eventCounts['unauthorized_access']} unauthorized access attempts in the last minute`,
        metadata: { event_count: eventCounts['unauthorized_access'] },
      });
    }
  }

  /**
   * Check performance metric thresholds and trigger alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    if (metric.responseTime > ALERT_THRESHOLDS.slowResponseTime) {
      this.sendAlert({
        severity: 'medium',
        category: 'performance',
        title: 'Slow Response Time',
        message: `${metric.endpoint} took ${metric.responseTime}ms to respond`,
        metadata: {
          endpoint: metric.endpoint,
          response_time: metric.responseTime,
          status_code: metric.statusCode,
        },
      });
    }

    // Check error rate
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const recentMetrics = this.performanceMetrics.filter(
      (m) => m.timestamp.getTime() > fiveMinutesAgo
    );

    const errorCount = recentMetrics.filter((m) => m.statusCode >= 400).length;
    const errorRate = errorCount / Math.max(recentMetrics.length, 1);

    if (errorRate > ALERT_THRESHOLDS.errorRateThreshold) {
      this.sendAlert({
        severity: 'high',
        category: 'error',
        title: 'High Error Rate',
        message: `Error rate is ${(errorRate * 100).toFixed(2)}% in the last 5 minutes`,
        metadata: {
          error_rate: errorRate,
          error_count: errorCount,
          total_requests: recentMetrics.length,
        },
      });
    }
  }

  /**
   * Send an alert
   */
  private sendAlert(event: AlertEvent): void {
    const alertEvent: AlertEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.alertHistory.push(alertEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[ALERT] ${event.severity.toUpperCase()}: ${event.title}`, event.message);
    }

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      const sentryLevel =
        event.severity === 'critical' || event.severity === 'high' ? 'error' : 'warning';

      Sentry.captureMessage(event.title, sentryLevel, {
        tags: {
          alert_category: event.category,
          alert_severity: event.severity,
        },
        extra: event.metadata,
      });
    }

    // TODO: Send to Slack, PagerDuty, or other alerting service
    // this.sendToSlack(alertEvent);
    // this.sendToPagerDuty(alertEvent);
  }

  /**
   * Get recent security events
   */
  getSecurityEvents(minutes: number = 5): SecurityEvent[] {
    const now = Date.now();
    const timeAgo = now - minutes * 60 * 1000;
    return this.securityEvents.filter((event) => (event as any).timestamp > timeAgo);
  }

  /**
   * Get recent performance metrics
   */
  getPerformanceMetrics(minutes: number = 5): PerformanceMetric[] {
    const now = Date.now();
    const timeAgo = now - minutes * 60 * 1000;
    return this.performanceMetrics.filter((m) => m.timestamp.getTime() > timeAgo);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): AlertEvent[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'critical';
    metrics: Record<string, unknown>;
  } {
    const recentMetrics = this.getPerformanceMetrics(5);
    const errorCount = recentMetrics.filter((m) => m.statusCode >= 400).length;
    const errorRate = errorCount / Math.max(recentMetrics.length, 1);

    const recentSecurityEvents = this.getSecurityEvents(1);
    const criticalSecurityEvents = recentSecurityEvents.filter(
      (e) => e.type === 'unauthorized_access' || e.type === 'invalid_token'
    ).length;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    if (errorRate > ALERT_THRESHOLDS.errorRateThreshold || criticalSecurityEvents > 5) {
      status = 'degraded';
    }

    if (errorRate > 0.1 || criticalSecurityEvents > 10) {
      status = 'critical';
    }

    return {
      status,
      metrics: {
        error_rate: errorRate,
        error_count: errorCount,
        total_requests: recentMetrics.length,
        security_events: recentSecurityEvents.length,
        critical_security_events: criticalSecurityEvents,
      },
    };
  }

  /**
   * Clean up old events
   */
  private cleanup(): void {
    const now = Date.now();
    const thirtyMinutesAgo = now - 30 * 60 * 1000;

    // Keep only events from the last 30 minutes
    this.securityEvents = this.securityEvents.filter(
      (event) => (event as any).timestamp > thirtyMinutesAgo
    );

    this.performanceMetrics = this.performanceMetrics.filter(
      (m) => m.timestamp.getTime() > thirtyMinutesAgo
    );

    // Keep only recent alerts
    this.alertHistory = this.alertHistory.slice(-1000);
  }
}

// Export singleton instance
export const alertingSystem = new AlertingSystem();

/**
 * Helper function to record security event
 */
export function recordSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  alertingSystem.recordSecurityEvent({
    ...event,
    timestamp: new Date(),
  } as SecurityEvent);
}

/**
 * Helper function to record performance metric
 */
export function recordPerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
  alertingSystem.recordPerformanceMetric({
    ...metric,
    timestamp: new Date(),
  });
}
