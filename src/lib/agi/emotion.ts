/**
 * AGI Emotional Intelligence Module
 * 
 * Implements emotional understanding, empathy, and appropriate emotional responses.
 * Based on psychological models of emotion and emotional intelligence.
 */

import { agiMemoryService } from './memory';

export type EmotionType =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'trust'
  | 'anticipation'
  | 'neutral';

export type EmotionalState =
  | 'excited'
  | 'curious'
  | 'engaged'
  | 'pleased'
  | 'attentive'
  | 'concerned'
  | 'empathetic'
  | 'supportive'
  | 'thoughtful'
  | 'neutral';

export interface EmotionAnalysis {
  primaryEmotion: EmotionType;
  intensity: number; // 0.0 to 1.0
  valence: number; // -1.0 to 1.0 (negative to positive)
  arousal: number; // 0.0 to 1.0 (calm to excited)
  confidence: number; // 0.0 to 1.0
  secondaryEmotions: Array<{
    emotion: EmotionType;
    intensity: number;
  }>;
  triggers: string[];
  context: string;
}

export interface EmotionalResponse {
  state: EmotionalState;
  tone: string;
  empathy: string;
  supportMessage?: string;
  emotionalResonance: number; // 0.0 to 1.0
}

export class EmotionalIntelligence {
  private userId?: string;
  private currentState: EmotionalState = 'attentive';
  private emotionalHistory: EmotionAnalysis[] = [];

  constructor(userId?: string) {
    this.userId = userId;
  }

  // ============================================================================
  // EMOTION DETECTION
  // ============================================================================

  detectEmotion(input: string): EmotionAnalysis {
    const lowerInput = input.toLowerCase();
    
    // Emotion indicators
    const emotionIndicators = {
      joy: ['happy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'enjoy', 'fantastic', 'excellent'],
      sadness: ['sad', 'unhappy', 'disappointed', 'depressed', 'down', 'upset', 'hurt', 'lonely'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage'],
      fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified', 'panic'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow'],
      disgust: ['disgusted', 'gross', 'awful', 'terrible', 'horrible', 'nasty'],
      trust: ['trust', 'believe', 'confident', 'reliable', 'faith', 'depend'],
      anticipation: ['excited', 'looking forward', 'can\'t wait', 'anticipate', 'expect', 'hope'],
    };

    // Count emotion indicators
    const emotionScores: Record<string, number> = {};
    for (const [emotion, indicators] of Object.entries(emotionIndicators)) {
      emotionScores[emotion] = indicators.filter(indicator => 
        lowerInput.includes(indicator)
      ).length;
    }

    // Find primary emotion
    let primaryEmotion: EmotionType = 'neutral';
    let maxScore = 0;
    for (const [emotion, score] of Object.entries(emotionScores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as EmotionType;
      }
    }

    // Calculate intensity based on punctuation and capitalization
    let intensity = maxScore > 0 ? 0.5 + (maxScore * 0.1) : 0.3;
    if (input.includes('!')) intensity += 0.2;
    if (input.includes('!!')) intensity += 0.2;
    if (input.toUpperCase() === input && input.length > 5) intensity += 0.3;
    intensity = Math.min(1.0, intensity);

    // Calculate valence (positive/negative)
    const positiveEmotions = ['joy', 'trust', 'anticipation'];
    const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust'];
    let valence = 0;
    if (positiveEmotions.includes(primaryEmotion)) valence = 0.5 + (intensity * 0.5);
    else if (negativeEmotions.includes(primaryEmotion)) valence = -0.5 - (intensity * 0.5);

    // Calculate arousal (calm/excited)
    const highArousalEmotions = ['anger', 'fear', 'surprise', 'anticipation'];
    const arousal = highArousalEmotions.includes(primaryEmotion) ? 0.7 + (intensity * 0.3) : 0.3 + (intensity * 0.2);

    // Find secondary emotions
    const secondaryEmotions = Object.entries(emotionScores)
      .filter(([emotion, score]) => emotion !== primaryEmotion && score > 0)
      .map(([emotion, score]) => ({
        emotion: emotion as EmotionType,
        intensity: Math.min(1.0, score * 0.2),
      }))
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 2);

    // Extract triggers
    const triggers = this.extractEmotionalTriggers(input);

    // Generate context
    const context = this.generateEmotionalContext(primaryEmotion, intensity, input);

    const analysis: EmotionAnalysis = {
      primaryEmotion,
      intensity,
      valence,
      arousal,
      confidence: maxScore > 0 ? 0.7 + (maxScore * 0.1) : 0.5,
      secondaryEmotions,
      triggers,
      context,
    };

    // Store in history
    this.emotionalHistory.push(analysis);
    if (this.emotionalHistory.length > 10) {
      this.emotionalHistory.shift();
    }

    // Store in emotional memory if userId is available
    if (this.userId) {
      agiMemoryService.storeEmotionalMemory({
        userId: this.userId,
        emotionType: primaryEmotion,
        intensity,
        valence,
        arousal,
        trigger: triggers.join(', '),
        response: context,
      });
    }

    return analysis;
  }

