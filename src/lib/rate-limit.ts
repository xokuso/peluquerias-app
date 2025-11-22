/**
 * Simple in-memory rate limiting utility for production-ready API endpoints
 * Tracks requests per IP address with sliding window approach
 */

interface RateLimitEntry {
  requests: number;
  resetTime: number;
}

class MemoryStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.store.delete(key));
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, value: RateLimitEntry) {
    this.store.set(key, value);
  }

  delete(key: string) {
    this.store.delete(key);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

const store = new MemoryStore();

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   * @default 10
   */
  max?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Custom key generator function
   * @param req - The request object
   * @returns string - The key to use for rate limiting
   */
  keyGenerator?: (req: Request) => string;

  /**
   * Skip rate limiting based on request
   * @param req - The request object
   * @returns boolean - true to skip rate limiting
   */
  skip?: (req: Request) => boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Default IP address extractor from request headers
 */
export function getClientIP(req: Request): string {
  // Check various headers for the real client IP
  const headers = req.headers;

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP if there are multiple
    const firstIP = xForwardedFor.split(',')[0];
    return firstIP ? firstIP.trim() : 'unknown';
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const xClientIp = headers.get('x-client-ip');
  if (xClientIp) {
    return xClientIp.trim();
  }

  // Fallback to a default if no IP found (shouldn't happen in production)
  return 'unknown';
}

/**
 * Rate limiting function for API endpoints
 */
export function rateLimit(options: RateLimitOptions = {}): (req: Request) => RateLimitResult {
  const {
    max = 10,
    windowMs = 60000,
    keyGenerator = getClientIP,
    skip = () => false
  } = options;

  return (req: Request): RateLimitResult => {
    // Skip rate limiting if specified
    if (skip(req)) {
      return {
        success: true,
        limit: max,
        remaining: max,
        resetTime: Date.now() + windowMs
      };
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const resetTime = now + windowMs;

    const existing = store.get(key);

    if (!existing) {
      // First request from this client
      store.set(key, {
        requests: 1,
        resetTime
      });

      return {
        success: true,
        limit: max,
        remaining: max - 1,
        resetTime
      };
    }

    // Increment request count
    existing.requests++;

    if (existing.requests > max) {
      // Rate limit exceeded
      return {
        success: false,
        limit: max,
        remaining: 0,
        resetTime: existing.resetTime,
        retryAfter: Math.ceil((existing.resetTime - now) / 1000)
      };
    }

    // Update the entry
    store.set(key, existing);

    return {
      success: true,
      limit: max,
      remaining: max - existing.requests,
      resetTime: existing.resetTime
    };
  };
}

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limiter for sensitive operations (auth, payments)
   * 5 requests per minute
   */
  strict: rateLimit({
    max: 5,
    windowMs: 60000
  }),

  /**
   * Standard rate limiter for general API usage
   * 15 requests per minute
   */
  standard: rateLimit({
    max: 15,
    windowMs: 60000
  }),

  /**
   * Lenient rate limiter for public endpoints
   * 60 requests per minute
   */
  lenient: rateLimit({
    max: 60,
    windowMs: 60000
  }),

  /**
   * Auto-login specific rate limiter
   * 10 attempts per 5 minutes to prevent brute force
   */
  autoLogin: rateLimit({
    max: 10,
    windowMs: 300000 // 5 minutes
  })
};

/**
 * Middleware helper for Next.js API routes
 */
export function withRateLimit(
  handler: (req: Request, context: any) => Promise<Response>,
  rateLimiter: (req: Request) => RateLimitResult = rateLimiters.standard
) {
  return async (req: Request, context: any): Promise<Response> => {
    const result = rateLimiter(req);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
            'Retry-After': (result.retryAfter || 60).toString()
          }
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(req, context);

    // Clone the response to add headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    newResponse.headers.set('X-RateLimit-Limit', result.limit.toString());
    newResponse.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    newResponse.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());

    return newResponse;
  };
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    store.destroy();
  });

  process.on('SIGINT', () => {
    store.destroy();
    process.exit();
  });

  process.on('SIGTERM', () => {
    store.destroy();
    process.exit();
  });
}