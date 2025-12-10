/**
 * Enhanced AGI Core System - TypeScript Implementation
 * 
 * Integrates all AGI modules:
 * - Memory persistence (episodic, semantic, working, procedural, emotional)
 * - Conversation history tracking
 * - Advanced reasoning modes
 * - Emotional intelligence
 * - Creativity engine
 */

import { agiMemoryService } from './memory';
import { agiConversationService, type AGIMessage, type AGIConversation } from './conversation';
import { AdvancedReasoningEngine, type ReasoningMode } from './reasoning';
import { EmotionalIntelligence } from './emotion';
import { CreativityEngine, type CreativityTechnique, type CreativeIdea } from './creativity';

export interface AGIThought {
  content: string;
  type: 'analysis' | 'consideration' | 'response' | 'reasoning' | 'creative' | 'emotional';
}

export interface AGIResponse {
  thoughts: AGIThought[];
  emotionalState: string;
  creativity: Array<{
    description: string;
    novelty?: number;
    feasibility?: number;
    impact?: number;
  }>;
  reasoning: {
    mode?: string;
    steps?: Array<{
      step: number;
      description: string;
      reasoning: string;
      confidence: number;
    }>;
    conclusion: string;
    confidence?: number;
    alternatives?: string[];
  };
  mode: 'full_agi' | 'simplified';
  conversationId?: string;
  messageId?: string;
}

export interface AGIConfig {
  userId?: string;
  conversationId?: string;
  enableMemory?: boolean;
  enableConversationHistory?: boolean;
  enableAdvancedReasoning?: boolean;
  enableEmotionalIntelligence?: boolean;
  enableCreativity?: boolean;
  reasoningMode?: ReasoningMode;
  creativityTechnique?: CreativityTechnique;
}

export class EnhancedAGICore {
  private thoughts: AGIThought[] = [];
  private config: AGIConfig;
  private reasoningEngine: AdvancedReasoningEngine;
  private emotionalIntelligence: EmotionalIntelligence;
  private creativityEngine: CreativityEngine;
  private sessionId: string;

  constructor(config: AGIConfig = {}) {
    this.config = {
      enableMemory: true,
      enableConversationHistory: true,
      enableAdvancedReasoning: true,
      enableEmotionalIntelligence: true,
      enableCreativity: true,
      ...config,
    };

    // Generate a proper UUID for session ID
    this.sessionId = crypto.randomUUID();
    this.reasoningEngine = new AdvancedReasoningEngine(this.config.userId);
    this.emotionalIntelligence = new EmotionalIntelligence(this.config.userId);
    this.creativityEngine = new CreativityEngine(this.config.userId);
  }

