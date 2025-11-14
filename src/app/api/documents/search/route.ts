import { NextRequest, NextResponse } from 'next/server';
import { PineconeService } from '@/lib/pinecone-service';
import { verifyToken } from '@/lib/auth/jwt';

interface DocumentChunkResult {
  text: string;
  score: number;
  chunkIndex: number;
}

interface DocumentSearchResult {
  documentId: string;
  documentName?: string;
  source?: string;
  maxScore: number;
  chunks: DocumentChunkResult[];
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { query, topK = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Search in Pinecone
    const results = await PineconeService.searchSimilar(query, userId, topK);

      // Group results by document
      const documentResults = new Map<string, DocumentSearchResult>();

    for (const result of results) {
      const docId = result.metadata.documentId;
      
        if (!documentResults.has(docId)) {
          documentResults.set(docId, {
            documentId: docId,
            documentName: result.metadata.documentName,
            source: result.metadata.source,
            maxScore: result.score,
            chunks: [],
          });
        }

        const docResult = documentResults.get(docId);
        if (!docResult) {
          continue;
        }
        docResult.chunks.push({
          text: result.metadata.text,
          score: result.score,
          chunkIndex: result.metadata.chunkIndex,
        });

      // Update max score
      if (result.score > docResult.maxScore) {
        docResult.maxScore = result.score;
      }
    }

    // Convert to array and sort by max score
    const sortedResults = Array.from(documentResults.values())
      .sort((a, b) => b.maxScore - a.maxScore);

    return NextResponse.json({
      query,
      results: sortedResults,
      total: sortedResults.length,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    );
  }
}

