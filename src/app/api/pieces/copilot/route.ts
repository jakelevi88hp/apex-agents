/**
 * API Route: Pieces Copilot
 * POST /api/pieces/copilot
 */

import { NextRequest, NextResponse } from 'next/server';
import { piecesCopilot } from '@/lib/pieces/copilot';
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
    const { prompt, context, model, task } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const response = await piecesCopilot.processRequest({
      userId,
      prompt,
      context,
      model,
      task,
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Copilot error:', error);
    return NextResponse.json(
      { error: 'Failed to process copilot request' },
      { status: 500 }
    );
  }
}
