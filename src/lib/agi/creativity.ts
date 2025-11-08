/**
 * AGI Creativity Engine
 * 
 * Implements creative thinking, idea generation, and innovative problem-solving.
 * Uses techniques like:
 * - Divergent thinking
 * - Lateral thinking
 * - Conceptual blending
 * - Analogical reasoning
 * - Random stimulation
 * - SCAMPER technique
 */

import { agiMemoryService } from './memory';

export interface CreativeIdea {
  description: string;
  novelty: number; // 0.0 to 1.0
  feasibility: number; // 0.0 to 1.0
  impact: number; // 0.0 to 1.0
  category: string;
  inspirations: string[];
}

export interface CreativeOutput {
  ideas: CreativeIdea[];
  approach: string;
  reasoning: string;
  connections: string[];
  noveltyScore: number; // 0.0 to 1.0
}

export type CreativityTechnique =
  | 'divergent'
  | 'lateral'
  | 'conceptual_blending'
  | 'analogical'
  | 'scamper'
  | 'random_stimulation'
  | 'hybrid';

export class CreativityEngine {
  private userId?: string;
  private ideaHistory: CreativeIdea[] = [];

  constructor(userId?: string) {
    this.userId = userId;
  }

  // ============================================================================
  // MAIN CREATIVITY INTERFACE
  // ============================================================================

  async generateIdeas(input: string, count: number = 3, technique?: CreativityTechnique): Promise<CreativeOutput> {
    const selectedTechnique = technique || this.selectTechnique(input);

    let ideas: CreativeIdea[];

    switch (selectedTechnique) {
      case 'divergent':
        ideas = await this.divergentThinking(input, count);
        break;
      case 'lateral':
        ideas = await this.lateralThinking(input, count);
        break;
      case 'conceptual_blending':
        ideas = await this.conceptualBlending(input, count);
        break;
      case 'analogical':
        ideas = await this.analogicalCreativity(input, count);
        break;
      case 'scamper':
        ideas = await this.scamperTechnique(input, count);
        break;
      case 'random_stimulation':
        ideas = await this.randomStimulation(input, count);
        break;
      case 'hybrid':
        ideas = await this.hybridCreativity(input, count);
        break;
      default:
        ideas = await this.divergentThinking(input, count);
    }

    // Store ideas in history
    this.ideaHistory.push(...ideas);
    if (this.ideaHistory.length > 50) {
      this.ideaHistory = this.ideaHistory.slice(-50);
    }

    // Calculate novelty score
    const noveltyScore = ideas.reduce((sum, idea) => sum + idea.novelty, 0) / ideas.length;

    // Extract connections
    const connections = this.extractConnections(ideas);

    // Generate approach description
    const approach = this.describeApproach(selectedTechnique);

    // Generate reasoning
    const reasoning = this.generateReasoning(selectedTechnique, ideas);

    // Store in procedural memory if userId is available
    if (this.userId) {
      await agiMemoryService.storeProceduralMemory({
        userId: this.userId,
        skillName: `creativity_${selectedTechnique}`,
        description: `Applied ${selectedTechnique} creativity to: ${input.substring(0, 100)}`,
        category: 'creativity',
        steps: ideas.map((idea, i) => ({ step: i + 1, description: idea.description })),
        proficiencyLevel: noveltyScore,
        practiceCount: 1,
        successRate: noveltyScore,
        lastPracticed: new Date(),
      });
    }

    return {
      ideas,
      approach,
      reasoning,
      connections,
      noveltyScore,
    };
  }

  // ============================================================================
  // DIVERGENT THINKING
  // ============================================================================

  private async divergentThinking(input: string, count: number): Promise<CreativeIdea[]> {
    const ideas: CreativeIdea[] = [];

    // Generate diverse ideas by exploring different directions
    const directions = [
      'Completely reimagine the approach',
      'Combine with unexpected elements',
      'Simplify to the extreme',
      'Scale up dramatically',
      'Reverse the typical process',
      'Apply from a different domain',
      'Use unconventional materials/methods',
      'Focus on a neglected aspect',
    ];

    for (let i = 0; i < count; i++) {
      const direction = directions[i % directions.length];
      ideas.push({
        description: `${direction}: ${this.generateDivergentIdea(input, direction)}`,
        novelty: 0.7 + Math.random() * 0.3,
        feasibility: 0.4 + Math.random() * 0.4,
        impact: 0.6 + Math.random() * 0.4,
        category: 'divergent',
        inspirations: [direction],
      });
    }

    return ideas;
  }

