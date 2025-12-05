import { create } from 'zustand';
import { VoiceError, VoiceErrorType } from '@/lib/voice/errorHandler';

export interface VoiceErrorState {
  // Error state
  error: VoiceError | null;
  errors: VoiceError[];
  
  // Actions
  setError: (error: VoiceError | null) => void;
  addError: (error: VoiceError) => void;
  clearError: () => void;
  clearAllErrors: () => void;
  removeError: (index: number) => void;
  
  // Helpers
  hasError: () => boolean;
  hasRecoverableError: () => boolean;
  hasUnrecoverableError: () => boolean;
  getLatestError: () => VoiceError | null;
}

export const useVoiceErrorStore = create<VoiceErrorState>((set, get) => ({
  // Initial state
  error: null,
  errors: [],
  
  // Actions
  setError: (error) => set({ error }),
  
  addError: (error) => {
    set((state) => ({
      error,
      errors: [...state.errors, error],
    }));
    
    // Auto-clear recoverable errors after 5 seconds
    if (error.recoverable) {
      setTimeout(() => {
        const state = get();
        if (state.error === error) {
          set({ error: null });
        }
      }, 5000);
    }
  },
  
  clearError: () => set({ error: null }),
  
  clearAllErrors: () => set({ error: null, errors: [] }),
  
  removeError: (index) => {
    set((state) => {
      const newErrors = state.errors.filter((_, i) => i !== index);
      return {
        errors: newErrors,
        error: state.error === state.errors[index] ? null : state.error,
      };
    });
  },
  
  // Helpers
  hasError: () => get().error !== null,
  
  hasRecoverableError: () => {
    const state = get();
    return state.error !== null && state.error.recoverable;
  },
  
  hasUnrecoverableError: () => {
    const state = get();
    return state.error !== null && !state.error.recoverable;
  },
  
  getLatestError: () => {
    const state = get();
    return state.errors.length > 0 ? state.errors[state.errors.length - 1] : null;
  },
}));
