import { redisClient } from '../config/redis.js';

/**
 * Get cached value by key
 */
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Set a value in cache with a TTL in seconds
 */
export const setCache = async (key, data, ttlSeconds = 300) => {
  try {
    await redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch {
    // Cache write failure is non-fatal
  }
};

/**
 * Delete a specific cache key
 */
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch {
    // ignore
  }
};

/**
 * Delete all cache keys matching a glob pattern
 * Uses SCAN to avoid blocking Redis with KEYS
 */
export const deleteCachePattern = async (pattern) => {
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== '0');
  } catch {
    // ignore
  }
};
