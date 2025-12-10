/**
 * Memoization Utilities
 * 
 * Provides memoization for expensive functions.
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Memoize a function with TTL (time-to-live)
 */
export function memoizeWithTTL<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): T {
  const cache = new Map<string, CacheEntry<ReturnType<T>>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const entry = cache.get(key);
    const now = Date.now();

    if (entry && (now - entry.timestamp) < ttl) {
      return entry.value;
    }

    const value = fn(...args) as ReturnType<T>;
    cache.set(key, { value, timestamp: now });
    return value;
  }) as T;
}

/**
 * Memoize a function (permanent cache)
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const value = fn(...args) as ReturnType<T>;
    cache.set(key, value);
    return value;
  }) as T;
}

/**
 * Clear memoization cache
 */
export function clearMemoCache(): void {
  // This would need to be called on specific memoized functions
  // For now, it's a placeholder for future implementation
}
