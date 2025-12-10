/**
 * API Route: Workstream Activity
 * GET /api/pieces/workstream - Get recent roll-ups
 * POST /api/pieces/workstream - Generate roll-up
 */

import { NextRequest, NextResponse } from 'next/server';
import { workstreamActivityService } from '@/lib/pieces/workstream-activity';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const rollups = await workstreamActivityService.getRecentRollups(userId, limit);

    return NextResponse.json({ success: true, rollups });
  } catch (error) {
    console.error('Workstream GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roll-ups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;

    const body = await request.json();
    const { periodStart, periodEnd } = body;

    const rollupId = await workstreamActivityService.generateRollup(
      userId,
      periodStart ? new Date(periodStart) : undefined,
      periodEnd ? new Date(periodEnd) : undefined
    );

    return NextResponse.json({ success: true, rollupId });
  } catch (error) {
    console.error('Workstream POST error:', error);
    return NextResponse.json(
      { error: 'Failed to generate roll-up' },
      { status: 500 }
    );
  }
}
