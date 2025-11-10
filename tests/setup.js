// Test setup file
// This file is loaded before running tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock cache service to prevent Redis connection in tests
jest.mock('../src/services/cache', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  delete: jest.fn().mockResolvedValue(true),
  isConnected: true,
  getStatus: jest.fn(() => ({ connected: true, url: 'redis://mock' }))
}));

// Suppress logger output during tests
const winston = require('winston');
winston.configure({
  silent: true
});

// Set shorter timeouts for tests
jest.setTimeout(30000);
