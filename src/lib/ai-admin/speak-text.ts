/**
 * Text-to-Speech utilities for AI Admin
 * Supports ElevenLabs with fallback to Web Speech API
 */

// Global reference to textToSpeechMutation - will be set by component
let globalTextToSpeechMutation: any = null;

export const setGlobalTextToSpeechMutation = (mutation: any) => {
  globalTextToSpeechMutation = mutation;
};

export const speakText = async (text: string, voiceId?: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Use tRPC mutation if available
    if (globalTextToSpeechMutation) {
      const result = await globalTextToSpeechMutation.mutateAsync({
        text,
        voiceId,
      });
      
      if (result.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
        audio.play().catch(() => fallbackSpeak(text));
        console.log('[Voice] Playing ElevenLabs audio');
        return;
      }
    }
  } catch (error) {
    console.warn('[Voice] ElevenLabs failed, falling back to Web Speech API:', error);
  }
  
  // Fallback to Web Speech API
  fallbackSpeak(text);
};

export const fallbackSpeak = (text: string) => {
  if (typeof window === 'undefined') return;
  
  console.log('[Voice] Using Web Speech API fallback');
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Speak
  window.speechSynthesis.speak(utterance);
};