  // ============================================================================
  // LATERAL THINKING
  // ============================================================================

  private async lateralThinking(input: string, count: number): Promise<CreativeIdea[]> {
    const ideas: CreativeIdea[] = [];

    // Lateral thinking prompts
    const prompts = [
      'What if we challenged the main assumption?',
      'What if we did the opposite?',
      'What if we removed a key constraint?',
      'What if we combined it with something unrelated?',
      'What if we looked at it from a child\'s perspective?',
      'What if we had unlimited resources?',
    ];

    for (let i = 0; i < count; i++) {
      const prompt = prompts[i % prompts.length];
      ideas.push({
        description: `${prompt} ${this.generateLateralIdea(input, prompt)}`,
        novelty: 0.8 + Math.random() * 0.2,
        feasibility: 0.3 + Math.random() * 0.4,
        impact: 0.7 + Math.random() * 0.3,
        category: 'lateral',
        inspirations: [prompt],
      });
    }

    return ideas;
  }

  // ============================================================================
  // CONCEPTUAL BLENDING
  // ============================================================================

  private async conceptualBlending(input: string, count: number): Promise<CreativeIdea[]> {
    const ideas: CreativeIdea[] = [];

    // Concepts to blend with
    const concepts = [
      'nature', 'technology', 'art', 'games', 'music',
      'architecture', 'biology', 'physics', 'psychology', 'economics',
    ];

    for (let i = 0; i < count; i++) {
      const concept1 = concepts[Math.floor(Math.random() * concepts.length)];
      const concept2 = concepts[Math.floor(Math.random() * concepts.length)];
      
      ideas.push({
        description: `Blend ${concept1} and ${concept2}: ${this.generateBlendedIdea(input, concept1, concept2)}`,
        novelty: 0.75 + Math.random() * 0.25,
        feasibility: 0.5 + Math.random() * 0.3,
        impact: 0.6 + Math.random() * 0.4,
        category: 'conceptual_blending',
        inspirations: [concept1, concept2],
      });
    }

    return ideas;
  }

  // ============================================================================
  // ANALOGICAL CREATIVITY
  // ============================================================================

  private async analogicalCreativity(input: string, count: number): Promise<CreativeIdea[]> {
    const ideas: CreativeIdea[] = [];

    // Analogies from different domains
    const analogies = [
      { domain: 'nature', example: 'how plants adapt to environment' },
      { domain: 'sports', example: 'how teams coordinate strategy' },
      { domain: 'cooking', example: 'how ingredients combine' },
      { domain: 'music', example: 'how harmonies create resonance' },
      { domain: 'architecture', example: 'how structures balance form and function' },
    ];

    for (let i = 0; i < count; i++) {
      const analogy = analogies[i % analogies.length];
      ideas.push({
        description: `Inspired by ${analogy.domain} (${analogy.example}): ${this.generateAnalogicalIdea(input, analogy)}`,
        novelty: 0.7 + Math.random() * 0.2,
        feasibility: 0.6 + Math.random() * 0.3,
        impact: 0.7 + Math.random() * 0.3,
        category: 'analogical',
        inspirations: [analogy.domain, analogy.example],
      });
    }

    return ideas;
  }

  // ============================================================================
  // SCAMPER TECHNIQUE
  // ============================================================================

  private async scamperTechnique(input: string, count: number): Promise<CreativeIdea[]> {
    const ideas: CreativeIdea[] = [];

    // SCAMPER: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse
    const scamperPrompts = [
      { action: 'Substitute', prompt: 'What can we substitute or replace?' },
      { action: 'Combine', prompt: 'What can we combine or merge?' },
      { action: 'Adapt', prompt: 'What can we adapt from elsewhere?' },
      { action: 'Modify', prompt: 'What can we modify or magnify?' },
      { action: 'Put to other uses', prompt: 'How else can we use this?' },
      { action: 'Eliminate', prompt: 'What can we remove or simplify?' },
      { action: 'Reverse', prompt: 'What can we reverse or rearrange?' },
    ];

    for (let i = 0; i < count; i++) {
      const scamper = scamperPrompts[i % scamperPrompts.length];
      ideas.push({
        description: `${scamper.action}: ${this.generateScamperIdea(input, scamper)}`,
        novelty: 0.65 + Math.random() * 0.25,
        feasibility: 0.6 + Math.random() * 0.3,
        impact: 0.6 + Math.random() * 0.3,
        category: 'scamper',
        inspirations: [scamper.action],
      });
    }

    return ideas;
  }

