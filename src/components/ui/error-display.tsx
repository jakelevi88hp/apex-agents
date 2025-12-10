'use client';

import React from 'react';
import { AlertCircle, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AppError } from '@/lib/errors/base-error';

interface ErrorDisplayProps {
  error: Error | AppError | unknown;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Error Display Component
 * 
 * Displays errors in a user-friendly way, integrating with backend error system.
 */
export function ErrorDisplay({ error, onDismiss, className = '' }: ErrorDisplayProps) {
  if (!error) return null;

  // Handle AppError from backend
  if (error && typeof error === 'object' && 'code' in error && 'statusCode' in error) {
    const appError = error as AppError;
    
    const getIcon = () => {
      if (appError.statusCode >= 500) return AlertCircle;
      if (appError.statusCode === 404) return Info;
      if (appError.statusCode === 403) return AlertTriangle;
      return AlertCircle;
    };

    const getColor = () => {
      if (appError.statusCode >= 500) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      if (appError.statusCode === 404) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      if (appError.statusCode === 403) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
    };

    const Icon = getIcon();

    return (
      <div className={`rounded-lg border p-4 ${getColor()} ${className}`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{appError.message}</h3>
            {appError.context && Object.keys(appError.context).length > 0 && (
              <p className="text-sm opacity-90">
                {JSON.stringify(appError.context, null, 2)}
              </p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle generic Error
  if (error instanceof Error) {
    return (
      <div className={`rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Error</h3>
            <p className="text-sm">{error.message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle unknown error
  return (
    <div className={`rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">An unexpected error occurred</h3>
          <p className="text-sm">Please try again or contact support if the problem persists.</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface SuccessDisplayProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Success Display Component
 */
export function SuccessDisplay({ message, onDismiss, className = '' }: SuccessDisplayProps) {
  return (
    <div className={`rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-green-800 dark:text-green-200 ${className}`}>
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
