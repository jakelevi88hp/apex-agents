/**
 * API Route: Pieces Drive
 * GET /api/pieces/drive - Get user materials
 * POST /api/pieces/drive - Save material
 */

import { NextRequest, NextResponse } from 'next/server';
import { piecesDrive } from '@/lib/pieces/drive';
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
    const materialType = searchParams.get('type') as any;
    const limit = parseInt(searchParams.get('limit') || '50');

    const materials = await piecesDrive.getUserMaterials(userId, materialType, limit);

    return NextResponse.json({ success: true, materials });
  } catch (error) {
    console.error('Drive GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
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
    const { materialType, title, content, url, language, tags, metadata, isPublic } = body;

    if (!materialType || !title) {
      return NextResponse.json(
        { error: 'materialType and title are required' },
        { status: 400 }
      );
    }

    const materialId = await piecesDrive.saveMaterial({
      userId,
      materialType,
      title,
      content,
      url,
      language,
      tags,
      metadata,
      isPublic,
    });

    return NextResponse.json({ success: true, materialId });
  } catch (error) {
    console.error('Drive POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save material' },
      { status: 500 }
    );
  }
}
