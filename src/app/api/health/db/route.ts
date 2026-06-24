/**
 * Database Health Check Endpoint
 * 
 * Verifies database connectivity and returns health status
 * SECURITY: Public endpoint (no auth required) but rate limited
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
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

    // Test database connectivity
    const startTime = Date.now();
    
    try {
      const result = await db.execute(sql`SELECT 1 as health`);
      const queryTime = Date.now() - startTime;

      if (!result || result.length === 0) {
        throw new Error('Invalid database response - empty result set');
      }

      // Get database stats (only in development to avoid exposing info)
      let stats = null;
      if (process.env.NODE_ENV === 'development') {
        try {
          stats = await db.execute(sql`
            SELECT 
              COUNT(*) as connection_count
            FROM pg_stat_activity
            WHERE datname = current_database()
          `);
        } catch (statsError) {
          console.warn('[Health Check] Could not fetch database stats:', statsError);
        }
      }

      const response = NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          responseTime: queryTime,
          activeConnections: stats && stats.rows ? stats.rows[0]?.connection_count || 0 : undefined,
        },
      });

      applySecurityHeaders(response);
      return response;

    } catch (dbError) {
      console.error('[Health Check] Database connection error:', dbError);
      
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      const queryTime = Date.now() - startTime;

      const response = NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: {
            connected: false,
            responseTime: queryTime,
            error: process.env.NODE_ENV === 'development' ? errorMessage : 'Connection failed',
          },
        },
        { status: 503 } // Service Unavailable
      );

      applySecurityHeaders(response);
      return response;
    }

  } catch (error) {
    console.error('[Health Check] Unexpected error:', error);
    
    const response = NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: process.env.NODE_ENV === 'development' 
            ? (error instanceof Error ? error.message : String(error))
            : 'An unexpected error occurred',
        },
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
