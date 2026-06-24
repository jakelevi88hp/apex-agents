/**
 * Security Monitoring Endpoint
 * 
 * Provides security metrics and recent security events
 * SECURITY: Admin authentication required
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/middleware/auth-middleware';
import { alertingSystem } from '@/lib/monitoring/alerts';
import { applySecurityHeaders } from '@/lib/middleware/security-headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = verifyRequestToken(request);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json(
        { 
          error: 'Forbidden', 
          message: 'Admin access required' 
        },
        { status: 403 }
      );
    }

    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const minutes = parseInt(searchParams.get('minutes') || '60', 10);

    // Get security data
    const securityEvents = alertingSystem.getSecurityEvents(minutes);
    const alerts = alertingSystem.getAlertHistory(100);
    const healthStatus = alertingSystem.getHealthStatus();

    // Analyze security events
    const eventsByType = securityEvents.reduce(
      (acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const eventsByEndpoint = securityEvents.reduce(
      (acc, e) => {
        acc[e.endpoint] = (acc[e.endpoint] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get top IPs with security events
    const ipCounts = securityEvents.reduce(
      (acc, e) => {
        acc[e.ip] = (acc[e.ip] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    // Filter alerts by category
    const securityAlerts = alerts.filter((a) => a.category === 'security');

    const response = NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      timeRange: {
        minutes,
        from: new Date(Date.now() - minutes * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      health: healthStatus,
      summary: {
        totalSecurityEvents: securityEvents.length,
        totalAlerts: alerts.length,
        securityAlerts: securityAlerts.length,
        eventRate: (securityEvents.length / minutes).toFixed(2),
      },
      eventsByType,
      eventsByEndpoint,
      topIPs,
      recentAlerts: securityAlerts.slice(0, 20),
      recommendations: generateRecommendations(healthStatus, securityEvents, alerts),
    });

    applySecurityHeaders(response);
    return response;

  } catch (error) {
    console.error('[Security Monitoring API] Error:', error);
    
    const response = NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );

    applySecurityHeaders(response);
    return response;
  }
}

/**
 * Generate security recommendations based on current state
 */
function generateRecommendations(
  healthStatus: any,
  securityEvents: any[],
  alerts: any[]
): string[] {
  const recommendations: string[] = [];

  // Check health status
  if (healthStatus.status === 'critical') {
    recommendations.push('🚨 CRITICAL: System is in critical state. Immediate action required.');
  } else if (healthStatus.status === 'degraded') {
    recommendations.push('⚠️ WARNING: System is degraded. Monitor closely and investigate issues.');
  }

  // Check security events
  const authFailures = securityEvents.filter((e) => e.type === 'auth_failure').length;
  if (authFailures > 10) {
    recommendations.push(`🔐 High authentication failures detected (${authFailures}). Check for brute force attacks.`);
  }

  const rateLimitViolations = securityEvents.filter((e) => e.type === 'rate_limit_exceeded').length;
  if (rateLimitViolations > 50) {
    recommendations.push(`⏱️ High rate limit violations (${rateLimitViolations}). Consider adjusting limits or investigating abuse.`);
  }

  const unauthorizedAccess = securityEvents.filter((e) => e.type === 'unauthorized_access').length;
  if (unauthorizedAccess > 5) {
    recommendations.push(`🔒 Unauthorized access attempts detected (${unauthorizedAccess}). Review access controls.`);
  }

  // Check alerts
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  if (criticalAlerts > 0) {
    recommendations.push(`🔴 ${criticalAlerts} critical alert(s) require immediate attention.`);
  }

  // Default recommendation
  if (recommendations.length === 0) {
    recommendations.push('✅ System appears healthy. Continue monitoring.');
  }

  return recommendations;
}
