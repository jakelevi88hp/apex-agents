'use client';

import { Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { useTextToSpeechAdmin } from '@/hooks/useTextToSpeechAdmin';
import { useVoiceAdminStore } from '@/lib/stores/voiceAdminStore';

interface AIAdminVoiceOutputProps {
  text: string;
  autoPlay?: boolean;
}

export function AIAdminVoiceOutput({ text, autoPlay = true }: AIAdminVoiceOutputProps) {
  const { speak, stop, pause, resume, isPlaying, isSupported } = useTextToSpeechAdmin();
  const { voiceEnabled, setVoiceEnabled } = useVoiceAdminStore();

  if (!isSupported || !text) {
    return null;
  }

  const handleSpeak = () => {
    if (isPlaying) {
      pause();
    } else if (window.speechSynthesis.paused) {
      resume();
    } else {
      speak(text);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Voice Toggle */}
      <button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className={`p-2 rounded-lg transition-colors ${
          voiceEnabled
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
            : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
        }`}
        title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
      >
        {voiceEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </button>

      {/* Play/Pause Button */}
      {voiceEnabled && (
        <>
          <button
            onClick={handleSpeak}
            disabled={!text}
            className={`p-2 rounded-lg transition-colors ${
              !text
                ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          {/* Stop Button */}
          {isPlaying && (
            <button
              onClick={stop}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
