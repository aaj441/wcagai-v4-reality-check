const { createClient } = require('redis');
const config = require('../../config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        url: config.redis.url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return retries * 100; // Exponential backoff
          },
          connectTimeout: 10000,
          keepAlive: 5000
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis ready');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis reconnecting...');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Redis connection failed:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, cache miss');
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key, value, ttl = config.redis.ttl) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, cache set skipped');
      return false;
    }

    try {
      await this.client.setEx(key, ttl, value);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  async delete(key) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, cache delete skipped');
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      url: config.redis.url.replace(/:[^:]*@/, ':***@') // Hide password in logs
    };
  }
}

module.exports = new CacheService();
