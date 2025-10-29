import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db } from '@/server/db';
import { documents } from '@/server/db/schema/documents';
import { DocumentProcessor } from '@/lib/document-processor';
import { PineconeService } from '@/lib/pinecone-service';
import { verifyToken } from '@/lib/auth';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
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

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const filePath = join(UPLOAD_DIR, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create database record (initial)
    const [doc] = await db.insert(documents).values({
      userId,
      name: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      filePath: filename, // Store relative path
      storageType: 'local',
      processingStatus: 'processing',
      source: 'upload',
    }).returning();

    // Process document asynchronously (don't wait)
    processDocumentAsync(doc.id, filePath, file.type, userId, file.name).catch(error => {
      console.error('Background processing error:', error);
    });

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
        status: doc.processingStatus,
        createdAt: doc.createdAt,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

/**
 * Process document in the background
 */
async function processDocumentAsync(
  documentId: string,
  filePath: string,
  mimeType: string,
  userId: string,
  documentName: string
) {
  try {
    // Extract text from document
    const processed = await DocumentProcessor.processDocument(filePath, mimeType);

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
        processingStatus: 'completed',
        updatedAt: new Date(),
        metadata: {
          ...processed.metadata,
          wordCount: processed.wordCount,
          pageCount: processed.pageCount,
          chunkCount: chunks.length,
        },
      })
      .where({ id: documentId });

    console.log(`Document ${documentId} processed successfully`);

  } catch (error) {
    console.error(`Failed to process document ${documentId}:`, error);
    
    // Update status to failed
    await db.update(documents)
      .set({
        processingStatus: 'failed',
        processingError: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where({ id: documentId });
  }
}