  async processInput(input: string): Promise<AGIResponse> {
    try {
      // Clear previous thoughts
      this.thoughts = [];

      // Ensure conversation exists
      let conversationId = this.config.conversationId;
      if (this.config.enableConversationHistory && this.config.userId && !conversationId) {
        conversationId = await agiConversationService.createConversation(
          this.config.userId,
          `Conversation started at ${new Date().toLocaleString()}`
        );
        this.config.conversationId = conversationId;
      }

      // Store user message in conversation history
      if (this.config.enableConversationHistory && conversationId) {
        await agiConversationService.addMessage({
          conversationId,
          role: 'user',
          content: input,
        });
      }

      // Store in working memory
      if (this.config.enableMemory && this.config.userId) {
        await agiMemoryService.storeWorkingMemory({
          userId: this.config.userId,
          sessionId: this.sessionId,
          itemType: 'observation',
          content: input,
          priority: 0.7,
          activationLevel: 1.0,
        });
      }

      // Step 1: Analyze the input
      this.addThought(`Analyzing input: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`, 'analysis');

      // Step 2: Emotional intelligence analysis
      let emotionalState = 'attentive';
      let emotionalResponse;
      
      if (this.config.enableEmotionalIntelligence) {
        const emotionAnalysis = this.emotionalIntelligence.detectEmotion(input);
        emotionalResponse = this.emotionalIntelligence.generateResponse(emotionAnalysis);
        emotionalState = emotionalResponse.state;
        
        this.addThought(
          `Detected emotional tone: ${emotionAnalysis.primaryEmotion} (intensity: ${(emotionAnalysis.intensity * 100).toFixed(0)}%)`,
          'emotional'
        );
        
        if (emotionalResponse.empathy) {
          this.addThought(emotionalResponse.empathy, 'emotional');
        }
      }

      // Step 3: Advanced reasoning
      let reasoning;
      
      if (this.config.enableAdvancedReasoning) {
        const reasoningMode = this.config.reasoningMode || this.reasoningEngine.selectReasoningMode(input);
        reasoning = await this.reasoningEngine.reason(input, reasoningMode);
        
        this.addThought(`Applying ${reasoning.mode} reasoning`, 'reasoning');
        
        // Add key reasoning steps as thoughts
        if (reasoning.steps && reasoning.steps.length > 0) {
          for (const step of reasoning.steps.slice(0, 3)) {
            this.addThought(step.description, 'reasoning');
          }
        }
      } else {
        // Simple reasoning
        reasoning = {
          mode: 'analytical',
          conclusion: 'Processing your request thoughtfully.',
          confidence: 0.7,
        };
      }

      // Step 4: Creative idea generation
      let creativity;
      
      if (this.config.enableCreativity && this.requiresCreativity(input)) {
        const creativityTechnique = this.config.creativityTechnique;
        const creativeOutput = await this.creativityEngine.generateIdeas(input, 3, creativityTechnique);
        
        creativity = creativeOutput.ideas.map((idea: CreativeIdea) => ({
          description: idea.description,
          novelty: idea.novelty,
          feasibility: idea.feasibility,
          impact: idea.impact,
        }));
        
        this.addThought(`Generated ${creativity.length} creative ideas using ${creativeOutput.approach}`, 'creative');
        
        // Add top creative idea as a thought
        if (creativity.length > 0) {
          this.addThought(creativity[0].description, 'creative');
        }
      } else {
        // Standard creative consideration
        creativity = [
          { description: 'Thoughtful approach considering multiple angles' },
          { description: 'Balanced solution integrating key principles' },
        ];
      }

      // Step 5: Formulate response
      this.addThought('Formulating comprehensive response', 'response');

      // Create response object
      const response: AGIResponse = {
        thoughts: this.thoughts,
        emotionalState,
        creativity,
        reasoning: {
          mode: reasoning.mode,
          steps: reasoning.steps,
          conclusion: reasoning.conclusion,
          confidence: reasoning.confidence,
          alternatives: reasoning.alternatives,
        },
        mode: 'full_agi',
        conversationId,
      };

      // Store assistant message in conversation history
      if (this.config.enableConversationHistory && conversationId) {
        const messageId = await agiConversationService.addMessage({
          conversationId,
          role: 'assistant',
          content: reasoning.conclusion,
          thoughts: this.thoughts,
          emotionalState,
          creativity,
          reasoning: {
            mode: reasoning.mode,
            conclusion: reasoning.conclusion,
            confidence: reasoning.confidence,
          },
        });
        response.messageId = messageId;
      }

      // Store response in working memory
      if (this.config.enableMemory && this.config.userId) {
        await agiMemoryService.storeWorkingMemory({
          userId: this.config.userId,
          sessionId: this.sessionId,
          itemType: 'thought',
          content: reasoning.conclusion,
          priority: 0.8,
          activationLevel: 1.0,
        });
      }

      // Store consciousness state
      if (this.config.enableMemory && this.config.userId) {
        await agiMemoryService.storeConsciousnessState({
          userId: this.config.userId,
          sessionId: this.sessionId,
          consciousnessLevel: 0.85,
          attentionFocus: { input, emotionalState },
          currentGoals: ['understand', 'respond', 'assist'],
          metacognitiveState: { reasoning: reasoning.mode, confidence: reasoning.confidence },
          emotionalState: { state: emotionalState },
          creativityLevel: creativity.length > 2 ? 0.8 : 0.5,
          reasoningMode: reasoning.mode,
          timestamp: new Date(),
        });
      }

      return response;
    } catch (error) {
      console.error('Enhanced AGI processing error:', error);
      return this.getFallbackResponse(input);
    }
  }

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  async getConversationHistory(limit: number = 10): Promise<AGIMessage[]> {
    if (!this.config.enableConversationHistory || !this.config.conversationId) {
      return [];
    }

    return await agiConversationService.getRecentMessages(this.config.conversationId, limit);
  }

