const app = require('./app');
const config = require('../config');
const logger = require('./utils/logger');
const cacheService = require('./services/cache');
const scannerService = require('./services/scanner');

const PORT = config.port;

// Initialize services
async function initializeServices() {
  try {
    // Connect to Redis
    await cacheService.connect();
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Service initialization error:', error);
    // Continue running even if Redis fails (degraded mode)
  }
}

// Start server
async function startServer() {
  await initializeServices();

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('='.repeat(60));
    logger.info(`🚀 WCAGAI v4.0 server running`);
    logger.info(`📊 Environment: ${config.env}`);
    logger.info(`🌐 Port: ${PORT}`);
    logger.info(`🔍 Redis: ${config.redis.url}`);
    logger.info(`🔑 SerpAPI: ${config.serpapi.key ? 'Configured' : 'Not configured (using fallback)'}`);
    logger.info('='.repeat(60));
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} signal received: closing HTTP server`);

    server.close(async () => {
      logger.info('HTTP server closed');

      // Clean up services
      try {
        await cacheService.disconnect();
        await scannerService.closeBrowser();
        logger.info('Services cleaned up');
      } catch (error) {
        logger.error('Cleanup error:', error);
      }

      process.exit(0);
    });

    // Force shutdown after 30s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  return server;
}

// Start if run directly
if (require.main === module) {
  startServer().catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = startServer;
