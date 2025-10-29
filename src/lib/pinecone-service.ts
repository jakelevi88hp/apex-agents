import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX || 'apex-corporate-brain';

export interface VectorMetadata {
  documentId: string;
  chunkIndex: number;
  text: string;
  userId: string;
  documentName: string;
  source?: string;
  [key: string]: any;
}

export class PineconeService {
  private static index = pinecone.index(INDEX_NAME);

  /**
   * Generate embeddings using OpenAI
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Upsert document chunks to Pinecone
   */
  static async upsertDocumentChunks(
    documentId: string,
    chunks: string[],
    metadata: Omit<VectorMetadata, 'chunkIndex' | 'text'>
  ): Promise<string[]> {
    try {
      const vectors = await Promise.all(
        chunks.map(async (chunk, index) => {
          const embedding = await this.generateEmbedding(chunk);
          const id = `${documentId}-chunk-${index}`;

          return {
            id,
            values: embedding,
            metadata: {
              ...metadata,
              chunkIndex: index,
              text: chunk,
            } as VectorMetadata,
          };
        })
      );

      await this.index.upsert(vectors);

      return vectors.map(v => v.id);
    } catch (error) {
      console.error('Error upserting to Pinecone:', error);
      throw new Error('Failed to store vectors in Pinecone');
    }
  }

  /**
   * Search for similar documents
   */
  static async searchSimilar(
    query: string,
    userId: string,
    topK: number = 10
  ): Promise<Array<{ id: string; score: number; metadata: VectorMetadata }>> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);

      const results = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: {
          userId: { $eq: userId },
        },
      });

      return results.matches.map(match => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as VectorMetadata,
      }));
    } catch (error) {
      console.error('Error searching Pinecone:', error);
      throw new Error('Failed to search vectors');
    }
  }

  /**
   * Delete document vectors from Pinecone
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      // Delete all chunks for this document
      await this.index.deleteMany({
        filter: {
          documentId: { $eq: documentId },
        },
      });
    } catch (error) {
      console.error('Error deleting from Pinecone:', error);
      throw new Error('Failed to delete vectors from Pinecone');
    }
  }

  /**
   * Get index stats
   */
  static async getStats() {
    try {
      const stats = await this.index.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('Error getting Pinecone stats:', error);
      throw new Error('Failed to get index stats');
    }
  }
}

