/**
 * Pieces Copilot
 * 
 * AI assistant leveraging LTM-2.7 context to assist with:
 * - Debugging code
 * - Generating comments
 * - Answering questions
 * - Code generation
 * 
 * Features:
 * - Contextual understanding from LTM
 * - LLM flexibility (local or cloud models)
 * - Integrated with workflow context
 */

import { ltmEngine } from './ltm-engine';
import { piecesDrive } from './drive';
import { agiMemoryService } from '@/lib/agi/memory';
import { EnhancedAGICore } from '@/lib/agi/enhanced-core';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface CopilotRequest {
  userId: string;
  prompt: string;
  context?: {
    includeLTM?: boolean; // Include LTM-2.7 context
    includeDrive?: boolean; // Include Pieces Drive materials
    includeMemory?: boolean; // Include AGI memory
    codeContext?: string; // Current code context
    filePath?: string; // Current file path
  };
  model?: 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'local';
  task?: 'debug' | 'comment' | 'generate' | 'explain' | 'question';
}

export interface CopilotResponse {
  response: string;
  suggestions?: string[];
  relevantContext?: Array<{
    type: 'ltm' | 'drive' | 'memory';
    title: string;
    url?: string;
    snippet?: string;
  }>;
  codeBlocks?: Array<{
    language: string;
    code: string;
    explanation?: string;
  }>;
}

export class PiecesCopilot {
  private agiCore: EnhancedAGICore;

  constructor() {
    this.agiCore = new EnhancedAGICore({
      enableMemory: true,
      enableConversationHistory: true,
      enableAdvancedReasoning: true,
    });
  }

  /**
   * Process copilot request with context
   */
  async processRequest(request: CopilotRequest): Promise<CopilotResponse> {
    const context = request.context || {};
    const relevantContext: CopilotResponse['relevantContext'] = [];

    // Gather LTM context if requested
    let ltmContext = '';
    if (context.includeLTM !== false) {
      const recentContexts = await ltmEngine.getRecentContext(request.userId, undefined, 10);
      if (recentContexts.length > 0) {
        ltmContext = this.formatLTMContext(recentContexts);
        relevantContext.push(
          ...recentContexts.slice(0, 5).map((ctx) => ({
            type: 'ltm' as const,
            title: ctx.title || ctx.url || 'Workflow context',
            url: ctx.url,
            snippet: ctx.content?.substring(0, 100),
          }))
        );
      }
    }

    // Gather Drive materials if requested
    let driveContext = '';
    if (context.includeDrive !== false) {
      const materials = await piecesDrive.getUserMaterials(request.userId, undefined, 10);
      if (materials.length > 0) {
        driveContext = this.formatDriveContext(materials);
        relevantContext.push(
          ...materials.slice(0, 5).map((mat) => ({
            type: 'drive' as const,
            title: mat.title,
            url: mat.url,
            snippet: mat.content?.substring(0, 100),
          }))
        );
      }
    }

    // Gather AGI memory if requested
    let memoryContext = '';
    if (context.includeMemory !== false) {
      const memories = await agiMemoryService.getEpisodicMemories(request.userId, 5);
      if (memories.length > 0) {
        memoryContext = this.formatMemoryContext(memories);
        relevantContext.push(
          ...memories.slice(0, 3).map((mem) => ({
            type: 'memory' as const,
            title: mem.description.substring(0, 50),
            snippet: mem.description.substring(0, 100),
          }))
        );
      }
    }

    // Build enhanced prompt with context
    const enhancedPrompt = this.buildEnhancedPrompt(
      request.prompt,
      {
        ltmContext,
        driveContext,
        memoryContext,
        codeContext: context.codeContext,
        filePath: context.filePath,
        task: request.task,
      }
    );

    // Generate response using AGI Core or direct LLM
    let response: string;
    let codeBlocks: CopilotResponse['codeBlocks'] = [];

    if (request.model === 'local') {
      // Use local model (would need local LLM setup)
      response = await this.generateWithLocalModel(enhancedPrompt);
    } else {
      // Use OpenAI or AGI Core
      if (request.task === 'debug' || request.task === 'generate' || request.task === 'comment') {
        // Use AGI Core for complex tasks
        const agiResponse = await this.agiCore.processInput(enhancedPrompt);
        response = agiResponse.reasoning.conclusion || 'I can help with that.';
        
        // Extract code blocks if any
        codeBlocks = this.extractCodeBlocks(agiResponse.reasoning.conclusion);
      } else {
        // Use direct OpenAI for simple questions
        response = await this.generateWithOpenAI(enhancedPrompt, request.model);
        codeBlocks = this.extractCodeBlocks(response);
      }
    }

    // Generate suggestions based on task
    const suggestions = this.generateSuggestions(request.task, response);

    return {
      response,
      suggestions,
      relevantContext,
      codeBlocks,
    };
  }

