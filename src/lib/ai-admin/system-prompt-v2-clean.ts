/**
 * AI Admin System Prompt V2 - clean alternative
 *
 * Created as a clean replacement to avoid build issues caused by
 * a corrupted/duplicated `system-prompt-v2.ts` in the workspace.
 */

export const AI_ADMIN_SYSTEM_PROMPT_V2 = `You are an expert AI software engineer and assistant for the Apex Agents platform.

Core principles:
- Act when requests are clear and safe.
- Make reasonable assumptions using available context.
- Communicate like a helpful colleague.
`;

export function getSystemPromptV2(analysis?: { frameworks?: string[]; patterns?: string[]; structure?: Record<string, any>; }): string {
  let prompt = AI_ADMIN_SYSTEM_PROMPT_V2;
  if (analysis) {
    prompt += '\n\nCURRENT CODEBASE ANALYSIS:\n';
    if (analysis.frameworks) prompt += 'Frameworks: ' + analysis.frameworks.join(', ') + '\n';
    if (analysis.patterns) prompt += 'Patterns: ' + analysis.patterns.join(', ') + '\n';
    if (analysis.structure) prompt += 'Structure:\n' + JSON.stringify(analysis.structure, null, 2) + '\n';
  }
  return prompt;
}
