import { useEffect, useRef, useCallback } from 'react';
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
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const error = createVoiceError(
        VoiceErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED,
        new Error('Speech Recognition API not supported'),
        false
      );
      addError(error);
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
      const error = handleSpeechRecognitionError(event.error);
      addError(error);
      setRecording(false);
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
  }, [setRecording, setTranscript, setInterimTranscript, addError]);

  // Start recording
  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      clearTranscript();
      recognitionRef.current.start();
      setRecording(true);
    }
  }, [isRecording, setRecording, clearTranscript, addError]);

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
  }, [isRecording, startRecording, stopRecording, addError]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
    isSupported: !!recognitionRef.current,
  };
};
