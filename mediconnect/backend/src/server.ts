import http from 'http';
import { createApp } from './app';
import { initSocketIO } from './sockets';
import { config } from './config/env';
import { logger } from './config/logger';
import { pool } from './db/pool';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.IO
  initSocketIO(server);

  // Test MySQL connection
  try {
    const conn = await pool.getConnection();
    logger.info('Connected to MySQL successfully.');
    conn.release();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error(`Database connection check: ${errorMsg}`);
    logger.warn('Server will continue running. Ensure MySQL is accessible.');
  }

  const PORT = config.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(`MEDICONNECT Backend API running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`Payment Provider: ${config.PAYMENT_PROVIDER}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
  });

  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await pool.end();
      logger.info('Database pool closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
