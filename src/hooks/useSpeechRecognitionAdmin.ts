import { useEffect, useRef, useCallback } from 'react';
import { useVoiceAdminStore } from '@/lib/stores/voiceAdminStore';

interface SpeechRecognitionEvent extends Event {
  results: any;
  resultIndex: number;
  isFinal?: boolean;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export const useSpeechRecognitionAdmin = () => {
  const recognitionRef = useRef<any>(null);
  const {
    isRecording,
    setRecording,
    setTranscript,
    setInterimTranscript,
    clearTranscript,
  } = useVoiceAdminStore();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      const resultIndex = (event as any).resultIndex || 0;
      for (let i = resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setTranscript(final.trim());
      }
      if (interim) {
        setInterimTranscript(interim);
      }
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    // Handle end
    recognition.onend = () => {
      setRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [setRecording, setTranscript, setInterimTranscript]);

  // Start recording
  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      clearTranscript();
      recognitionRef.current.start();
      setRecording(true);
    }
  }, [isRecording, setRecording, clearTranscript]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  }, [isRecording, setRecording]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
    isSupported: !!recognitionRef.current,
  };
};
