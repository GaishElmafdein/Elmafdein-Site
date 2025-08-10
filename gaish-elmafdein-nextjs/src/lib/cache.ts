// Simple in-process cache with TTL + basic LRU trimming.
// For production replace with Redis / Upstash / KV.

interface CacheEntry<T> { value: T; expires: number; hits: number; }

const store = new Map<string, CacheEntry<unknown>>()
const MAX_ITEMS = 500

export function cacheGet<T>(key: string): T | null {
  const e = store.get(key)
  if (!e) return null
  if (Date.now() > e.expires) { store.delete(key); return null }
  e.hits++
  return e.value as T
}

export function cacheSet<T>(key: string, value: T, ttlMs: number) {
  if (store.size >= MAX_ITEMS) {
    // Trim least-used 10%
    const entries = Array.from(store.entries())
    entries.sort((a,b)=>a[1].hits - b[1].hits)
    const remove = Math.ceil(entries.length * 0.1)
    for (let i=0;i<remove;i++) store.delete(entries[i][0])
  }
  store.set(key, { value, expires: Date.now() + ttlMs, hits: 0 })
}

export function cacheKey(parts: (string|number|boolean|null|undefined)[]) {
  return parts.map(p=>String(p ?? '∅')).join('|')
}
