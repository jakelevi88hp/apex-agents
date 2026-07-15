import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { db, documents } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';
import { getFileUrl } from '@/lib/knowledge-base/storage';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const documentId = params.id;

    // Get document from database
    const [doc] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.userId, userId)
        )
      )
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!doc.filePath) {
      return NextResponse.json(
        { error: 'The original file was not retained for this document. Its extracted text remains available.' },
        { status: 404 }
      );
    }

    // S3-stored files: redirect to a short-lived signed URL
    if (doc.storageType === 's3') {
      const result = await getFileUrl(doc.filePath);
      if (result.success && result.url) {
        return NextResponse.redirect(result.url);
      }
      console.error('Failed to sign S3 URL:', result.error);
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // Legacy/local files: read from disk
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(join(UPLOAD_DIR, doc.filePath));
    } catch {
      return NextResponse.json(
        { error: 'The original file is no longer available. Its extracted text remains available.' },
        { status: 404 }
      );
    }

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Disposition': `attachment; filename="${doc.originalName}"`,
        'Content-Length': doc.size.toString(),
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

