import { create } from 'zustand';

export interface VoiceAdminState {
  // Recording state
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  
  // Playback state
  isPlaying: boolean;
  currentAudioUrl: string | null;
  
  // Settings
  voiceEnabled: boolean;
  autoPlay: boolean;
  voiceMode: boolean;
  
  // Actions
  setRecording: (recording: boolean) => void;
  setTranscript: (transcript: string) => void;
  setInterimTranscript: (interim: string) => void;
  clearTranscript: () => void;
  
  setPlaying: (playing: boolean) => void;
  setCurrentAudioUrl: (url: string | null) => void;
  
  setVoiceEnabled: (enabled: boolean) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setVoiceMode: (mode: boolean) => void;
}

export const useVoiceAdminStore = create<VoiceAdminState>((set) => ({
  // Initial state
  isRecording: false,
  transcript: '',
  interimTranscript: '',
  isPlaying: false,
  currentAudioUrl: null,
  voiceEnabled: true,
  autoPlay: true,
  voiceMode: false,
  
  // Actions
  setRecording: (recording) => set({ isRecording: recording }),
  setTranscript: (transcript) => set({ transcript, interimTranscript: '' }),
  setInterimTranscript: (interimTranscript) => set({ interimTranscript }),
  clearTranscript: () => set({ transcript: '', interimTranscript: '' }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentAudioUrl: (url) => set({ currentAudioUrl: url }),
  
  setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
  setAutoPlay: (autoPlay) => set({ autoPlay }),
  setVoiceMode: (mode) => set({ voiceMode: mode }),
}));