  // ============================================================================
  // EMOTIONAL RESPONSE GENERATION
  // ============================================================================

  generateResponse(emotionAnalysis: EmotionAnalysis): EmotionalResponse {
    const { primaryEmotion, intensity, valence } = emotionAnalysis;

    // Determine appropriate emotional state
    const state = this.determineEmotionalState(primaryEmotion, intensity);
    this.currentState = state;

    // Generate tone
    const tone = this.generateTone(primaryEmotion, intensity, valence);

    // Generate empathy message
    const empathy = this.generateEmpathy(primaryEmotion, intensity);

    // Generate support message if needed
    const supportMessage = this.generateSupportMessage(primaryEmotion, intensity, valence);

    // Calculate emotional resonance
    const emotionalResonance = this.calculateEmotionalResonance(emotionAnalysis);

    return {
      state,
      tone,
      empathy,
      supportMessage,
      emotionalResonance,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private determineEmotionalState(emotion: EmotionType, intensity: number): EmotionalState {
    if (intensity < 0.3) return 'attentive';

    switch (emotion) {
      case 'joy':
        return intensity > 0.7 ? 'excited' : 'pleased';
      case 'sadness':
        return 'empathetic';
      case 'anger':
        return 'concerned';
      case 'fear':
        return 'supportive';
      case 'surprise':
        return 'curious';
      case 'trust':
        return 'engaged';
      case 'anticipation':
        return 'excited';
      default:
        return 'thoughtful';
    }
  }

  private generateTone(emotion: EmotionType, intensity: number, valence: number): string {
    if (valence > 0.5) {
      return intensity > 0.7 ? 'enthusiastic and energetic' : 'warm and positive';
    } else if (valence < -0.5) {
      return intensity > 0.7 ? 'deeply empathetic and supportive' : 'understanding and gentle';
    } else {
      return 'balanced and thoughtful';
    }
  }

  private generateEmpathy(emotion: EmotionType, intensity: number): string {
    const empathyMessages: Record<EmotionType, string[]> = {
      joy: [
        "I can sense your excitement and positive energy!",
        "It's wonderful to see such enthusiasm!",
        "Your joy is contagious!",
      ],
      sadness: [
        "I understand this is a difficult time for you.",
        "I'm here to support you through this.",
        "It's okay to feel this way, and I'm here to listen.",
      ],
      anger: [
        "I can see this situation is really frustrating for you.",
        "Your feelings are valid, and I'm here to help.",
        "Let's work through this together.",
      ],
      fear: [
        "I understand your concerns, and they're completely valid.",
        "It's natural to feel worried about this.",
        "Let's address these concerns step by step.",
      ],
      surprise: [
        "That's quite unexpected!",
        "I can see this caught you off guard.",
        "Let's explore this surprising development together.",
      ],
      disgust: [
        "I understand your strong reaction to this.",
        "Your concerns are completely understandable.",
        "Let's find a better approach.",
      ],
      trust: [
        "I appreciate your confidence and trust.",
        "Thank you for sharing this with me.",
        "I'm committed to supporting you.",
      ],
      anticipation: [
        "I can feel your excitement about what's ahead!",
        "It's great to see you looking forward to this.",
        "Let's make this happen together!",
      ],
      neutral: [
        "I'm here to help with whatever you need.",
        "Let's explore this together.",
        "I'm listening and ready to assist.",
      ],
    };

    const messages = empathyMessages[emotion] || empathyMessages.neutral;
    const index = Math.floor(Math.random() * messages.length);
    return messages[index];
  }

  private generateSupportMessage(emotion: EmotionType, intensity: number, valence: number): string | undefined {
    if (valence < -0.3 && intensity > 0.5) {
      const supportMessages: Record<string, string> = {
        sadness: "Remember, difficult times are temporary, and I'm here to help you through this.",
        anger: "Let's channel this energy into finding constructive solutions.",
        fear: "We can tackle this step by step, and I'll be here to support you throughout.",
        disgust: "Let's focus on finding a better path forward.",
      };
      return supportMessages[emotion];
    }
    return undefined;
  }

  private extractEmotionalTriggers(input: string): string[] {
    const triggers: string[] = [];
    
    // Common trigger patterns
    const triggerPatterns = [
      /because\s+(.+?)(?:\.|$)/i,
      /when\s+(.+?)(?:\.|$)/i,
      /after\s+(.+?)(?:\.|$)/i,
      /due to\s+(.+?)(?:\.|$)/i,
    ];

    for (const pattern of triggerPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        triggers.push(match[1].trim());
      }
    }

    return triggers.slice(0, 3);
  }

  private generateEmotionalContext(emotion: EmotionType, intensity: number, input: string): string {
    const intensityLevel = intensity > 0.7 ? 'strong' : intensity > 0.4 ? 'moderate' : 'mild';
    return `Detected ${intensityLevel} ${emotion} in the context of: "${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"`;
  }

  private calculateEmotionalResonance(analysis: EmotionAnalysis): number {
    // Calculate how well we understand and can respond to this emotion
    let resonance = analysis.confidence * 0.5;
    
    // Add bonus for clear emotional expression
    if (analysis.intensity > 0.6) resonance += 0.2;
    
    // Add bonus for identifiable triggers
    if (analysis.triggers.length > 0) resonance += 0.2;
    
    // Add bonus for emotional history consistency
    if (this.emotionalHistory.length > 1) {
      const recentEmotions = this.emotionalHistory.slice(-3);
      const consistentEmotion = recentEmotions.filter(e => 
        e.primaryEmotion === analysis.primaryEmotion
      ).length > 1;
      if (consistentEmotion) resonance += 0.1;
    }

    return Math.min(1.0, resonance);
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  getCurrentState(): EmotionalState {
    return this.currentState;
  }

  getEmotionalHistory(): EmotionAnalysis[] {
    return [...this.emotionalHistory];
  }

  resetState(): void {
    this.currentState = 'attentive';
    this.emotionalHistory = [];
  }

  // ============================================================================
  // EMOTIONAL INTELLIGENCE ASSESSMENT
  // ============================================================================

  assessEmotionalIntelligence(input: string): {
    emotionDetection: number;
    empathyLevel: number;
    responseAppropriate: number;
    overall: number;
  } {
    const analysis = this.detectEmotion(input);
    const response = this.generateResponse(analysis);

    return {
      emotionDetection: analysis.confidence,
      empathyLevel: response.emotionalResonance,
      responseAppropriate: analysis.confidence * response.emotionalResonance,
      overall: (analysis.confidence + response.emotionalResonance) / 2,
    };
  }
}
