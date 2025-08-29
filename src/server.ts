import { createApp } from './app';
import { logger } from './config/logger';
import { config } from './config/config';

const PORT = config.port || 3001;

async function startServer() {
  try {
    const app = createApp();
    
    app.listen(PORT, () => {
      logger.info(`🚀 DevTools server running on port ${PORT}`);
      logger.info(`📊 Dashboard available at: http://localhost:${PORT}/public`);
      logger.info(`🔍 Monitor API at: http://localhost:${PORT}/api/monitor`);
      logger.info(`❤️ Health check at: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
