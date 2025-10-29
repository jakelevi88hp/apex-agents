import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test database connection
    const result = await db.execute(sql`SELECT 1 as test`);
    const queryTime = Date.now() - startTime;

    // Get database stats
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as connection_count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: queryTime,
        activeConnections: stats.rows[0]?.connection_count || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error.message,
        },
      },
      { status: 500 }
    );
  }
}

