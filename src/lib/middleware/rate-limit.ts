/**
 * Rate Limiting Middleware
 * Implements sliding window rate limiting using in-memory store
 * For production, use Upstash Redis or similar service
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start cleanup interval
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
  limit: number; // Number of requests
  window: number; // Time window in milliseconds
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.window,
    });
    return true;
  }

  if (entry.count < config.limit) {
    entry.count++;
    return true;
  }

  return false;
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(key: string, config: RateLimitConfig): number {
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetTime < Date.now()) {
    return config.limit;
  }
  return Math.max(0, config.limit - entry.count);
}

/**
 * Get reset time for a key
 */
export function getResetTime(key: string): number | null {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return null;
  }
  return entry.resetTime;
}

/**
 * Rate limit middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  const keyGenerator = config.keyGenerator || defaultKeyGenerator;

  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const key = keyGenerator(request);
      const allowed = checkRateLimit(key, config);

      if (!allowed) {
        const resetTime = getResetTime(key);
        const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;

        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime?.toString() || '',
            },
          }
        );
      }

      const remaining = getRemainingRequests(key, config);
      const resetTime = getResetTime(key);

      // Add rate limit headers to response
      const response = await handler(request);
      response.headers.set('X-RateLimit-Limit', config.limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      if (resetTime) {
        response.headers.set('X-RateLimit-Reset', resetTime.toString());
      }

      return response;
    };
  };
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict rate limiting for auth endpoints
  auth: {
    limit: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },
  // Moderate rate limiting for API endpoints
  api: {
    limit: 100,
    window: 60 * 1000, // 1 minute
  },
  // Loose rate limiting for public endpoints
  public: {
    limit: 1000,
    window: 60 * 1000, // 1 minute
  },
  // Strict rate limiting for webhook endpoints
  webhook: {
    limit: 50,
    window: 60 * 1000, // 1 minute
  },
};

/**
 * Create a rate limit middleware with custom config
 */
export function createRateLimitMiddleware(limit: number, windowMs: number) {
  return rateLimit({
    limit,
    window: windowMs,
  });
}
