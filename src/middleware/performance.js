const logger = require('../utils/logger');

/**
 * Performance monitoring middleware
 * Tracks response time and logs slow requests
 */
const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();
  const startHrTime = process.hrtime();

  // Track when headers are sent
  let headersSent = false;

  // Listen to finish event instead of overriding end
  res.on('finish', () => {
    // Calculate response time
    const hrDuration = process.hrtime(startHrTime);
    const durationMs = hrDuration[0] * 1000 + hrDuration[1] / 1000000;

    // Log request details
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${durationMs.toFixed(2)}ms`,
      contentLength: res.get('content-length') || 0,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    // Log slow requests (> 1 second)
    if (durationMs > 1000) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.debug('Request completed', logData);
    }
  });

  // Set response time header before sending response
  const originalSend = res.send;
  res.send = function(data) {
    if (!headersSent) {
      const hrDuration = process.hrtime(startHrTime);
      const durationMs = hrDuration[0] * 1000 + hrDuration[1] / 1000000;
      res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
      headersSent = true;
    }
    originalSend.call(this, data);
  };

  next();
};

/**
 * Get performance metrics
 */
const getMetrics = () => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  return {
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime)
    },
    memory: {
      rss: formatBytes(memory.rss),
      heapTotal: formatBytes(memory.heapTotal),
      heapUsed: formatBytes(memory.heapUsed),
      external: formatBytes(memory.external)
    },
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    pid: process.pid
  };
};

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format bytes in human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

module.exports = {
  performanceMonitoring,
  getMetrics
};
