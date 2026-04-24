import 'dotenv/config';
import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './config/logger';

const PORT = parseInt(process.env.PORT || '3001');

async function startServer(): Promise<void> {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`API Docs: http://localhost:${PORT}/api/docs`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Graceful shutdown...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
