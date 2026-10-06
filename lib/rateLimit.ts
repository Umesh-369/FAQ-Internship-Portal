interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory rate limiting map
const ipRateMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute

/**
 * Basic in-memory rate limiter per IP or User ID
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipRateMap.get(identifier);

  if (!record || now > record.resetTime) {
    ipRateMap.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

// Periodic cleanup of stale rate-limit records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of ipRateMap.entries()) {
      if (now > value.resetTime) {
        ipRateMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
