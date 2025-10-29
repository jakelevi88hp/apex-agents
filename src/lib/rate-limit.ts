/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiting for API endpoints.
 * For production with multiple servers, consider using Redis (Upstash).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Check if request is allowed
   * @param identifier Unique identifier (user ID, IP address, etc.)
   * @param limit Maximum number of requests allowed
   * @param windowMs Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No entry or expired entry
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    // Entry exists and not expired
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    // Increment count
    entry.count++;
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get current stats for an identifier
   */
  getStats(identifier: string): { count: number; resetAt: number } | null {
    const entry = this.store.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return null;
    }
    return { count: entry.count, resetAt: entry.resetAt };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
  // AGI chat: 20 requests per minute
  AGI: { limit: 20, windowMs: 60 * 1000 },
  
  // AI Admin: 5 requests per minute (expensive operations)
  AI_ADMIN: { limit: 5, windowMs: 60 * 1000 },
  
  // File upload: 10 uploads per hour
  UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 },
  
  // Auth: 5 attempts per 15 minutes
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 },
  
  // General API: 100 requests per minute
  API: { limit: 100, windowMs: 60 * 1000 },
  
  // Search: 30 requests per minute
  SEARCH: { limit: 30, windowMs: 60 * 1000 },
};

/**
 * Rate limit middleware for Next.js API routes
 * 
 * @example
 * ```typescript
 * import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
 * 
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await rateLimit(req, RateLimitPresets.AGI);
 *   if (!rateLimitResult.allowed) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // Process request...
 * }
 * ```
 */
export async function rateLimit(
  req: Request,
  config: { limit: number; windowMs: number },
  identifier?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  response?: Response;
}> {
  // Get identifier (user ID, IP, or custom)
  let id = identifier;
  
  if (!id) {
    // Try to get user ID from auth header or session
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      id = `user:${authHeader.split(' ')[1]?.substring(0, 10)}`;
    } else {
      // Fall back to IP address
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
      id = `ip:${ip}`;
    }
  }

  const result = rateLimiter.check(id, config.limit, config.windowMs);

  if (!result.allowed) {
    const resetDate = new Date(result.resetAt);
    const response = new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetDate.toISOString(),
          'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );

    return {
      allowed: false,
      remaining: 0,
      resetAt: result.resetAt,
      response,
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: Response,
  result: { remaining: number; resetAt: number },
  limit: number
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Get rate limiter instance for manual control
 */
export function getRateLimiter(): RateLimiter {
  return rateLimiter;
}

export default rateLimiter;

