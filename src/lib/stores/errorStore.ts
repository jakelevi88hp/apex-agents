import { create } from 'zustand';
import { AppError } from '@/lib/errorHandler';

export interface ErrorStoreState {
  // Error state
  errors: AppError[];
  currentError: AppError | null;
  
  // Actions
  addError: (error: AppError) => void;
  removeError: (index: number) => void;
  clearError: () => void;
  clearAllErrors: () => void;
  setCurrentError: (error: AppError | null) => void;
  
  // Helpers
  hasErrors: () => boolean;
  getErrorCount: () => number;
  getLatestError: () => AppError | null;
  getRecoverableErrors: () => AppError[];
  getCriticalErrors: () => AppError[];
}

export const useErrorStore = create<ErrorStoreState>((set, get) => ({
  // Initial state
  errors: [],
  currentError: null,
  
  // Actions
  addError: (error) => {
    set((state) => {
      const newErrors = [...state.errors, error];
      // Keep only last 50 errors
      if (newErrors.length > 50) {
        newErrors.shift();
      }
      return {
        errors: newErrors,
        currentError: error,
      };
    });
    
    // Auto-clear recoverable errors after 5 seconds
    if (error.recoverable) {
      setTimeout(() => {
        const state = get();
        if (state.currentError === error) {
          set({ currentError: null });
        }
      }, 5000);
    }
  },
  
  removeError: (index) => {
    set((state) => {
      const newErrors = state.errors.filter((_, i) => i !== index);
      return {
        errors: newErrors,
        currentError: state.currentError === state.errors[index] ? null : state.currentError,
      };
    });
  },
  
  clearError: () => set({ currentError: null }),
  
  clearAllErrors: () => set({ errors: [], currentError: null }),
  
  setCurrentError: (error) => set({ currentError: error }),
  
  // Helpers
  hasErrors: () => get().errors.length > 0,
  
  getErrorCount: () => get().errors.length,
  
  getLatestError: () => {
    const state = get();
    return state.errors.length > 0 ? state.errors[state.errors.length - 1] : null;
  },
  
  getRecoverableErrors: () => {
    return get().errors.filter((error) => error.recoverable);
  },
  
  getCriticalErrors: () => {
    return get().errors.filter((error) => error.severity === 'CRITICAL');
  },
}));
