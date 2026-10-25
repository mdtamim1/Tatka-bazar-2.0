import { getRedisClient } from "./client";

// ============================================================
// Tatka Bazar — Redis Caching Service
// Transparent cache layer with TTL and in-memory fallback
// ============================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const raw = await client.get(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // Check in-memory fallback
    const entry = memoryCache.get(key);
    if (entry) {
      if (Date.now() < entry.expiresAt) {
        return entry.data as T;
      }
      memoryCache.delete(key);
    }
  }
  return null;
}

export async function setCache<T = any>(
  key: string,
  value: T,
  ttlSeconds: number = 300 // Default 5 minutes
): Promise<boolean> {
  const serialized = JSON.stringify(value);

  try {
    const client = getRedisClient();
    if (ttlSeconds > 0) {
      await client.set(key, serialized, "EX", ttlSeconds);
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch {
    // Memory fallback
    memoryCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return true;
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  memoryCache.delete(key);
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch {
    return true;
  }
}

export async function getOrSetCache<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  const freshData = await fetcher();
  await setCache(key, freshData, ttlSeconds);
  return freshData;
}
