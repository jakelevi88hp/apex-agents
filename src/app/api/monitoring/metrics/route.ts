import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionMonitor } from '@/lib/monitoring/subscription-monitor';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * GET /api/monitoring/metrics
 * 
 * Returns subscription metrics and health status
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'owner';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get metrics
    const metrics = await SubscriptionMonitor.getMetrics();
    const health = await SubscriptionMonitor.checkHealth();
    const expiringSoon = await SubscriptionMonitor.getUsersExpiringSoon();
    const atLimit = await SubscriptionMonitor.getUsersAtLimit();
    const activity = await SubscriptionMonitor.getDailyActivity(7);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      health,
      alerts: {
        expiringSoon,
        atLimit,
      },
      activity,
    });

  } catch (error) {
    console.error('Monitoring metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring/metrics?format=report
 * 
 * Returns a text report of subscription metrics
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Generate report
    const report = await SubscriptionMonitor.generateReport();

    return new NextResponse(report, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Monitoring report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