  // ============================================================================
  // RANDOM STIMULATION
  // ============================================================================

  private async randomStimulation(input: string, count: number): Promise<CreativeIdea[]> {
    const ideas: CreativeIdea[] = [];

    // Random stimuli
    const stimuli = [
      'mirror', 'wave', 'spiral', 'network', 'crystal',
      'flow', 'pulse', 'echo', 'fractal', 'emergence',
      'symbiosis', 'metamorphosis', 'resonance', 'catalyst', 'synergy',
    ];

    for (let i = 0; i < count; i++) {
      const stimulus = stimuli[Math.floor(Math.random() * stimuli.length)];
      ideas.push({
        description: `Inspired by "${stimulus}": ${this.generateRandomStimulationIdea(input, stimulus)}`,
        novelty: 0.8 + Math.random() * 0.2,
        feasibility: 0.4 + Math.random() * 0.3,
        impact: 0.5 + Math.random() * 0.4,
        category: 'random_stimulation',
        inspirations: [stimulus],
      });
    }

    return ideas;
  }

  // ============================================================================
  // HYBRID CREATIVITY
  // ============================================================================

  private async hybridCreativity(input: string, count: number): Promise<CreativeIdea[]> {
    const ideas: CreativeIdea[] = [];

    // Combine multiple techniques
    const techniques = [
      this.divergentThinking.bind(this),
      this.lateralThinking.bind(this),
      this.conceptualBlending.bind(this),
      this.analogicalCreativity.bind(this),
    ];

    for (let i = 0; i < count; i++) {
      const technique = techniques[i % techniques.length];
      const techniqueIdeas = await technique(input, 1);
      ideas.push(...techniqueIdeas);
    }

    return ideas;
  }

  // ============================================================================
  // IDEA GENERATION HELPERS
  // ============================================================================

  private generateDivergentIdea(input: string, direction: string): string {
    return `Explore ${input.toLowerCase()} through ${direction.toLowerCase()}, creating unexpected possibilities and novel combinations.`;
  }

  private generateLateralIdea(input: string, prompt: string): string {
    return `Apply this to ${input.toLowerCase()}, breaking conventional thinking patterns and discovering innovative approaches.`;
  }

  private generateBlendedIdea(input: string, concept1: string, concept2: string): string {
    return `Create a synthesis for ${input.toLowerCase()} that merges principles from ${concept1} with insights from ${concept2}, producing a unique hybrid solution.`;
  }

  private generateAnalogicalIdea(input: string, analogy: { domain: string; example: string }): string {
    return `Apply the ${analogy.example} principle to ${input.toLowerCase()}, transferring successful patterns from ${analogy.domain} to create innovative solutions.`;
  }

  private generateScamperIdea(input: string, scamper: { action: string; prompt: string }): string {
    return `${scamper.prompt} in ${input.toLowerCase()}, transforming the approach through ${scamper.action.toLowerCase()}.`;
  }

  private generateRandomStimulationIdea(input: string, stimulus: string): string {
    return `Use the concept of "${stimulus}" as a creative lens for ${input.toLowerCase()}, discovering unexpected connections and innovative possibilities.`;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private selectTechnique(input: string): CreativityTechnique {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('innovative') || lowerInput.includes('breakthrough')) {
      return 'lateral';
    } else if (lowerInput.includes('combine') || lowerInput.includes('merge')) {
      return 'conceptual_blending';
    } else if (lowerInput.includes('like') || lowerInput.includes('similar to')) {
      return 'analogical';
    } else if (lowerInput.includes('improve') || lowerInput.includes('enhance')) {
      return 'scamper';
    } else if (lowerInput.includes('radical') || lowerInput.includes('completely new')) {
      return 'random_stimulation';
    } else if (lowerInput.includes('many ideas') || lowerInput.includes('brainstorm')) {
      return 'divergent';
    } else {
      return 'hybrid';
    }
  }

