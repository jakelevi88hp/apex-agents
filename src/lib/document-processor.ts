import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { readFile } from 'fs/promises';

export interface ProcessedDocument {
  text: string;
  pageCount?: number;
  wordCount: number;
  metadata: Record<string, any>;
}

export class DocumentProcessor {
  /**
   * Process a document and extract text content
   */
  static async processDocument(filePath: string, mimeType: string): Promise<ProcessedDocument> {
    try {
      if (mimeType === 'application/pdf') {
        return await this.processPDF(filePath);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await this.processDOCX(filePath);
      } else if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
        return await this.processText(filePath);
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process PDF file
   */
  private static async processPDF(filePath: string): Promise<ProcessedDocument> {
    const dataBuffer = await readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      pageCount: data.numpages,
      wordCount: this.countWords(data.text),
      metadata: {
        info: data.info,
        metadata: data.metadata,
      },
    };
  }

  /**
   * Process DOCX file
   */
  private static async processDOCX(filePath: string): Promise<ProcessedDocument> {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    return {
      text,
      wordCount: this.countWords(text),
      metadata: {
        messages: result.messages,
      },
    };
  }

  /**
   * Process plain text or markdown file
   */
  private static async processText(filePath: string): Promise<ProcessedDocument> {
    const text = await readFile(filePath, 'utf-8');

    return {
      text,
      wordCount: this.countWords(text),
      metadata: {},
    };
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Split text into chunks for vector embedding
   */
  static chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  /**
   * Generate summary of text using first N words
   */
  static generateExcerpt(text: string, wordLimit: number = 100): string {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return text;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
  }
}

