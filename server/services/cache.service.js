import { redisClient } from '../config/redis.js';

/**
 * Get cached value by key
 */
export const getCache = async (key) => {
  if (redisClient.status !== 'ready') return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`Redis getCache failed for "${key}":`, err.message);
    return null;
  }
};

/**
 * Set a value in cache with a TTL in seconds
 */
export const setCache = async (key, data, ttlSeconds = 300) => {
  if (redisClient.status !== 'ready') return null;
  try {
    await redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    return null;
  } catch (err) {
    console.warn(`Redis setCache failed for "${key}":`, err.message);
    return null;
  }
};

/**
 * Delete a specific cache key
 */
export const deleteCache = async (key) => {
  if (redisClient.status !== 'ready') return null;
  try {
    await redisClient.del(key);
    return null;
  } catch (err) {
    console.warn(`Redis deleteCache failed for "${key}":`, err.message);
    return null;
  }
};

/**
 * Delete all cache keys matching a glob pattern
 * Uses SCAN to avoid blocking Redis with KEYS
 */
export const deleteCachePattern = async (pattern) => {
  if (redisClient.status !== 'ready') return null;
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== '0');
    return null;
  } catch (err) {
    console.warn(`Redis deleteCachePattern failed for "${pattern}":`, err.message);
    return null;
  }
};
