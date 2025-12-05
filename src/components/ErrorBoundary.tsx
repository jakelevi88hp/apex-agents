'use client';

import React, { ReactNode, ReactElement } from 'react';
import { useErrorStore } from '@/lib/stores/errorStore';
import { createAppError, ErrorType, ErrorSeverity, logError } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React component errors and displays user-friendly error messages
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    const appError = createAppError(
      ErrorType.RUNTIME_ERROR,
      'An error occurred in the application',
      {
        originalError: error,
        context: {
          componentStack: errorInfo.componentStack,
        },
        recoverable: true,
        retryable: false,
      }
    );

    logError(appError, 'error-boundary');

    // Add to error store
    const { addError } = useErrorStore.getState();
    addError(appError);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-4">
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
                <h1 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  Something went wrong
                </h1>
                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4 text-xs">
                    <summary className="cursor-pointer font-mono text-red-700 dark:text-red-300 hover:underline">
                      Error details
                    </summary>
                    <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
