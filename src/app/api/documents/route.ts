import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { documents } from '@/server/db/schema/documents';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const status = searchParams.get('status');

    // Build query
    let query = db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          isNull(documents.deletedAt)
        )
      )
      .orderBy(desc(documents.createdAt));

    // Execute query
    const docs = await query;

    // Filter by source if provided
    let filteredDocs = docs;
    if (source) {
      filteredDocs = filteredDocs.filter(doc => doc.source === source);
    }
    if (status) {
      filteredDocs = filteredDocs.filter(doc => doc.processingStatus === status);
    }

    // Format response
    const formattedDocs = filteredDocs.map(doc => ({
      id: doc.id,
      name: doc.name,
      mimeType: doc.mimeType,
      size: doc.size,
      source: doc.source,
      status: doc.processingStatus,
      summary: doc.summary,
      tags: doc.tags,
      folder: doc.folder,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({
      documents: formattedDocs,
      total: formattedDocs.length,
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

