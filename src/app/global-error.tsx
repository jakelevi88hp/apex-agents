'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#030712', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '2rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #111827, #1f2937)',
            border: '1px solid #374151', borderRadius: '1rem',
            padding: '2.5rem', maxWidth: '480px', width: '100%', textAlign: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f9fafb', marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.5rem',
                background: '#111827', padding: '0.5rem', borderRadius: '0.375rem', fontFamily: 'monospace' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                color: 'white', padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: '600',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
