
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true,
  enableOfflineQueue: false,
  connectTimeout: 5000,
  commandTimeout: 1000,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => Math.min(times * 500, 5000),
});

export const bullRedisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 1000, 30000),
});

let hasLoggedRedisError = false;
let hasLoggedBullError = false;

redisClient.on('connect', () => {
  hasLoggedRedisError = false;
  console.log('Redis (cache) connected');
});

redisClient.on('error', (err) => {
  if (!hasLoggedRedisError) {
    console.warn('Redis unavailable — caching disabled:', err.message);
    hasLoggedRedisError = true;
  }
});

bullRedisClient.on('connect', () => {
  hasLoggedBullError = false;
  console.log('Redis (BullMQ) connected');
});

bullRedisClient.on('error', (err) => {
  if (!hasLoggedBullError) {
    console.warn('BullMQ Redis unavailable — queue disabled:', err.message);
    hasLoggedBullError = true;
  }
});

redisClient.connect().catch((err) => {
  if (!hasLoggedRedisError) {
    console.warn('Redis unavailable — caching disabled:', err.message);
    hasLoggedRedisError = true;
  }
});

export default redisClient;
