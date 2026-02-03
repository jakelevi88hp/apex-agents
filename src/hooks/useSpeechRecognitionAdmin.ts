import { useEffect, useRef, useState, useCallback } from 'react';
import { useVoiceAdminStore } from '@/lib/stores/voiceAdminStore';
import { useVoiceErrorStore } from '@/lib/stores/voiceErrorStore';
import { handleSpeechRecognitionError, VoiceErrorType, createVoiceError } from '@/lib/voice/errorHandler';

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
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const {
    isRecording,
    setRecording,
    setTranscript,
    setInterimTranscript,
    clearTranscript,
  } = useVoiceAdminStore();
  const { addError } = useVoiceErrorStore();

  // Initialize speech recognition
  useEffect(() => {
    // Check for Speech Recognition API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[Speech Recognition] API not supported in this browser');
      setIsSupported(false);
      const error = createVoiceError(
        VoiceErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED,
        new Error('Speech Recognition API not supported'),
        false
      );
      addError(error);
      return;
    }

    console.log('[Speech Recognition] API supported, initializing...');
    setIsSupported(true);
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';
    console.log('[Speech Recognition] Configured:', { continuous: true, interimResults: true, language: 'en-US' });

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
        console.log('[Speech Recognition] Final transcript:', final.trim());
        setTranscript(final.trim());
      }
      if (interim) {
        console.log('[Speech Recognition] Interim transcript:', interim);
        setInterimTranscript(interim);
      }
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Speech Recognition] Error:', event.error);
      const error = handleSpeechRecognitionError(event.error);
      addError(error);
      setRecording(false);
    };

    // Handle end
    recognition.onend = () => {
      console.log('[Speech Recognition] Recording ended');
      setRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [setRecording, setTranscript, setInterimTranscript, addError]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!isSupported) {
      console.warn('[Speech Recognition] Not supported');
      return;
    }
    if (recognitionRef.current && !isRecording) {
      console.log('[Speech Recognition] Starting recording...');
      clearTranscript();
      recognitionRef.current.start();
      setRecording(true);
    }
  }, [isSupported, isRecording, setRecording, clearTranscript]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      console.log('[Speech Recognition] Stopping recording...');
      recognitionRef.current.stop();
      setRecording(false);
    }
  }, [isRecording, setRecording]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (!isSupported) {
      console.warn('[Speech Recognition] Not supported');
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isSupported, isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
    isSupported,
  };
};
