import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { db, documents } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { DocumentProcessor } from '@/lib/document-processor';
import { PineconeService } from '@/lib/pinecone-service';
import { verifyToken } from '@/lib/auth/jwt';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { uploadFile } from '@/lib/knowledge-base/storage';

// Processing (text extraction + embeddings) happens before the response is
// sent — serverless freezes fire-and-forget work once the response returns.
export const maxDuration = 300;

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

function s3Configured(): boolean {
  return Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

/**
 * Persist the original file. Prefers S3 when configured; falls back to the
 * local uploads/ dir in non-serverless environments (dev). On serverless
 * without S3 the original is not retained ('ephemeral') — extracted text and
 * embeddings are still stored, so search/RAG keep working.
 */
async function storeOriginalFile(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  userId: string
): Promise<{ storageType: string; filePath: string | null }> {
  if (s3Configured()) {
    const result = await uploadFile({ file: buffer, fileName, contentType, userId });
    if (result.success && result.key) {
      return { storageType: 's3', filePath: result.key };
    }
    console.error('S3 upload failed, continuing without original-file retention:', result.error);
    return { storageType: 'ephemeral', filePath: null };
  }

  if (!isServerless) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const localName = `${Date.now()}-${sanitizedName}`;
    await writeFile(join(UPLOAD_DIR, localName), buffer);
    return { storageType: 'local', filePath: localName };
  }

  return { storageType: 'ephemeral', filePath: null };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 uploads per hour
    const rateLimitResult = await rateLimit(request, RateLimitPresets.UPLOAD);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Supported: PDF, DOCX, TXT, MD' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const stored = await storeOriginalFile(buffer, file.name, file.type, userId);

    // Create database record (initial)
    const [doc] = await db.insert(documents).values({
      userId,
      name: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      filePath: stored.filePath,
      storageType: stored.storageType,
      status: 'processing',
      source: 'upload',
    }).returning();

    const status = await processDocument(doc.id, buffer, file.type, userId, file.name);

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
        status,
        createdAt: doc.createdAt,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Extract text, embed, and index the document. Returns the final status.
 */
async function processDocument(
  documentId: string,
  buffer: Buffer,
  mimeType: string,
  userId: string,
  documentName: string
): Promise<string> {
  try {
    // Extract text from document
    const processed = await DocumentProcessor.processDocumentBuffer(buffer, mimeType);

    // Generate chunks for vector embedding
    const chunks = DocumentProcessor.chunkText(processed.text);

    // Store in Pinecone
    const pineconeIds = await PineconeService.upsertDocumentChunks(
      documentId,
      chunks,
      {
        documentId,
        userId,
        documentName,
        source: 'upload',
      }
    );

    // Generate summary
    const summary = DocumentProcessor.generateExcerpt(processed.text, 150);

    // Update database record
    await db.update(documents)
      .set({
        extractedText: processed.text,
        summary,
        pineconeId: pineconeIds[0], // Store first chunk ID as reference
        embeddingModel: 'text-embedding-3-large',
        status: 'completed',
        updatedAt: new Date(),
        metadata: {
          ...processed.metadata,
          wordCount: processed.wordCount,
          pageCount: processed.pageCount,
          chunkCount: chunks.length,
        },
      })
      .where(eq(documents.id, documentId));

    console.log(`Document ${documentId} processed successfully`);
    return 'completed';

  } catch (error) {
    console.error(`Failed to process document ${documentId}:`, error);

    // Update status to failed
    await db.update(documents)
      .set({
        status: 'failed',
        processingError: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
    return 'failed';
  }
}
