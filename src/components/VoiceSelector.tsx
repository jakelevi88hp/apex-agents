'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Volume2 } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  description: string;
  accent: string;
}

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  onVoiceChange: (voiceId: string) => void;
}

export function VoiceSelector({ selectedVoiceId, onVoiceChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getVoicesQuery = trpc.aiAdmin.getVoices.useQuery();

  useEffect(() => {
    if (getVoicesQuery.data?.voices) {
      setVoices(getVoicesQuery.data.voices);
    }
  }, [getVoicesQuery.data]);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        title="Select voice for AI responses"
      >
        <Volume2 size={18} />
        <span className="text-sm font-medium">
          {selectedVoice?.name || 'Select Voice'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-64">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Choose Voice
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => {
                  onVoiceChange(voice.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                  selectedVoiceId === voice.id
                    ? 'bg-purple-50 dark:bg-purple-900/20'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {voice.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {voice.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {voice.accent}
                    </p>
                  </div>
                  {selectedVoiceId === voice.id && (
                    <div className="ml-2 text-purple-600 dark:text-purple-400">
                      ✓
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Powered by ElevenLabs
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
