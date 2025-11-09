import { aiOrchestrator } from '../ai/orchestrator';
import { PineconeService } from '../pinecone-service';
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
    try {
      // Use Pinecone to search for relevant documents in knowledge base
      const searchResults = await PineconeService.searchSimilar(claim, 5);
      
      if (!searchResults || searchResults.length === 0) {
        console.warn('No sources found in knowledge base for claim:', claim);
        return [];
      }
      
      // Convert Pinecone results to Source format
      return searchResults.map((result: any) => ({
        url: result.metadata?.source || result.metadata?.url || `internal://${result.id}`,
        title: result.metadata?.documentName || result.metadata?.title || 'Internal Knowledge',
        domain: result.metadata?.domain || 'knowledge-base',
        reliability: result.score || 0.5,
        publishDate: result.metadata?.publishDate ? new Date(result.metadata.publishDate) : undefined,
        content: result.metadata?.text || '',
      }));
    } catch (error) {
      console.error('Failed to find sources from knowledge base:', error);
      
      // Fallback: Return empty array instead of fake data
      // This is better than returning example.com which misleads users
      return [];
    }
  }

  private async extractEvidence(claim: string, sources: Source[]): Promise<Evidence[]> {
    if (sources.length === 0) {
      return [];
    }
    
    const evidence: Evidence[] = [];
    
    for (const source of sources) {
      try {
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

        evidence.push(...extraction.evidence.map((e: any) => ({
          ...e,
          source: source.url,
        })));
      } catch (error) {
        console.error(`Failed to extract evidence from source ${source.url}:`, error);
        // Continue with other sources
      }
    }

    return evidence;
  }

  private async performNLI(claim: string, evidence: Evidence[]): Promise<any> {
    if (evidence.length === 0) {
      return {
        entailment: 0,
        contradiction: 0,
        neutral: 1,
        reasoning: 'No evidence available to perform inference',
      };
    }
    
    const nliPrompt = `
Perform natural language inference on this claim against the evidence:

Claim: ${claim}

Evidence:
${evidence.map((e, i) => `${i + 1}. [${e.type}] ${e.content}`).join('\n')}

Determine if the evidence entails, contradicts, or is neutral to the claim.
`;

    try {
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
    } catch (error) {
      console.error('Failed to perform NLI:', error);
      return {
        entailment: 0,
        contradiction: 0,
        neutral: 1,
        reasoning: 'Failed to analyze evidence',
      };
    }
  }

  private calculateConfidence(evidence: Evidence[], nliResults: any): number {
    if (evidence.length === 0) {
      return 0;
    }
    
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
    if (evidence.length === 0) {
      return 'Unable to verify this claim as no relevant sources were found in the knowledge base. Please add relevant documents to the knowledge base or provide additional context.';
    }
    
    const prompt = `
Explain the verification result for this claim:

Claim: ${claim}

Evidence: ${JSON.stringify(evidence)}
NLI Results: ${JSON.stringify(nliResults)}

Provide clear reasoning for the verification decision.
`;

    try {
      const response = await aiOrchestrator.generateCompletion('gpt-4-turbo', [
        { role: 'user', content: prompt }
      ]);

      return response as string;
    } catch (error) {
      console.error('Failed to generate reasoning:', error);
      return 'Unable to generate reasoning for this verification result.';
    }
  }
}

export const verificationEngine = new VerificationEngine();
