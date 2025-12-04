'use client';

import { Mic, MicOff, Loader } from 'lucide-react';
import { useSpeechRecognitionAdmin } from '@/hooks/useSpeechRecognitionAdmin';
import { useVoiceAdminStore } from '@/lib/stores/voiceAdminStore';

export function AIAdminVoiceInput() {
  const { isRecording, toggleRecording, isSupported } = useSpeechRecognitionAdmin();
  const { transcript, interimTranscript } = useVoiceAdminStore();

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Speech recognition not supported in your browser
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Microphone Button */}
      <button
        onClick={toggleRecording}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isRecording ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Start Recording
          </>
        )}
      </button>

      {/* Real-time Transcription Display */}
      {(transcript || interimTranscript) && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="text-sm text-gray-900 dark:text-white">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 dark:text-gray-400 italic">
                {interimTranscript}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Listening...
        </div>
      )}
    </div>
  );
}
