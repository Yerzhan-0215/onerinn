// src/lib/rateLimiter.ts
// 简单滑动窗口频控（内存版）：allow(key, limit, windowMs)
const buckets = new Map<string, number[]>();

export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const cutoff = now - windowMs;

  const arr = buckets.get(key) || [];
  const filtered = arr.filter((t) => t > cutoff);
  if (filtered.length >= limit) {
    buckets.set(key, filtered);
    return false;
  }
  filtered.push(now);
  buckets.set(key, filtered);
  return true;
}