  /**
   * Debug code with context
   */
  async debugCode(
    userId: string,
    code: string,
    error?: string,
    filePath?: string
  ): Promise<CopilotResponse> {
    const prompt = error
      ? `Debug this code. Error: ${error}\n\nCode:\n${code}`
      : `Review and debug this code:\n\n${code}`;

    return this.processRequest({
      userId,
      prompt,
      task: 'debug',
      context: {
        codeContext: code,
        filePath,
        includeLTM: true,
        includeDrive: true,
      },
    });
  }

  /**
   * Generate code comments
   */
  async generateComments(
    userId: string,
    code: string,
    language?: string
  ): Promise<CopilotResponse> {
    const prompt = `Generate comprehensive comments for this ${language || 'code'}:\n\n${code}`;

    return this.processRequest({
      userId,
      prompt,
      task: 'comment',
      context: {
        codeContext: code,
        includeLTM: true,
      },
    });
  }

  /**
   * Answer question with context
   */
  async answerQuestion(
    userId: string,
    question: string
  ): Promise<CopilotResponse> {
    return this.processRequest({
      userId,
      prompt: question,
      task: 'question',
      context: {
        includeLTM: true,
        includeDrive: true,
        includeMemory: true,
      },
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private formatLTMContext(contexts: any[]): string {
    if (contexts.length === 0) return '';

    return `Recent workflow context:\n${contexts
      .slice(0, 5)
      .map((ctx, i) => `${i + 1}. ${ctx.title || ctx.url || 'Context'}: ${ctx.content?.substring(0, 200) || ''}`)
      .join('\n')}\n`;
  }

  private formatDriveContext(materials: any[]): string {
    if (materials.length === 0) return '';

    return `Saved materials:\n${materials
      .slice(0, 5)
      .map((mat, i) => `${i + 1}. ${mat.title} (${mat.materialType}): ${mat.content?.substring(0, 200) || mat.url || ''}`)
      .join('\n')}\n`;
  }

  private formatMemoryContext(memories: any[]): string {
    if (memories.length === 0) return '';

    return `Previous experiences:\n${memories
      .slice(0, 3)
      .map((mem, i) => `${i + 1}. ${mem.description}`)
      .join('\n')}\n`;
  }

  private buildEnhancedPrompt(
    prompt: string,
    context: {
      ltmContext?: string;
      driveContext?: string;
      memoryContext?: string;
      codeContext?: string;
      filePath?: string;
      task?: string;
    }
  ): string {
    let enhanced = prompt;

    if (context.codeContext) {
      enhanced = `Current code:\n${context.codeContext}\n\n${enhanced}`;
    }

    if (context.filePath) {
      enhanced = `File: ${context.filePath}\n\n${enhanced}`;
    }

    if (context.ltmContext) {
      enhanced = `${context.ltmContext}\n${enhanced}`;
    }

    if (context.driveContext) {
      enhanced = `${context.driveContext}\n${enhanced}`;
    }

    if (context.memoryContext) {
      enhanced = `${context.memoryContext}\n${enhanced}`;
    }

    // Add task-specific instructions
    if (context.task === 'debug') {
      enhanced = `You are a debugging assistant. Analyze the code and identify issues, then provide fixes.\n\n${enhanced}`;
    } else if (context.task === 'comment') {
      enhanced = `You are a code documentation assistant. Generate clear, helpful comments.\n\n${enhanced}`;
    } else if (context.task === 'generate') {
      enhanced = `You are a code generation assistant. Generate clean, well-structured code.\n\n${enhanced}`;
    }

    return enhanced;
  }

  private async generateWithOpenAI(prompt: string, model: string = 'gpt-4-turbo'): Promise<string> {
    try {
      const { text } = await generateText({
        model: openai(model),
        prompt,
      });
      return text;
    } catch (error) {
      console.error('OpenAI generation error:', error);
      return 'I encountered an error generating a response. Please try again.';
    }
  }

  private async generateWithLocalModel(prompt: string): Promise<string> {
    // Placeholder for local model integration
    // In production, this would connect to a local LLM service
    return 'Local model integration coming soon.';
  }

  private extractCodeBlocks(text: string): CopilotResponse['codeBlocks'] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: CopilotResponse['codeBlocks'] = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }

    return blocks;
  }

  private generateSuggestions(task?: string, response?: string): string[] {
    const suggestions: string[] = [];

    if (task === 'debug') {
      suggestions.push('Try running the code to verify the fix');
      suggestions.push('Check for similar issues in related files');
      suggestions.push('Review error logs for additional context');
    } else if (task === 'comment') {
      suggestions.push('Add comments to complex logic sections');
      suggestions.push('Document function parameters and return values');
      suggestions.push('Include usage examples in comments');
    } else if (task === 'generate') {
      suggestions.push('Test the generated code thoroughly');
      suggestions.push('Add error handling as needed');
      suggestions.push('Consider edge cases');
    }

    return suggestions;
  }
}

// Export singleton instance
export const piecesCopilot = new PiecesCopilot();
