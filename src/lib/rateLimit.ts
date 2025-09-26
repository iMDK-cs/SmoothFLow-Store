/**
 * Rate limiting utilities for API endpoints
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export class RateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      ...options,
    };
  }

  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }

  public check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    
    const key = this.getKey(identifier);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    if (!store[key] || store[key].resetTime < windowStart) {
      store[key] = {
        count: 1,
        resetTime: now + this.options.windowMs,
      };
      return {
        allowed: true,
        remaining: this.options.max - 1,
        resetTime: store[key].resetTime,
      };
    }
    
    if (store[key].count >= this.options.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: store[key].resetTime,
      };
    }
    
    store[key].count++;
    return {
      allowed: true,
      remaining: this.options.max - store[key].count,
      resetTime: store[key].resetTime,
    };
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
});

export const apiRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later.',
});

export const cartRateLimit = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 cart operations per minute
  message: 'Too many cart operations, please slow down.',
});

export const uploadRateLimit = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 uploads per 5 minutes
  message: 'Too many file uploads, please try again later.',
});

// Helper function to get client identifier
export const getClientIdentifier = (req: Request): string => {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  return ip;
};

// Rate limit middleware for API routes
export const withRateLimit = (rateLimiter: RateLimiter) => {
  return async (req: Request, identifier?: string): Promise<{ allowed: boolean; error?: string }> => {
    const clientId = identifier || getClientIdentifier(req);
    const result = rateLimiter.check(clientId);
    
    if (!result.allowed) {
      return {
        allowed: false,
        error: rateLimiter['options'].message || 'Rate limit exceeded',
      };
    }
    
    return { allowed: true };
  };
};
