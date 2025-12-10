'use client';

import { AlertCircle, AlertTriangle, X } from 'lucide-react';
import { useVoiceErrorStore } from '@/lib/stores/voiceErrorStore';
import { formatErrorForDisplay } from '@/lib/voice/errorHandler';

export function VoiceErrorDisplay() {
  const { error, clearError, removeError, errors } = useVoiceErrorStore();

  if (!error) {
    return null;
  }

  const { title, message } = formatErrorForDisplay(error);
  const isRecoverable = error.recoverable;

  return (
    <div className="space-y-2">
      {/* Main Error Alert */}
      <div
        className={`rounded-lg border p-4 flex items-start gap-3 ${
          isRecoverable
            ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
        }`}
      >
        {isRecoverable ? (
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        )}

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm ${
              isRecoverable
                ? 'text-yellow-900 dark:text-yellow-100'
                : 'text-red-900 dark:text-red-100'
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm mt-1 ${
              isRecoverable
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {message}
          </p>

          {/* Suggestions */}
          <div className="mt-2 text-xs opacity-75">
            {isRecoverable && (
              <p>💡 Tip: Try again or switch to text mode</p>
            )}
            {!isRecoverable && (
              <p>⚠️ This feature is not available in your browser. Please use text mode.</p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={clearError}
          className={`flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity ${
            isRecoverable
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400'
          }`}
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Error History (if multiple errors) */}
      {errors.length > 1 && (
        <details className="text-xs opacity-60">
          <summary className="cursor-pointer hover:opacity-80">
            Show error history ({errors.length})
          </summary>
          <div className="mt-2 space-y-1 pl-4 border-l border-gray-300 dark:border-gray-700">
            {errors.map((err, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <span>{formatErrorForDisplay(err).title}</span>
                <button
                  onClick={() => removeError(idx)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Remove error"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
