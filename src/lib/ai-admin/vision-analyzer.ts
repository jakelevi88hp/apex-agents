/**
 * Vision API Integration for AI Admin
 * 
 * Analyzes images using OpenAI's Vision API to extract:
 * - UI components and layouts
 * - Code screenshots
 * - Design mockups
 * - Diagrams and flowcharts
 * - Error messages and stack traces
 */

import OpenAI from 'openai';

export interface VisionAnalysisResult {
  description: string;
  detectedElements: string[];
  suggestedContext: string;
  codeSnippets?: string[];
  uiComponents?: string[];
  errorMessages?: string[];
}

export class VisionAnalyzer {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze an image and extract relevant information for code generation
   */
  async analyzeImage(imageUrl: string, context?: string): Promise<VisionAnalysisResult> {
    try {
      const systemPrompt = `You are an expert at analyzing images for software development purposes.
When analyzing images, identify:
1. UI components (buttons, forms, layouts, navigation)
2. Code snippets or screenshots
3. Design mockups or wireframes
4. Diagrams, flowcharts, or architecture diagrams
5. Error messages or stack traces
6. Text content that might be relevant

Provide a detailed description and extract specific elements that would be useful for code generation.`;

      const userPrompt = context 
        ? `Analyze this image in the context of: ${context}\n\nProvide a detailed analysis including any UI components, code patterns, or design elements visible.`
        : `Analyze this image and identify any UI components, code patterns, design elements, or other relevant information for software development.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const analysisText = response.choices[0].message.content || '';

      // Parse the analysis to extract structured information
      const result = this.parseAnalysis(analysisText);

      return result;
    } catch (error) {
      console.error('[VisionAnalyzer] Analysis failed:', error);
      throw new Error(`Vision analysis failed: ${error}`);
    }
  }

  /**
   * Analyze multiple images in a batch
   */
  async analyzeImages(imageUrls: string[], context?: string): Promise<VisionAnalysisResult[]> {
    const results: VisionAnalysisResult[] = [];

    for (const url of imageUrls) {
      try {
        const result = await this.analyzeImage(url, context);
        results.push(result);
      } catch (error) {
        console.error(`[VisionAnalyzer] Failed to analyze image ${url}:`, error);
        results.push({
          description: 'Analysis failed',
          detectedElements: [],
          suggestedContext: '',
        });
      }
    }

    return results;
  }

  /**
   * Parse analysis text to extract structured information
   */
  private parseAnalysis(text: string): VisionAnalysisResult {
    const result: VisionAnalysisResult = {
      description: text,
      detectedElements: [],
      suggestedContext: '',
    };

    // Extract UI components
    const uiComponentPatterns = [
      /button/gi,
      /form/gi,
      /input/gi,
      /navigation/gi,
      /header/gi,
      /footer/gi,
      /sidebar/gi,
      /modal/gi,
      /dialog/gi,
      /dropdown/gi,
      /menu/gi,
      /card/gi,
      /table/gi,
      /list/gi,
      /grid/gi,
    ];

    const uiComponents: string[] = [];
    for (const pattern of uiComponentPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        uiComponents.push(...matches.map(m => m.toLowerCase()));
      }
    }
    result.uiComponents = [...new Set(uiComponents)];

    // Extract code snippets (look for code-related keywords)
    const codePatterns = [
      /```[\s\S]*?```/g,
      /`[^`]+`/g,
    ];

    const codeSnippets: string[] = [];
    for (const pattern of codePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        codeSnippets.push(...matches);
      }
    }
    result.codeSnippets = codeSnippets;

    // Extract error messages
    const errorPatterns = [
      /error:[\s\S]*?$/gim,
      /exception:[\s\S]*?$/gim,
      /failed:[\s\S]*?$/gim,
    ];

    const errorMessages: string[] = [];
    for (const pattern of errorPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        errorMessages.push(...matches);
      }
    }
    result.errorMessages = errorMessages;

    // Extract all detected elements
    result.detectedElements = [
      ...result.uiComponents || [],
      ...(result.codeSnippets?.length ? ['code snippet'] : []),
      ...(result.errorMessages?.length ? ['error message'] : []),
    ];

    // Generate suggested context
    if (result.uiComponents && result.uiComponents.length > 0) {
      result.suggestedContext = `UI components detected: ${result.uiComponents.join(', ')}`;
    } else if (result.codeSnippets && result.codeSnippets.length > 0) {
      result.suggestedContext = 'Code snippet detected in image';
    } else if (result.errorMessages && result.errorMessages.length > 0) {
      result.suggestedContext = 'Error message detected in image';
    } else {
      result.suggestedContext = 'General image analysis';
    }

    return result;
  }

  /**
   * Create a summary of multiple image analyses
   */
  summarizeAnalyses(analyses: VisionAnalysisResult[]): string {
    const allComponents = new Set<string>();
    const allElements = new Set<string>();
    let hasCode = false;
    let hasErrors = false;

    for (const analysis of analyses) {
      if (analysis.uiComponents) {
        analysis.uiComponents.forEach(c => allComponents.add(c));
      }
      analysis.detectedElements.forEach(e => allElements.add(e));
      if (analysis.codeSnippets && analysis.codeSnippets.length > 0) {
        hasCode = true;
      }
      if (analysis.errorMessages && analysis.errorMessages.length > 0) {
        hasErrors = true;
      }
    }

    let summary = `Analyzed ${analyses.length} image(s).\n\n`;

    if (allComponents.size > 0) {
      summary += `UI Components: ${Array.from(allComponents).join(', ')}\n`;
    }

    if (hasCode) {
      summary += `Code snippets detected\n`;
    }

    if (hasErrors) {
      summary += `Error messages detected\n`;
    }

    summary += `\nAll detected elements: ${Array.from(allElements).join(', ')}`;

    return summary;
  }
}
