import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { redisClient } from './config/redis.js';

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

    // ─── Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        try {
          await redisClient.quit();
          console.log('Redis connection closed');
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
