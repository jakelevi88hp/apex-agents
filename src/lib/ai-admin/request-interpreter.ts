/**
 * Request Interpreter
 * 
 * Interprets simple plain-language requests and expands them into detailed,
 * actionable specifications for patch generation.
 */

import { OpenAI } from 'openai';

export interface InterpretedRequest {
  original: string;
  intent: string;
  scope: 'feature' | 'bug_fix' | 'enhancement' | 'refactor' | 'ui_change' | 'config' | 'unclear';
  confidence: number; // 0.0 to 1.0
  expandedDescription: string;
  suggestedFiles: string[];
  suggestedActions: string[];
  clarificationNeeded: string[];
  examples: string[];
  technicalDetails: {
    frameworks: string[];
    patterns: string[];
    dependencies: string[];
  };
}

export class RequestInterpreter {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Interpret a plain-language request and expand it into detailed specifications
   */
  async interpret(request: string, codebaseContext?: {
    structure?: Record<string, any>;
    components?: string[];
    pages?: string[];
    apis?: string[];
  }): Promise<InterpretedRequest> {
    const systemPrompt = `You are an expert at interpreting plain-language software development requests.

Your job is to take vague, simple requests from administrators and expand them into detailed, actionable specifications.

You should:
1. Identify the core intent (what they really want)
2. Determine the scope (feature, bug fix, enhancement, etc.)
3. Expand the request with technical details
4. Suggest specific files that might need changes
5. Suggest specific actions to take
6. Identify any clarifications needed
7. Provide examples of similar implementations

Be generous in your interpretation - if someone says "add dark mode", expand that to include:
- Theme context/provider
- Color scheme definitions
- Toggle UI component
- Persistence (localStorage or user settings)
- All pages/components that need theme support

If someone says "fix the login bug", expand that to include:
- Authentication flow analysis
- Error handling improvements
- Validation enhancements
- User feedback improvements

Always assume the administrator wants a complete, production-ready implementation, not just a minimal change.`;

    const userPrompt = `Interpret this request and expand it into detailed specifications:

REQUEST: "${request}"

${codebaseContext ? `
CODEBASE CONTEXT:
- Structure: ${JSON.stringify(codebaseContext.structure, null, 2)}
- Components: ${codebaseContext.components?.join(', ') || 'Unknown'}
- Pages: ${codebaseContext.pages?.join(', ') || 'Unknown'}
- APIs: ${codebaseContext.apis?.join(', ') || 'Unknown'}
` : ''}

Provide a JSON response with this structure:
{
  "original": "the original request",
  "intent": "what the user really wants (1-2 sentences)",
  "scope": "feature" | "bug_fix" | "enhancement" | "refactor" | "ui_change" | "config" | "unclear",
  "confidence": 0.0 to 1.0,
  "expandedDescription": "detailed description of what needs to be done (3-5 paragraphs)",
  "suggestedFiles": ["list of files that might need changes"],
  "suggestedActions": ["list of specific actions to take"],
  "clarificationNeeded": ["list of questions if anything is unclear"],
  "examples": ["list of similar features/implementations to reference"],
  "technicalDetails": {
    "frameworks": ["React", "Next.js", etc.],
    "patterns": ["Context API", "Custom Hooks", etc.],
    "dependencies": ["npm packages that might be needed"]
  }
}`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = response.choices[0].message.content || '{}';
    const interpreted: InterpretedRequest = JSON.parse(content);

    return interpreted;
  }

  /**
   * Generate example requests for administrators
   */
  getExampleRequests(): Array<{ simple: string; expanded: string }> {
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

  /**
   * Validate if a request is clear enough to proceed
   */
  isRequestClear(interpreted: InterpretedRequest): boolean {
    return (
      interpreted.confidence >= 0.7 &&
      interpreted.scope !== 'unclear' &&
      interpreted.clarificationNeeded.length === 0
    );
  }

  /**
   * Generate clarification questions for unclear requests
   */
  generateClarificationMessage(interpreted: InterpretedRequest): string {
    if (this.isRequestClear(interpreted)) {
      return '';
    }

    let message = `I need some clarification to proceed with your request:\n\n`;
    
    if (interpreted.scope === 'unclear') {
      message += `❓ I'm not sure what you want to accomplish. Could you provide more details?\n\n`;
    }

    if (interpreted.confidence < 0.7) {
      message += `❓ I'm only ${(interpreted.confidence * 100).toFixed(0)}% confident I understand your request.\n\n`;
    }

    if (interpreted.clarificationNeeded.length > 0) {
      message += `Please answer these questions:\n`;
      interpreted.clarificationNeeded.forEach((question, i) => {
        message += `${i + 1}. ${question}\n`;
      });
      message += `\n`;
    }

    message += `\nHere's what I think you want:\n${interpreted.intent}\n\n`;
    message += `Is this correct? If so, I can proceed. If not, please clarify.`;

    return message;
  }

  /**
   * Generate a summary of the interpreted request for user confirmation
   */
  generateConfirmationMessage(interpreted: InterpretedRequest): string {
    return `I understand you want to: **${interpreted.intent}**

**Scope:** ${interpreted.scope.replace('_', ' ')}
**Confidence:** ${(interpreted.confidence * 100).toFixed(0)}%

**What I'll do:**
${interpreted.expandedDescription}

**Files that will be modified:**
${interpreted.suggestedFiles.map(f => `- ${f}`).join('\n')}

**Actions:**
${interpreted.suggestedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

${interpreted.technicalDetails.dependencies.length > 0 ? `\n**New dependencies:**\n${interpreted.technicalDetails.dependencies.map(d => `- ${d}`).join('\n')}` : ''}

${interpreted.examples.length > 0 ? `\n**Similar implementations:**\n${interpreted.examples.map(e => `- ${e}`).join('\n')}` : ''}

Would you like me to proceed with generating this patch?`;
  }
}