  async getConversationContext(): Promise<{
    conversation: AGIConversation | null;
    recentMessages: AGIMessage[];
    summary: string;
  }> {
    if (!this.config.enableConversationHistory || !this.config.conversationId) {
      return {
        conversation: null,
        recentMessages: [],
        summary: 'No conversation history available',
      };
    }

    return await agiConversationService.getConversationContext(this.config.conversationId);
  }

  async endConversation(): Promise<void> {
    if (this.config.enableConversationHistory && this.config.conversationId) {
      await agiConversationService.endConversation(this.config.conversationId);
      
      // Analyze conversation
      await agiConversationService.analyzeConversation(this.config.conversationId);
    }

    // Clear working memory
    if (this.config.enableMemory && this.config.userId) {
      await agiMemoryService.clearWorkingMemory(this.config.userId, this.sessionId);
    }

    // Reset emotional state
    if (this.config.enableEmotionalIntelligence) {
      this.emotionalIntelligence.resetState();
    }

    // Clear creativity history
    if (this.config.enableCreativity) {
      this.creativityEngine.clearHistory();
    }
  }

  // ============================================================================
  // MEMORY MANAGEMENT
  // ============================================================================

  async getEpisodicMemories(limit: number = 10) {
    if (!this.config.enableMemory || !this.config.userId) {
      return [];
    }

    return await agiMemoryService.getEpisodicMemories(this.config.userId, limit);
  }

  async getSemanticMemory(concept: string) {
    if (!this.config.enableMemory || !this.config.userId) {
      return null;
    }

    return await agiMemoryService.getSemanticMemory(this.config.userId, concept);
  }

  async consolidateMemories(): Promise<void> {
    if (this.config.enableMemory && this.config.userId) {
      await agiMemoryService.consolidateMemories(this.config.userId);
    }
  }

  // ============================================================================
  // STATUS AND DIAGNOSTICS
  // ============================================================================

  async getStatus(): Promise<{
    available: boolean;
    mode: string;
    components: string[];
    features: {
      memory: boolean;
      conversationHistory: boolean;
      advancedReasoning: boolean;
      emotionalIntelligence: boolean;
      creativity: boolean;
    };
    sessionId: string;
    conversationId?: string;
  }> {
    return {
      available: true,
      mode: 'full_agi',
      components: [
        'Memory System',
        'Conversation History',
        'Advanced Reasoning Engine',
        'Emotional Intelligence',
        'Creativity Engine',
        'Consciousness Simulation',
      ],
      features: {
        memory: this.config.enableMemory || false,
        conversationHistory: this.config.enableConversationHistory || false,
        advancedReasoning: this.config.enableAdvancedReasoning || false,
        emotionalIntelligence: this.config.enableEmotionalIntelligence || false,
        creativity: this.config.enableCreativity || false,
      },
      sessionId: this.sessionId,
      conversationId: this.config.conversationId,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private addThought(content: string, type: AGIThought['type']): void {
    this.thoughts.push({ content, type });
  }

  private requiresCreativity(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return (
      lowerInput.includes('creative') ||
      lowerInput.includes('idea') ||
      lowerInput.includes('innovative') ||
      lowerInput.includes('brainstorm') ||
      lowerInput.includes('imagine') ||
      lowerInput.includes('novel')
    );
  }

  private getFallbackResponse(input: string): AGIResponse {
    return {
      thoughts: [
        { content: 'Processing your request', type: 'analysis' },
        { content: 'Formulating response', type: 'response' },
      ],
      emotionalState: 'neutral',
      creativity: [{ description: 'Standard approach' }],
      reasoning: {
        conclusion: 'I\'m here to help with your request.',
      },
      mode: 'simplified',
    };
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  updateConfig(config: Partial<AGIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AGIConfig {
    return { ...this.config };
  }
}

// Export singleton instance with default config
export const enhancedAGICore = new EnhancedAGICore();
