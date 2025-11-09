const config = require('./index');
const logger = require('../src/utils/logger');

/**
 * Validates required environment variables on startup
 * Warns for optional variables
 * Throws error if critical variables are missing
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Check Node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    errors.push(`Node.js version ${nodeVersion} is not supported. Please use Node.js 18+`);
  }

  // Validate PORT
  if (config.port && (config.port < 1 || config.port > 65535)) {
    errors.push(`PORT must be between 1 and 65535, got: ${config.port}`);
  }

  // Validate Redis URL format
  if (config.redis.url && !config.redis.url.startsWith('redis://')) {
    warnings.push(`REDIS_URL should start with redis://, got: ${config.redis.url}`);
  }

  // Check optional SerpAPI key
  if (!config.serpapi.key) {
    warnings.push('SERPAPI_KEY not configured - using fallback data for discovery');
  }

  // Validate numeric configs
  if (isNaN(config.scanner.maxConcurrent) || config.scanner.maxConcurrent < 1) {
    errors.push(`MAX_CONCURRENT_SCANS must be a positive number, got: ${config.scanner.maxConcurrent}`);
  }

  if (isNaN(config.scanner.timeout) || config.scanner.timeout < 1000) {
    errors.push(`SCAN_TIMEOUT_MS must be at least 1000ms, got: ${config.scanner.timeout}`);
  }

  if (isNaN(config.redis.ttl) || config.redis.ttl < 60) {
    errors.push(`CACHE_TTL_HOURS must result in at least 60 seconds TTL, got: ${config.redis.ttl}s`);
  }

  // Log warnings
  if (warnings.length > 0) {
    logger.warn('Configuration warnings:');
    warnings.forEach(warning => logger.warn(`  ⚠️  ${warning}`));
  }

  // Throw if errors
  if (errors.length > 0) {
    logger.error('Configuration errors:');
    errors.forEach(error => logger.error(`  ❌ ${error}`));
    throw new Error(`Environment validation failed with ${errors.length} error(s)`);
  }

  logger.info('✅ Environment validation passed');
}

module.exports = { validateEnvironment };
