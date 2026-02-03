'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Props for the global error boundary.
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for App Router with Sentry reporting.
 * @param error - The error thrown during rendering.
 * @param reset - Callback to retry rendering.
 * @returns A fallback UI for unexpected errors.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg space-y-4 text-center">
          <h1 className="text-3xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-300">
            We hit an unexpected error. Please try again, or come back in a few minutes.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400">Error ID: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
