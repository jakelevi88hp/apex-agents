import { aiOrchestrator } from '../ai/orchestrator';
import { z } from 'zod';

export interface VerificationResult {
  claim: string;
  status: 'verified' | 'unverified' | 'disputed' | 'pending';
  confidence: number;
  sources: Source[];
  evidence: Evidence[];
  reasoning: string;
}

export interface Source {
  url: string;
  title: string;
  domain: string;
  reliability: number;
  publishDate?: Date;
  content: string;
}

export interface Evidence {
  type: 'supporting' | 'contradicting' | 'neutral';
  content: string;
  source: string;
  strength: number;
}

export class VerificationEngine {
  async verify(claim: string, context?: Record<string, any>): Promise<VerificationResult> {
    const sources = await this.findSources(claim);
    const evidence = await this.extractEvidence(claim, sources);
    const nliResults = await this.performNLI(claim, evidence);
    const confidence = this.calculateConfidence(evidence, nliResults);
    const status = this.determineStatus(confidence, evidence);
    const reasoning = await this.generateReasoning(claim, evidence, nliResults);

    return {
      claim,
      status,
      confidence,
      sources,
      evidence,
      reasoning,
    };
  }

  private async findSources(claim: string): Promise<Source[]> {
    const searchPrompt = `Generate search queries to verify this claim: "${claim}"`;
    const queries = await aiOrchestrator.generateStructuredOutput(
      'gpt-4-turbo',
      searchPrompt,
      z.object({ queries: z.array(z.string()) })
    );

    return [
      {
        url: 'https://example.com/article',
        title: 'Related Article',
        domain: 'example.com',
        reliability: 0.8,
        content: 'Article content...',
      },
    ];
  }

  private async extractEvidence(claim: string, sources: Source[]): Promise<Evidence[]> {
    const evidence: Evidence[] = [];
    
    for (const source of sources) {
      const extraction = await aiOrchestrator.generateStructuredOutput(
        'gpt-4-turbo',
        `Extract evidence from this source that relates to the claim: "${claim}"\n\nSource: ${source.content}`,
        z.object({
          evidence: z.array(z.object({
            type: z.enum(['supporting', 'contradicting', 'neutral']),
            content: z.string(),
            strength: z.number().min(0).max(1),
          })),
        })
      );

      evidence.push(...extraction.evidence.map(e => ({
        ...e,
        source: source.url,
      })));
    }

    return evidence;
  }

  private async performNLI(claim: string, evidence: Evidence[]): Promise<any> {
    const nliPrompt = `
Perform natural language inference on this claim against the evidence:

Claim: ${claim}

Evidence:
${evidence.map((e, i) => `${i + 1}. [${e.type}] ${e.content}`).join('\n')}

Determine if the evidence entails, contradicts, or is neutral to the claim.
`;

    return await aiOrchestrator.generateStructuredOutput(
      'gpt-4-turbo',
      nliPrompt,
      z.object({
        entailment: z.number().min(0).max(1),
        contradiction: z.number().min(0).max(1),
        neutral: z.number().min(0).max(1),
        reasoning: z.string(),
      })
    );
  }

  private calculateConfidence(evidence: Evidence[], nliResults: any): number {
    const supportingEvidence = evidence.filter(e => e.type === 'supporting');
    const contradictingEvidence = evidence.filter(e => e.type === 'contradicting');
    
    const supportScore = supportingEvidence.reduce((sum, e) => sum + e.strength, 0);
    const contradictScore = contradictingEvidence.reduce((sum, e) => sum + e.strength, 0);
    
    const evidenceScore = supportScore / (supportScore + contradictScore + 0.01);
    const nliScore = nliResults.entailment;
    
    return (evidenceScore + nliScore) / 2;
  }

  private determineStatus(confidence: number, evidence: Evidence[]): VerificationResult['status'] {
    if (confidence > 0.8) return 'verified';
    if (confidence < 0.3) return 'disputed';
    if (evidence.length === 0) return 'pending';
    return 'unverified';
  }

  private async generateReasoning(claim: string, evidence: Evidence[], nliResults: any): Promise<string> {
    const prompt = `
Explain the verification result for this claim:

Claim: ${claim}

Evidence: ${JSON.stringify(evidence)}
NLI Results: ${JSON.stringify(nliResults)}

Provide clear reasoning for the verification decision.
`;

    const response = await aiOrchestrator.generateCompletion('gpt-4-turbo', [
      { role: 'user', content: prompt }
    ]);

    return response as string;
  }
}

export const verificationEngine = new VerificationEngine();

