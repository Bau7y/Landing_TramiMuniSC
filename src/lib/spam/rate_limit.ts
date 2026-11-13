/**
 * Fixed-window rate limit per client IP.
 * With UPSTASH_REDIS_REST_URL/TOKEN it is shared by every server instance;
 * without them it falls back to memory (per instance, best effort).
 */
const memory = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
  redis?: { url: string; token: string };
}

export async function isRateLimited(ip: string, { limit, windowSeconds, redis }: RateLimitOptions): Promise<boolean> {
  const key = `contact:${ip}`;

  if (redis) {
    try {
      // INCR + EXPIRE NX in one round trip (Upstash REST pipeline)
      const response = await fetch(`${redis.url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${redis.token}` },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(windowSeconds), 'NX']]),
      });
      const [{ result }] = (await response.json()) as [{ result: number }];
      return result > limit;
    } catch (error) {
      console.error('[rate_limit] Upstash:', error); // fail open: never block real people because of the limiter
      return false;
    }
  }

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}
