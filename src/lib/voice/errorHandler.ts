/**
 * Voice Feature Error Handler
 * Centralized error handling for all voice-related operations
 */

export enum VoiceErrorType {
  SPEECH_RECOGNITION_NOT_SUPPORTED = 'SPEECH_RECOGNITION_NOT_SUPPORTED',
  SPEECH_SYNTHESIS_NOT_SUPPORTED = 'SPEECH_SYNTHESIS_NOT_SUPPORTED',
  MICROPHONE_PERMISSION_DENIED = 'MICROPHONE_PERMISSION_DENIED',
  MICROPHONE_NOT_AVAILABLE = 'MICROPHONE_NOT_AVAILABLE',
  AUDIO_CAPTURE_ERROR = 'AUDIO_CAPTURE_ERROR',
  TRANSCRIPTION_ERROR = 'TRANSCRIPTION_ERROR',
  SPEECH_SYNTHESIS_ERROR = 'SPEECH_SYNTHESIS_ERROR',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  originalError?: Error;
  recoverable: boolean;
  userMessage: string;
}

/**
 * Map error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<VoiceErrorType, { title: string; message: string }> = {
  [VoiceErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED]: {
    title: 'Speech Recognition Not Supported',
    message: 'Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.',
  },
  [VoiceErrorType.SPEECH_SYNTHESIS_NOT_SUPPORTED]: {
    title: 'Text-to-Speech Not Supported',
    message: 'Your browser does not support text-to-speech. Please use a modern browser.',
  },
  [VoiceErrorType.MICROPHONE_PERMISSION_DENIED]: {
    title: 'Microphone Permission Denied',
    message: 'Please grant microphone permission in your browser settings to use voice features.',
  },
  [VoiceErrorType.MICROPHONE_NOT_AVAILABLE]: {
    title: 'Microphone Not Available',
    message: 'No microphone detected. Please check your device and try again.',
  },
  [VoiceErrorType.AUDIO_CAPTURE_ERROR]: {
    title: 'Audio Capture Error',
    message: 'Failed to capture audio. Please check your microphone and try again.',
  },
  [VoiceErrorType.TRANSCRIPTION_ERROR]: {
    title: 'Transcription Error',
    message: 'Failed to transcribe audio. Please try again or use text mode.',
  },
  [VoiceErrorType.SPEECH_SYNTHESIS_ERROR]: {
    title: 'Speech Synthesis Error',
    message: 'Failed to play audio response. Please check your audio settings.',
  },
  [VoiceErrorType.BROWSER_NOT_SUPPORTED]: {
    title: 'Browser Not Supported',
    message: 'Your browser does not support voice features. Please use a modern browser.',
  },
  [VoiceErrorType.UNKNOWN_ERROR]: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again or use text mode.',
  },
};

/**
 * Create a voice error with user-friendly message
 */
export function createVoiceError(
  type: VoiceErrorType,
  originalError?: Error,
  recoverable: boolean = true
): VoiceError {
  const errorInfo = ERROR_MESSAGES[type] || ERROR_MESSAGES[VoiceErrorType.UNKNOWN_ERROR];
  
  return {
    type,
    message: originalError?.message || errorInfo.message,
    originalError,
    recoverable,
    userMessage: `${errorInfo.title}: ${errorInfo.message}`,
  };
}

/**
 * Handle speech recognition errors
 */
export function handleSpeechRecognitionError(error: string): VoiceError {
  console.error('[Voice] Speech Recognition Error:', error);

  switch (error) {
    case 'no-speech':
      return createVoiceError(
        VoiceErrorType.TRANSCRIPTION_ERROR,
        new Error('No speech detected'),
        true
      );
    case 'audio-capture':
      return createVoiceError(
        VoiceErrorType.AUDIO_CAPTURE_ERROR,
        new Error('Audio capture failed'),
        true
      );
    case 'network':
      return createVoiceError(
        VoiceErrorType.TRANSCRIPTION_ERROR,
        new Error('Network error during transcription'),
        true
      );
    case 'permission-denied':
      return createVoiceError(
        VoiceErrorType.MICROPHONE_PERMISSION_DENIED,
        new Error('Microphone permission denied'),
        false
      );
    case 'not-allowed':
      return createVoiceError(
        VoiceErrorType.MICROPHONE_PERMISSION_DENIED,
        new Error('Microphone not allowed'),
        false
      );
    default:
      return createVoiceError(
        VoiceErrorType.TRANSCRIPTION_ERROR,
        new Error(`Speech recognition error: ${error}`),
        true
      );
  }
}

/**
 * Handle speech synthesis errors
 */
export function handleSpeechSynthesisError(error: SpeechSynthesisErrorEvent): VoiceError {
  console.error('[Voice] Speech Synthesis Error:', error.error);

  switch (error.error) {
    case 'network':
      return createVoiceError(
        VoiceErrorType.SPEECH_SYNTHESIS_ERROR,
        new Error('Network error during speech synthesis'),
        true
      );
    case 'synthesis-unavailable':
      return createVoiceError(
        VoiceErrorType.SPEECH_SYNTHESIS_NOT_SUPPORTED,
        new Error('Speech synthesis unavailable'),
        false
      );
    default:
      return createVoiceError(
        VoiceErrorType.SPEECH_SYNTHESIS_ERROR,
        new Error(`Speech synthesis error: ${error.error}`),
        true
      );
  }
}

/**
 * Log error with context
 */
export function logVoiceError(error: VoiceError, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  console.error(
    `[Voice Error] ${timestamp}${contextStr}`,
    {
      type: error.type,
      message: error.message,
      recoverable: error.recoverable,
      originalError: error.originalError,
    }
  );

  // Could send to error tracking service here
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: VoiceError): boolean {
  return error.recoverable;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: VoiceError): string {
  return error.userMessage;
}

/**
 * Validate browser support for voice features
 */
export function validateVoiceSupport(): { supported: boolean; errors: VoiceError[] } {
  const errors: VoiceError[] = [];

  // Check Speech Recognition support
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    errors.push(
      createVoiceError(
        VoiceErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED,
        undefined,
        false
      )
    );
  }

  // Check Speech Synthesis support
  if (!('speechSynthesis' in window)) {
    errors.push(
      createVoiceError(
        VoiceErrorType.SPEECH_SYNTHESIS_NOT_SUPPORTED,
        undefined,
        false
      )
    );
  }

  return {
    supported: errors.length === 0,
    errors,
  };
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: VoiceError): { title: string; message: string } {
  const errorInfo = ERROR_MESSAGES[error.type] || ERROR_MESSAGES[VoiceErrorType.UNKNOWN_ERROR];
  return {
    title: errorInfo.title,
    message: errorInfo.message,
  };
}
