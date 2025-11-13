import 'server-only';
/**
 * Plain Language Patch Generation
 * 
 * Simplified patch generation flow that accepts plain-language requests
 * and handles all the complexity internally.
 */

import { AIAdminAgent } from './agent';
import { InterpretedRequest } from './request-interpreter';

export interface PlainLanguagePatchResult {
  success: boolean;
  interpreted?: InterpretedRequest;
  patch?: any;
  clarificationNeeded?: string;
  confirmationMessage?: string;
  error?: string;
}

/**
 * Generate a patch from a simple plain-language request
 * 
 * This is the main entry point for administrators who want to make changes
 * using simple, natural language.
 * 
 * Examples:
 * - "add dark mode"
 * - "fix the login bug"
 * - "make the dashboard prettier"
 * - "add export to CSV"
 */
export async function generatePatchFromPlainLanguage(
  agent: AIAdminAgent,
  request: string,
  skipConfirmation: boolean = false
): Promise<PlainLanguagePatchResult> {
  try {
    // Step 1: Interpret the request
    console.log(`[Plain Language] Interpreting request: "${request}"`);
    
    // Analyze codebase to provide context for interpretation
    const analysis = await (agent as any).analyzeCodebase();
    
    const interpreted = await (agent as any).requestInterpreter.interpret(request, {
      structure: analysis.structure,
      components: analysis.patterns.filter((p: string) => p.includes('component')),
      pages: Object.keys(analysis.structure).filter(k => k.includes('page') || k.includes('route')),
      apis: Object.keys(analysis.structure).filter(k => k.includes('api')),
    });

    console.log(`[Plain Language] Interpretation complete:`, {
      intent: interpreted.intent,
      scope: interpreted.scope,
      confidence: interpreted.confidence,
      filesCount: interpreted.suggestedFiles.length,
      actionsCount: interpreted.suggestedActions.length,
    });

    // Step 2: Check if clarification is needed
    const isRequestClear = (agent as any).requestInterpreter.isRequestClear(interpreted);
    
    if (!isRequestClear) {
      const clarificationMessage = (agent as any).requestInterpreter.generateClarificationMessage(interpreted);
      console.log(`[Plain Language] Clarification needed`);
      
      return {
        success: false,
        interpreted,
        clarificationNeeded: clarificationMessage,
      };
    }

    // Step 3: Generate confirmation message (unless skipped)
    if (!skipConfirmation) {
      const confirmationMessage = (agent as any).requestInterpreter.generateConfirmationMessage(interpreted);
      console.log(`[Plain Language] Confirmation message generated`);
      
      return {
        success: true,
        interpreted,
        confirmationMessage,
      };
    }

    // Step 4: Generate the patch using the expanded description
    console.log(`[Plain Language] Generating patch with expanded description...`);
    
    // Build enhanced request text
    const enhancedRequest = `${interpreted.expandedDescription}

SPECIFIC ACTIONS TO TAKE:
${interpreted.suggestedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

SUGGESTED FILES TO MODIFY:
${interpreted.suggestedFiles.join('\n')}

${interpreted.technicalDetails.frameworks.length > 0 ? `\nFRAMEWORKS TO USE:\n${interpreted.technicalDetails.frameworks.join(', ')}` : ''}

${interpreted.technicalDetails.patterns.length > 0 ? `\nPATTERNS TO FOLLOW:\n${interpreted.technicalDetails.patterns.join(', ')}` : ''}

${interpreted.technicalDetails.dependencies.length > 0 ? `\nDEPENDENCIES NEEDED:\n${interpreted.technicalDetails.dependencies.join(', ')}` : ''}

${interpreted.examples.length > 0 ? `\nSIMILAR IMPLEMENTATIONS TO REFERENCE:\n${interpreted.examples.join('\n')}` : ''}

ORIGINAL REQUEST: "${request}"`;

    const patch = await agent.generatePatch(enhancedRequest);

    console.log(`[Plain Language] Patch generated successfully`);

    return {
      success: true,
      interpreted,
      patch,
    };

  } catch (error) {
    console.error(`[Plain Language] Error:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get example requests to show administrators
 */
export function getExampleRequests(): Array<{ simple: string; expanded: string }> {
  return [
    {
      simple: "add dark mode",
      expanded: "Implement a complete dark mode theme system with toggle, persistence, and support across all pages"
    },
    {
      simple: "fix the login bug",
      expanded: "Debug and fix authentication issues, improve error handling, and enhance user feedback"
    },
    {
      simple: "make the dashboard prettier",
      expanded: "Redesign the dashboard with modern UI components, better layout, and improved visual hierarchy"
    },
    {
      simple: "add export to CSV",
      expanded: "Implement CSV export functionality for data tables with proper formatting and download"
    },
    {
      simple: "improve performance",
      expanded: "Optimize page load times, implement code splitting, add caching, and improve database queries"
    },
    {
      simple: "add user profiles",
      expanded: "Create user profile pages with avatar upload, bio editing, and settings management"
    },
    {
      simple: "fix mobile layout",
      expanded: "Make the application fully responsive with mobile-first design and touch-friendly interactions"
    },
    {
      simple: "add notifications",
      expanded: "Implement a notification system with real-time updates, persistence, and user preferences"
    },
    {
      simple: "improve security",
      expanded: "Add CSRF protection, rate limiting, input sanitization, and security headers"
    },
    {
      simple: "add search",
      expanded: "Implement full-text search with filters, sorting, and pagination across relevant data"
    },
  ];
}
