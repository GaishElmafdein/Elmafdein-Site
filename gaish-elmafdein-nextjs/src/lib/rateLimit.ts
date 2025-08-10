// Simple in-memory rate limiter (per IP + key). For production replace with Redis.
const buckets = new Map<string, { count: number; reset: number }>()

interface LimitResult { allowed: boolean; remaining: number; reset: number }

export function rateLimit(key: string, limit = 10, windowMs = 60_000): LimitResult {
  const now = Date.now()
  const entry = buckets.get(key)
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1, reset: now + windowMs }
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.reset }
  }
  entry.count++
  return { allowed: true, remaining: limit - entry.count, reset: entry.reset }
}
