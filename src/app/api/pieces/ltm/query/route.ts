/**
 * API Route: Natural Language Query
 * POST /api/pieces/ltm/query
 */

import { NextRequest, NextResponse } from 'next/server';
import { ltmEngine } from '@/lib/pieces/ltm-engine';
import { verifyToken } from '@/lib/auth';

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
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const result = await ltmEngine.processNaturalLanguageQuery(userId, query);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('LTM query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
