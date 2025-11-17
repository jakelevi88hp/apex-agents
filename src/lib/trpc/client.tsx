'use client';

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppRouter } from '@/server/routers/_app';
import { useState, useMemo } from 'react';
import superjson from 'superjson';
import { getStorageItem } from '@/lib/utils/storage';

export const trpc = createTRPCReact<AppRouter>();

/**
 * Get base URL for tRPC (memoized)
 */
const getBaseUrl = (() => {
  let cached: string | null = null;
  return () => {
    if (cached) return cached;
    if (typeof window !== 'undefined') {
      cached = window.location.origin;
      return cached;
    }
    cached = `http://localhost:${process.env.PORT ?? 3000}`;
    return cached;
  };
})();

/**
 * Default query client configuration with optimized settings
 */
const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

export function TRPCProvider(props: { children: React.ReactNode }) {
  // Memoize query client to prevent recreation
  const queryClient = useMemo(
    () => new QueryClient(defaultQueryClientConfig),
    []
  );

  // Memoize tRPC client to prevent recreation
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
            headers: () => {
              if (typeof window === 'undefined') return {};
              const token = getStorageItem('token');
              return token ? { authorization: `Bearer ${token}` } : {};
            },
          }),
        ],
      }),
    []
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

