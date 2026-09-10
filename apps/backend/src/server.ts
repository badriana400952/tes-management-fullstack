import { createApp } from './app';
import { env } from './config/env';
import { disconnectDatabase } from './config/database';
import { logger } from './shared/logger/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API running at http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectDatabase();
      logger.info('Database connection closed. Bye.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: err });
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));