/**
 * ElevenLabs Text-to-Speech Service
 * Provides natural voice synthesis for AI Admin responses
 */

import { ElevenLabsClient } from 'elevenlabs';

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
  console.warn('[ElevenLabs] API key not configured. Voice responses will be disabled.');
}

const client = apiKey ? new ElevenLabsClient({ apiKey }) : null;

/**
 * Available ElevenLabs voices with descriptions
 */
export const AVAILABLE_VOICES = [
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description: 'Warm and friendly female voice',
    accent: 'American',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Expressive and dynamic female voice',
    accent: 'American',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Elli',
    description: 'Young and energetic female voice',
    accent: 'American',
  },
  {
    id: 'MF3mGyEYCHltNiPSt4nT',
    name: 'George',
    description: 'Deep and authoritative male voice',
    accent: 'British',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Callum',
    description: 'Calm and professional male voice',
    accent: 'British',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Harry',
    description: 'Young and friendly male voice',
    accent: 'British',
  },
  {
    id: 'CwhRBWXzGAHq8TQ4Xjlp',
    name: 'Matilda',
    description: 'Sophisticated female voice',
    accent: 'British',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Will',
    description: 'Energetic and upbeat male voice',
    accent: 'American',
  },
  {
    id: 'pMsXgVNXJU7k7yXVDqAK',
    name: 'Gigi',
    description: 'Playful and expressive female voice',
    accent: 'American',
  },
];

export interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * Convert text to speech using ElevenLabs
 * Returns audio buffer as base64 string
 */
export async function textToSpeech(options: TextToSpeechOptions): Promise<string> {
  if (!client) {
    throw new Error('ElevenLabs API key not configured');
  }

  const {
    text,
    voiceId = '21m00Tcm4TlvDq8ikWAM', // Rachel (default)
    modelId = 'eleven_monolingual_v1',
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  try {
    console.log('[ElevenLabs] Generating speech for text:', text.substring(0, 50) + '...');

    const audioStream = await client.generate({
      voice: voiceId,
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
      },
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString('base64');

    console.log('[ElevenLabs] Speech generated successfully, size:', audioBuffer.length, 'bytes');

    return base64Audio;
  } catch (error) {
    console.error('[ElevenLabs] Error generating speech:', error);
    throw error;
  }
}

/**
 * Get list of available voices
 */
export function getAvailableVoices() {
  return AVAILABLE_VOICES;
}

/**
 * Get voice by ID
 */
export function getVoiceById(voiceId: string) {
  return AVAILABLE_VOICES.find((voice) => voice.id === voiceId);
}

/**
 * Check if ElevenLabs is configured
 */
export function isElevenLabsConfigured(): boolean {
  return !!client && !!apiKey;
}
