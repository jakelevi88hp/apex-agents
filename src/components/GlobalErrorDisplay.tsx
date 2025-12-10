'use client';

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useErrorStore } from '@/lib/stores/errorStore';
import { formatErrorForDisplay, ErrorSeverity } from '@/lib/errorHandler';
import { useEffect, useState } from 'react';

export function GlobalErrorDisplay() {
  const { currentError, clearError, removeError, errors } = useErrorStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (currentError) {
      setIsVisible(true);
    }
  }, [currentError]);

  if (!currentError || !isVisible) {
    return null;
  }

  const { title, message, severity } = formatErrorForDisplay(currentError);
  const isRecoverable = currentError.recoverable;
  const isCritical = severity === ErrorSeverity.CRITICAL;

  const getStyles = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          container: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-900 dark:text-red-100',
          message: 'text-red-800 dark:text-red-200',
        };
      case ErrorSeverity.ERROR:
        return {
          container: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-900 dark:text-red-100',
          message: 'text-red-800 dark:text-red-200',
        };
      case ErrorSeverity.WARNING:
        return {
          container: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          title: 'text-yellow-900 dark:text-yellow-100',
          message: 'text-yellow-800 dark:text-yellow-200',
        };
      case ErrorSeverity.INFO:
      default:
        return {
          container: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-100',
          message: 'text-blue-800 dark:text-blue-200',
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        return <AlertCircle className={`h-5 w-5 ${styles.icon} flex-shrink-0 mt-0.5`} />;
      case ErrorSeverity.WARNING:
        return <AlertTriangle className={`h-5 w-5 ${styles.icon} flex-shrink-0 mt-0.5`} />;
      case ErrorSeverity.INFO:
      default:
        return <Info className={`h-5 w-5 ${styles.icon} flex-shrink-0 mt-0.5`} />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {/* Main Error Alert */}
      <div className={`rounded-lg border p-4 flex items-start gap-3 shadow-lg ${styles.container}`}>
        {getIcon()}

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${styles.message}`}>
            {message}
          </p>

          {/* Action hints */}
          <div className="mt-2 text-xs opacity-75">
            {isRecoverable && !isCritical && (
              <p>💡 This error will automatically dismiss in a few seconds</p>
            )}
            {!isRecoverable && (
              <p>⚠️ This is a critical error. Please refresh the page or contact support.</p>
            )}
            {currentError.retryable && (
              <p>🔄 You can try this action again</p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            clearError();
            setIsVisible(false);
          }}
          className={`flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity ${styles.icon}`}
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Error Count Badge */}
      {errors.length > 1 && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
          {errors.length} error{errors.length !== 1 ? 's' : ''} in history
        </div>
      )}
    </div>
  );
}
