/**
 * API Route: Capture LTM Workflow Context
 * POST /api/pieces/ltm/capture
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
    const { contextType, title, url, content, metadata, tags, importance } = body;

    if (!contextType || !title) {
      return NextResponse.json(
        { error: 'contextType and title are required' },
        { status: 400 }
      );
    }

    const contextId = await ltmEngine.captureContext({
      userId,
      contextType,
      title,
      url,
      content,
      metadata,
      tags,
      importance,
    });

    return NextResponse.json({ success: true, contextId });
  } catch (error) {
    console.error('LTM capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture context' },
      { status: 500 }
    );
  }
}
