/**
 * Rate Limiting Middleware for Cloudflare Workers
 * Implements rate limiting using KV storage
 * 
 * Policy:
 * - CSPIN Jetton Transfer: 10 requests per minute per IP
 * - General API: 100 requests per minute per IP
 * - Emergency: 1 request per 10 seconds per IP
 */

export interface RateLimitConfig {
  limit: number; // Maximum requests
  window: number; // Time window in seconds
  keyPrefix?: string; // KV key prefix for rate limit data
}

/**
 * Generate rate limit key for IP
 * @param ip - Client IP address
 * @param endpoint - API endpoint
 * @param prefix - KV key prefix
 * @returns Formatted KV key
 */
export function generateRateLimitKey(
  ip: string,
  endpoint: string,
  prefix: string = 'rate_limit'
): string {
  return `${prefix}:${endpoint}:${ip}`;
}

/**
 * Extract client IP from request
 * Priority: CF-Connecting-IP > X-Forwarded-For > Direct IP
 * @param request - Incoming request
 * @returns Client IP address
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Cloudflare header (most reliable)
  const cfIP = headers.get('CF-Connecting-IP');
  if (cfIP) return cfIP;
  
  // X-Forwarded-For header
  const xForwardedFor = headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  // Fallback: Default IP
  return '127.0.0.1';
}

/**
 * Check rate limit and update counter
 * @param kv - Cloudflare KV namespace
 * @param ip - Client IP
 * @param endpoint - API endpoint
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetIn: number }
 */
export async function checkRateLimit(
  kv: any,
  ip: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  const key = generateRateLimitKey(ip, endpoint, config.keyPrefix);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.window;

  try {
    // Get existing counter
    const data = await kv.get(key, 'json');
    let counter = data ? { count: data.count || 0, windowStart: data.windowStart || now } : { count: 0, windowStart: now };

    // Reset if window expired
    if (counter.windowStart < windowStart) {
      counter = { count: 0, windowStart: now };
    }

    // Check limit
    const allowed = counter.count < config.limit;
    const remaining = Math.max(0, config.limit - counter.count - 1);
    const resetIn = Math.max(0, (counter.windowStart + config.window) - now);

    // Increment counter
    if (allowed) {
      counter.count++;
      await kv.put(key, JSON.stringify(counter), {
        expirationTtl: config.window + 10, // TTL: window + 10s buffer
      });
    }

    return { allowed, remaining, resetIn };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request but log
    return { allowed: true, remaining: config.limit - 1, resetIn: config.window };
  }
}

/**
 * Rate limit error response
 * @param remaining - Remaining requests
 * @param resetIn - Reset time in seconds
 * @returns Response object
 */
export function createRateLimitResponse(remaining: number, resetIn: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
      remaining,
      resetIn,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(resetIn),
        'RateLimit-Remaining': String(remaining),
        'RateLimit-Reset': String(resetIn),
      },
    }
  );
}

/**
 * Rate limit configuration presets
 */
export const RATE_LIMIT_PRESETS = {
  // CSPIN Jetton 전송: 매우 제한적
  CSPIN_TRANSFER: {
    limit: 10,
    window: 60, // 1 minute
    keyPrefix: 'rate_limit:cspin_transfer',
  } as RateLimitConfig,

  // 일반 API: 표준 제한
  GENERAL_API: {
    limit: 100,
    window: 60, // 1 minute
    keyPrefix: 'rate_limit:general_api',
  } as RateLimitConfig,

  // 긴급 모드: 매우 제한적 (DDoS 방어)
  EMERGENCY: {
    limit: 1,
    window: 10, // 10 seconds
    keyPrefix: 'rate_limit:emergency',
  } as RateLimitConfig,

  // 게임 API: 중간 정도 제한
  GAME_API: {
    limit: 50,
    window: 60, // 1 minute
    keyPrefix: 'rate_limit:game_api',
  } as RateLimitConfig,
};
