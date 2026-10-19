import 'dotenv/config';
import { Worker } from 'bullmq';
import { bullRedisClient } from '../../config/redis.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReviewNotificationEmail,
} from '../../services/email.service.js';

const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    console.log(`📧 Processing job: ${job.name} (id: ${job.id})`);

    switch (job.name) {
      case 'welcome-email':
        await sendWelcomeEmail(job.data);
        break;

      case 'password-reset':
        await sendPasswordResetEmail(job.data);
        break;

      case 'review-notification':
        await sendReviewNotificationEmail(job.data);
        break;

      default:
        console.warn(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection: bullRedisClient,
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job completed: ${job.name} (id: ${job.id})`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job failed: ${job?.name} (id: ${job?.id})`, err.message);
});

let hasLoggedWorkerError = false;

emailWorker.on('ready', () => {
  hasLoggedWorkerError = false;
  console.log('🚀 Email worker ready and listening for jobs...');
});

emailWorker.on('error', (err) => {
  if (!hasLoggedWorkerError) {
    console.warn('BullMQ Worker Redis unavailable:', err.message);
    hasLoggedWorkerError = true;
  }
});

const handleWorkerShutdown = async (signal) => {
  console.log(`\n${signal} received — closing email worker...`);
  try {
    await emailWorker.close();
    console.log('Email worker closed');
  } catch (_) { /* ignore */ }
  process.exit(0);
};

process.on('SIGTERM', () => handleWorkerShutdown('SIGTERM'));
process.on('SIGINT', () => handleWorkerShutdown('SIGINT'));

console.log('🚀 Email worker started and listening for jobs...');
