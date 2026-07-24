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

/**
 * Add a welcome email job to the queue
 */
export const addWelcomeEmailJob = (data) =>
  emailQueue.add('welcome-email', data, { priority: 1 });

/**
 * Add a password reset email job to the queue
 */
export const addPasswordResetJob = (data) =>
  emailQueue.add('password-reset', data, { priority: 1 });

/**
 * Add a review notification email job to the queue
 */
export const addReviewNotificationJob = (data) =>
  emailQueue.add('review-notification', data, { priority: 2 });
