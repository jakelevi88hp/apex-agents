import { useCallback, useRef } from 'react';
import { useVoiceAdminStore } from '@/lib/stores/voiceAdminStore';

export const useTextToSpeechAdmin = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlaying, setPlaying, setCurrentAudioUrl, autoPlay } = useVoiceAdminStore();

  // Speak text using browser TTS
  const speak = useCallback(
    async (text: string) => {
      if (!text) return;

      // Use browser's native speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setPlaying(true);
      };

      utterance.onend = () => {
        setPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setPlaying(false);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [setPlaying]
  );

  // Stop speaking
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  }, [setPlaying]);

  // Pause speaking
  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPlaying(false);
    }
  }, [setPlaying]);

  // Resume speaking
  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
    }
  }, [setPlaying]);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    isSupported: 'speechSynthesis' in window,
  };
};
