/**
 * Debugger API Routes
 * 
 * Real-time monitoring and debugging endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { appMonitor } from '@/lib/debugger/monitor';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth/jwt';

// Health check endpoint (public)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'health';

  // Public health check
  if (action === 'health') {
    const health = await appMonitor.runHealthChecks();
    const healthArray = Array.from(health.values());
    
    const overallStatus = healthArray.every(h => h.status === 'healthy')
      ? 'healthy'
      : healthArray.some(h => h.status === 'down')
      ? 'down'
      : 'degraded';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components: healthArray,
    });
  }

  // Protected endpoints - require authentication
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Check if user is admin (you'll need to implement admin check)
  // For now, allow all authenticated users
  
  switch (action) {
    case 'errors':
      return NextResponse.json({
        errors: appMonitor.getRecentErrors(100),
        stats: appMonitor.getErrorStats(),
      });

    case 'unresolved':
      return NextResponse.json({
        errors: appMonitor.getUnresolvedErrors(),
      });

    case 'stats':
      return NextResponse.json(appMonitor.getErrorStats());

    case 'health-detailed':
      const detailedHealth = await appMonitor.runHealthChecks();
      return NextResponse.json({
        components: Array.from(detailedHealth.values()),
        timestamp: new Date().toISOString(),
      });

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

// Log error manually (for testing)
export async function POST(request: NextRequest) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    await appMonitor.logError({
      level: body.level || 'error',
      category: body.category || 'manual',
      message: body.message,
      stack: body.stack,
      context: body.context,
      userId: user.userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
