/**
 * Rate Limiting Implementation
 * Protects API endpoints from abuse and DDoS attacks
 */

import { NextRequest } from 'next/server';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

// In-memory storage for development (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

class RateLimit {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.config.interval
      });

      return {
        success: true,
        limit: this.config.uniqueTokenPerInterval,
        remaining: this.config.uniqueTokenPerInterval - 1,
        reset: now + this.config.interval
      };
    }

    if (record.count >= this.config.uniqueTokenPerInterval) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.config.uniqueTokenPerInterval,
        remaining: 0,
        reset: record.resetTime
      };
    }

    // Increment counter
    record.count++;
    rateLimitMap.set(identifier, record);

    return {
      success: true,
      limit: this.config.uniqueTokenPerInterval,
      remaining: this.config.uniqueTokenPerInterval - record.count,
      reset: record.resetTime
    };
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      rateLimitMap.delete(key);
    });
  }
}

// Different rate limits for different endpoints
export const rateLimits = {
  // Strict limit for payment endpoints
  payment: new RateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5
  }),

  // Moderate limit for email endpoints
  email: new RateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10
  }),

  // Standard limit for general API
  api: new RateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30
  }),

  // Relaxed limit for public endpoints
  public: new RateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 60
  })
};

// Helper function to get identifier from request
export function getIdentifier(request: NextRequest): string {
  // Try to get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

  // For authenticated requests, use user ID
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // For anonymous requests, use IP
  return `ip:${ip}`;
}

// Middleware helper
export async function checkRateLimit(
  request: NextRequest,
  limiter: RateLimit
): Promise<RateLimitResult> {
  const identifier = getIdentifier(request);
  return await limiter.check(identifier);
}

// Clean up old entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    Object.values(rateLimits).forEach(limiter => limiter.cleanup());
  }, 5 * 60 * 1000);
}

// Production implementation with Redis
/*
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = Redis.fromEnv();

export const rateLimits = {
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:payment'
  }),

  email: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:email'
  }),

  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api'
  }),

  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'ratelimit:public'
  })
};
*/