import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// For general caching (cache.service.js)
export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

// For BullMQ only (emailQueue.js + emailWorker.js)
export const bullRedisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redisClient.on('connect', () => console.log('Redis (cache) connected'));
redisClient.on('error', (err) => console.error('Redis error:', err.message));

redisClient.connect().catch((err) =>
  console.warn('Redis unavailable — caching disabled:', err.message)
);

export default redisClient;