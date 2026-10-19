import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { redisClient, bullRedisClient } from './config/redis.js';
import { emailQueue } from './queues/emailQueue.js';

const PORT = process.env.PORT || 5000;

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger docs at http://localhost:${PORT}/api/docs`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use by another process.`);
        console.error(`Another process is currently listening on port ${PORT}.`);
        console.error(`To identify which process is using port ${PORT}, run:`);
        console.error(`  netstat -ano | findstr :${PORT}`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        try {
          if (redisClient.status === 'ready') {
            await redisClient.quit();
            console.log('Redis connection closed');
          } else {
            redisClient.disconnect(false);
          }
          if (bullRedisClient.status === 'ready') {
            await bullRedisClient.quit();
            console.log('BullMQ Redis connection closed');
          } else {
            bullRedisClient.disconnect(false);
          }
          await emailQueue.close().catch(() => {});
        } catch (_) { /* ignore */ }
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      shutdown('unhandledRejection');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
