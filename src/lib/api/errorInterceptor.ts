/**
 * API Error Interceptor
 * Handles errors from fetch requests and API calls
 */

import { handleHttpError, handleNetworkError, AppError } from '@/lib/errorHandler';
import { useErrorStore } from '@/lib/stores/errorStore';

/**
 * Wrap fetch with error handling
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // Handle HTTP errors
    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      const error = handleHttpError(response.status, data);
      const { addError } = useErrorStore.getState();
      addError(error);

      throw error;
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      const appError = handleNetworkError(error);
      const { addError } = useErrorStore.getState();
      addError(appError);
      throw appError;
    }

    throw error;
  }
}

/**
 * Wrap API calls with error handling and retry logic
 */
export async function apiCallWithRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: AppError) => void;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelay = options?.retryDelay ?? 1000;
  let lastError: AppError | Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as AppError | Error;

      // Check if error is retryable
      if (error instanceof Object && 'retryable' in error && !(error as AppError).retryable) {
        throw error;
      }

      // If not last attempt, wait and retry
      if (attempt < maxRetries - 1) {
        if (options?.onRetry) {
          options.onRetry(attempt + 1, error as AppError);
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

/**
 * Create a fetch wrapper for a specific API endpoint
 */
export function createApiClient(baseUrl: string) {
  return {
    async get<T>(path: string, options?: RequestInit): Promise<T> {
      const response = await fetchWithErrorHandling(`${baseUrl}${path}`, {
        ...options,
        method: 'GET',
      });
      return response.json();
    },

    async post<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
      const response = await fetchWithErrorHandling(`${baseUrl}${path}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return response.json();
    },

    async put<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
      const response = await fetchWithErrorHandling(`${baseUrl}${path}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return response.json();
    },

    async delete<T>(path: string, options?: RequestInit): Promise<T> {
      const response = await fetchWithErrorHandling(`${baseUrl}${path}`, {
        ...options,
        method: 'DELETE',
      });
      return response.json();
    },

    async patch<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
      const response = await fetchWithErrorHandling(`${baseUrl}${path}`, {
        ...options,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return response.json();
    },
  };
}
