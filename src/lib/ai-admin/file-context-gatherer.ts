/**
 * File Context Gatherer
 * 
 * Retrieves uploaded files and their Vision API analysis results
 * to provide context for AI chat and patch generation
 */

import { db } from '@/lib/db';
import { aiUploadedFiles, aiMessages } from '@/lib/db/schema/ai-conversations';
import { eq, desc } from 'drizzle-orm';

export interface FileContext {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
  analysis?: {
    description: string;
    detectedElements: string[];
    suggestedContext: string;
    codeSnippets?: string[];
    uiComponents?: string[];
    errorMessages?: string[];
  };
}

export interface FileContextSummary {
  totalFiles: number;
  imageFiles: number;
  analyzedFiles: number;
  files: FileContext[];
  contextText: string; // Formatted text for AI prompts
}

export class FileContextGatherer {
  /**
   * Get all uploaded files for a conversation
   */
  async getConversationFiles(conversationId: string): Promise<FileContext[]> {
    try {
      // Get all messages in the conversation
      const messages = await db
        .select({ id: aiMessages.id })
        .from(aiMessages)
        .where(eq(aiMessages.conversationId, conversationId))
        .orderBy(desc(aiMessages.createdAt));

      if (messages.length === 0) {
        return [];
      }

      const messageIds = messages.map(m => m.id);

      // Get all uploaded files for these messages
      const files = await db
        .select()
        .from(aiUploadedFiles)
        .where(
          // Use IN clause to match any message ID
          eq(aiUploadedFiles.messageId, messageIds[0]) // This is a simplified version
        )
        .orderBy(desc(aiUploadedFiles.createdAt));

      // Transform to FileContext format
      return files.map(file => ({
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        url: file.s3Url,
        uploadedAt: file.createdAt,
        analysis: file.analysisResult as any,
      }));
    } catch (error) {
      console.error('[FileContextGatherer] Error getting conversation files:', error);
      return [];
    }
  }

  /**
   * Get recent uploaded files (last N files)
   */
  async getRecentFiles(limit: number = 5): Promise<FileContext[]> {
    try {
      const files = await db
        .select()
        .from(aiUploadedFiles)
        .orderBy(desc(aiUploadedFiles.createdAt))
        .limit(limit);

      return files.map(file => ({
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        url: file.s3Url,
        uploadedAt: file.createdAt,
        analysis: file.analysisResult as any,
      }));
    } catch (error) {
      console.error('[FileContextGatherer] Error getting recent files:', error);
      return [];
    }
  }

  /**
   * Get files by message ID
   */
  async getMessageFiles(messageId: string): Promise<FileContext[]> {
    try {
      const files = await db
        .select()
        .from(aiUploadedFiles)
        .where(eq(aiUploadedFiles.messageId, messageId))
        .orderBy(desc(aiUploadedFiles.createdAt));

      return files.map(file => ({
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        url: file.s3Url,
        uploadedAt: file.createdAt,
        analysis: file.analysisResult as any,
      }));
    } catch (error) {
      console.error('[FileContextGatherer] Error getting message files:', error);
      return [];
    }
  }

  /**
   * Generate a summary of files with formatted context text for AI
   */
  generateFileContextSummary(files: FileContext[]): FileContextSummary {
    const imageFiles = files.filter(f => f.fileType.startsWith('image/'));
    const analyzedFiles = files.filter(f => f.analysis);

    // Generate context text for AI prompts
    let contextText = '';

    if (files.length === 0) {
      return {
        totalFiles: 0,
        imageFiles: 0,
        analyzedFiles: 0,
        files: [],
        contextText: '',
      };
    }

    contextText += `# UPLOADED FILES CONTEXT\n\n`;
    contextText += `The user has uploaded ${files.length} file(s) in this conversation:\n\n`;

    for (const file of files) {
      contextText += `## File: ${file.fileName}\n`;
      contextText += `- Type: ${file.fileType}\n`;
      contextText += `- URL: ${file.url}\n`;

      if (file.analysis) {
        contextText += `\n### Vision API Analysis:\n`;
        contextText += `${file.analysis.description}\n\n`;

        if (file.analysis.uiComponents && file.analysis.uiComponents.length > 0) {
          contextText += `**UI Components Detected:** ${file.analysis.uiComponents.join(', ')}\n\n`;
        }

        if (file.analysis.codeSnippets && file.analysis.codeSnippets.length > 0) {
          contextText += `**Code Snippets:**\n`;
          for (const snippet of file.analysis.codeSnippets) {
            contextText += `\`\`\`\n${snippet}\n\`\`\`\n\n`;
          }
        }

        if (file.analysis.errorMessages && file.analysis.errorMessages.length > 0) {
          contextText += `**Error Messages:**\n`;
          for (const error of file.analysis.errorMessages) {
            contextText += `- ${error}\n`;
          }
          contextText += `\n`;
        }

        if (file.analysis.suggestedContext) {
          contextText += `**Context:** ${file.analysis.suggestedContext}\n\n`;
        }
      }

      contextText += `---\n\n`;
    }

    return {
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      analyzedFiles: analyzedFiles.length,
      files,
      contextText,
    };
  }

  /**
   * Get file context summary for a conversation
   */
  async getConversationFileContext(conversationId: string): Promise<FileContextSummary> {
    const files = await this.getConversationFiles(conversationId);
    return this.generateFileContextSummary(files);
  }

  /**
   * Get file context summary for recent files
   */
  async getRecentFileContext(limit: number = 5): Promise<FileContextSummary> {
    const files = await this.getRecentFiles(limit);
    return this.generateFileContextSummary(files);
  }

  /**
   * Check if conversation has any uploaded files
   */
  async hasConversationFiles(conversationId: string): Promise<boolean> {
    const files = await this.getConversationFiles(conversationId);
    return files.length > 0;
  }

  /**
   * Get only analyzed image files (with Vision API results)
   */
  async getAnalyzedImages(conversationId: string): Promise<FileContext[]> {
    const files = await this.getConversationFiles(conversationId);
    return files.filter(f => 
      f.fileType.startsWith('image/') && 
      f.analysis
    );
  }

  /**
   * Extract all UI components from analyzed images
   */
  extractUIComponents(files: FileContext[]): string[] {
    const components = new Set<string>();

    for (const file of files) {
      if (file.analysis?.uiComponents) {
        file.analysis.uiComponents.forEach(c => components.add(c));
      }
    }

    return Array.from(components);
  }

  /**
   * Extract all code snippets from analyzed images
   */
  extractCodeSnippets(files: FileContext[]): string[] {
    const snippets: string[] = [];

    for (const file of files) {
      if (file.analysis?.codeSnippets) {
        snippets.push(...file.analysis.codeSnippets);
      }
    }

    return snippets;
  }

  /**
   * Extract all error messages from analyzed images
   */
  extractErrorMessages(files: FileContext[]): string[] {
    const errors: string[] = [];

    for (const file of files) {
      if (file.analysis?.errorMessages) {
        errors.push(...file.analysis.errorMessages);
      }
    }

    return errors;
  }
}
