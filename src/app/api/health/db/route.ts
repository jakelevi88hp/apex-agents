import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test database connection
      await db.execute(sql`SELECT 1 as test`);
    const queryTime = Date.now() - startTime;

    // Get database stats
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as connection_count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

      const parseCount = (value: unknown): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = Number.parseInt(value, 10);
          return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: queryTime,
          activeConnections: parseCount(stats.rows[0]?.connection_count),
      },
    });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
            error: message,
        },
      },
      { status: 500 }
    );
  }
}

