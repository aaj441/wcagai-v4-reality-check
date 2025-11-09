// Test setup file
// This file is loaded before running tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.REDIS_URL = 'redis://localhost:6379';

// Suppress logger output during tests
const winston = require('winston');
winston.configure({
  silent: true
});

// Set shorter timeouts for tests
jest.setTimeout(30000);
