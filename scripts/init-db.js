#!/usr/bin/env node

/**
 * Database Initialization Script
 * Sets up Redis with default configuration and validates connection
 */

const redis = require('redis');
const logger = require('../src/utils/logger');
const config = require('../config');

async function initializeDatabase() {
  logger.info('Starting database initialization...');
  
  let client;
  
  try {
    // Create Redis client
    logger.info(`Connecting to Redis at ${config.redis.url}`);
    client = redis.createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    // Connect to Redis
    await client.connect();
    logger.info('✅ Successfully connected to Redis');

    // Test Redis operations
    logger.info('Testing Redis operations...');
    
    // Set a test key
    await client.set('init:test', 'success', { EX: 60 });
    logger.info('✅ Redis SET operation successful');
    
    // Get the test key
    const value = await client.get('init:test');
    if (value === 'success') {
      logger.info('✅ Redis GET operation successful');
    } else {
      throw new Error('Redis GET returned unexpected value');
    }
    
    // Delete the test key
    await client.del('init:test');
    logger.info('✅ Redis DEL operation successful');

    // Get server info
    const info = await client.info('server');
    logger.info('Redis Server Info:');
    logger.info(info.split('\n').slice(0, 5).join('\n'));

    // Cleanup and disconnect
    await client.quit();
    logger.info('✅ Database initialization complete');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    
    if (client) {
      try {
        await client.quit();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    process.exit(1);
  }
}

// Run initialization if script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
