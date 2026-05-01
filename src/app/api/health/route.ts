/**
 * General Health Check Endpoint
 * 
 * Provides overall system health status
 * SECURITY: Public endpoint (no auth required) but rate limited
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/middleware/rate-limit';
import { applySecurityHeaders } from '@/lib/middleware/security-headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip, RATE_LIMITS.public)) {
      return NextResponse.json(
        { 
          status: 'degraded',
          error: 'Rate limit exceeded',
          timestamp: new Date().toISOString(),
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const startTime = Date.now();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const response = NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        api: {
          status: 'up',
          responseTime: Date.now() - startTime,
        },
      },
      memory: process.env.NODE_ENV === 'development' ? {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      } : undefined,
    });

    applySecurityHeaders(response);
    return response;

  } catch (error) {
    console.error('[Health Check] Error:', error);
    
    const response = NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : 'An unexpected error occurred',
      },
      { status: 500 }
    );

    applySecurityHeaders(response);
    return response;
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  applySecurityHeaders(response);
  return response;
}
