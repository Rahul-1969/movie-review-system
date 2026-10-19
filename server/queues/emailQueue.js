import { Queue } from 'bullmq';
import { bullRedisClient } from '../config/redis.js';

export const emailQueue = new Queue('email-queue', {
  connection: bullRedisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

emailQueue.on('error', () => {
  // Silent fail-open when Redis is unavailable
});

/**
 * Add a welcome email job to the queue
 */
export const addWelcomeEmailJob = async (data) => {
  if (bullRedisClient.status !== 'ready') return null;
  try {
    return await emailQueue.add('welcome-email', data, { priority: 1 });
  } catch {
    return null;
  }
};

/**
 * Add a password reset email job to the queue
 */
export const addPasswordResetJob = async (data) => {
  if (bullRedisClient.status !== 'ready') return null;
  try {
    return await emailQueue.add('password-reset', data, { priority: 1 });
  } catch {
    return null;
  }
};

/**
 * Add a review notification email job to the queue
 */
export const addReviewNotificationJob = async (data) => {
  if (bullRedisClient.status !== 'ready') return null;
  try {
    return await emailQueue.add('review-notification', data, { priority: 2 });
  } catch {
    return null;
  }
};
