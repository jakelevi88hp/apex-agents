'use server';

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const INDEX_NAME = 'apex-agents-knowledge';

export interface EmbedDocumentConfig {
  id: string;
  text: string;
  metadata: {
    userId: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
  };
}

export async function embedDocument(config: EmbedDocumentConfig) {
  try {
    // Generate embedding using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: config.text,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Store in Pinecone
    const index = pinecone.index(INDEX_NAME);
    await index.upsert([
      {
        id: config.id,
        values: embedding,
        metadata: {
          ...config.metadata,
          text: config.text.substring(0, 1000), // Store first 1000 chars
        },
      },
    ]);

    return {
      success: true,
      id: config.id,
      dimensions: embedding.length,
    };
  } catch (error) {
    console.error('Embedding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Embedding failed',
    };
  }
}

export interface SearchConfig {
  query: string;
  userId: string;
  topK?: number;
}

export async function searchKnowledge(config: SearchConfig) {
  try {
    // Generate query embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: config.query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search in Pinecone
    const index = pinecone.index(INDEX_NAME);
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: config.topK || 5,
      filter: {
        userId: config.userId,
      },
      includeMetadata: true,
    });

    return {
      success: true,
      results: searchResults.matches.map((match) => ({
        id: match.id,
        score: match.score,
        text: match.metadata?.text as string,
        fileName: match.metadata?.fileName as string,
        fileType: match.metadata?.fileType as string,
      })),
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      results: [],
    };
  }
}

export async function deleteDocument(id: string) {
  try {
    const index = pinecone.index(INDEX_NAME);
    await index.deleteOne(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

