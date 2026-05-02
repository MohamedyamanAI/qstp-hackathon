/**
 * Module-level in-memory cache for AI context data.
 *
 * In serverless environments (Vercel/Workers), this persists within a warm
 * function instance, covering the common case of consecutive chat messages
 * in a session.
 *
 * Staleness is handled by:
 * 1. TTL — entries auto-expire after 2 minutes (handles external edits)
 * 2. Explicit invalidation — call invalidate after mutations
 * 3. Key structure — changing scope keys = different cache key = fresh data
 */

interface CacheEntry {
  data: unknown;
  createdAt: number;
}

const store = new Map<string, CacheEntry>();

const TTL_MS = 2 * 60 * 1000;
const MAX_ENTRIES = 200;

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) {
    stats.misses++;
    return null;
  }
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(key);
    stats.misses++;
    return null;
  }
  stats.hits++;
  return entry.data as T;
}

export function setCached(key: string, data: unknown): void {
  store.set(key, { data, createdAt: Date.now() });
  if (store.size > MAX_ENTRIES) {
    const sorted = [...store.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );
    const evictCount = Math.floor(MAX_ENTRIES * 0.25);
    for (let i = 0; i < evictCount; i++) store.delete(sorted[i][0]);
  }
}

export function invalidate(key: string): void {
  store.delete(key);
}

let stats = { hits: 0, misses: 0 };

export function resetStats(): void {
  stats = { hits: 0, misses: 0 };
}

export function getStats(): { hits: number; misses: number; size: number } {
  return { ...stats, size: store.size };
}