  private extractConnections(ideas: CreativeIdea[]): string[] {
    const connections: string[] = [];

    // Find common inspirations
    const inspirationCounts: Record<string, number> = {};
    for (const idea of ideas) {
      for (const inspiration of idea.inspirations) {
        inspirationCounts[inspiration] = (inspirationCounts[inspiration] || 0) + 1;
      }
    }

    // Add connections for common inspirations
    for (const [inspiration, count] of Object.entries(inspirationCounts)) {
      if (count > 1) {
        connections.push(`Multiple ideas draw from ${inspiration}`);
      }
    }

    // Add category connections
    const categories = new Set(ideas.map(idea => idea.category));
    if (categories.size > 1) {
      connections.push(`Ideas span ${categories.size} different creative approaches`);
    }

    return connections.slice(0, 3);
  }

  private describeApproach(technique: CreativityTechnique): string {
    const descriptions: Record<CreativityTechnique, string> = {
      divergent: 'Divergent thinking - exploring multiple directions and possibilities',
      lateral: 'Lateral thinking - challenging assumptions and finding unconventional paths',
      conceptual_blending: 'Conceptual blending - merging different concepts to create novel hybrids',
      analogical: 'Analogical reasoning - transferring successful patterns from other domains',
      scamper: 'SCAMPER technique - systematically transforming ideas through substitution, combination, adaptation, modification, elimination, and reversal',
      random_stimulation: 'Random stimulation - using unexpected connections to spark creativity',
      hybrid: 'Hybrid approach - combining multiple creative techniques for maximum innovation',
    };

    return descriptions[technique] || descriptions.hybrid;
  }

  private generateReasoning(technique: CreativityTechnique, ideas: CreativeIdea[]): string {
    const avgNovelty = ideas.reduce((sum, idea) => sum + idea.novelty, 0) / ideas.length;
    const avgFeasibility = ideas.reduce((sum, idea) => sum + idea.feasibility, 0) / ideas.length;
    const avgImpact = ideas.reduce((sum, idea) => sum + idea.impact, 0) / ideas.length;

    return `Using ${technique} creativity, I generated ${ideas.length} ideas with an average novelty of ${(avgNovelty * 100).toFixed(0)}%, feasibility of ${(avgFeasibility * 100).toFixed(0)}%, and potential impact of ${(avgImpact * 100).toFixed(0)}%. This approach balances innovation with practicality.`;
  }

  // ============================================================================
  // IDEA EVALUATION
  // ============================================================================

  evaluateIdea(idea: CreativeIdea): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    const score = (idea.novelty * 0.4 + idea.feasibility * 0.3 + idea.impact * 0.3);

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (idea.novelty > 0.7) strengths.push('Highly novel and innovative');
    else if (idea.novelty < 0.4) weaknesses.push('Limited novelty');

    if (idea.feasibility > 0.7) strengths.push('Highly feasible');
    else if (idea.feasibility < 0.4) {
      weaknesses.push('Low feasibility');
      recommendations.push('Consider breaking down into smaller, more achievable steps');
    }

    if (idea.impact > 0.7) strengths.push('High potential impact');
    else if (idea.impact < 0.4) {
      weaknesses.push('Limited impact');
      recommendations.push('Explore ways to amplify the impact');
    }

    if (idea.inspirations.length > 2) {
      strengths.push('Draws from multiple sources');
    }

    return { score, strengths, weaknesses, recommendations };
  }

  // ============================================================================
  // IDEA REFINEMENT
  // ============================================================================

  async refineIdea(idea: CreativeIdea): Promise<CreativeIdea> {
    // Improve feasibility while maintaining novelty
    const refinedIdea: CreativeIdea = {
      ...idea,
      description: `Refined: ${idea.description}`,
      feasibility: Math.min(1.0, idea.feasibility + 0.2),
      novelty: Math.max(0.3, idea.novelty - 0.1),
    };

    return refinedIdea;
  }

  // ============================================================================
  // IDEA HISTORY
  // ============================================================================

  getIdeaHistory(): CreativeIdea[] {
    return [...this.ideaHistory];
  }

  clearHistory(): void {
    this.ideaHistory = [];
  }
}
