import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check database connectivity
    const startTime = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbResponseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: {
          status: 'up',
          responseTime: Date.now() - startTime,
        },
        database: {
          status: 'up',
          responseTime: dbResponseTime,
        },
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
          error: message,
      },
      { status: 500 }
    );
  }
}

