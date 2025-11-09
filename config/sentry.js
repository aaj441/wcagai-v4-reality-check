/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for error tracking and performance monitoring.
 * Only enabled in production when SENTRY_DSN is configured.
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const config = require('./index');
const logger = require('../src/utils/logger');

/**
 * Initialize Sentry error tracking
 * @param {Object} app - Express app instance
 */
function initializeSentry(app) {
  if (!config.sentry.enabled) {
    logger.info('Sentry disabled (not in production or DSN not configured)');
    return;
  }

  try {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      integrations: [
        // Enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // Enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
        // Enable profiling
        new ProfilingIntegration()
      ],
      // Performance Monitoring
      tracesSampleRate: config.sentry.tracesSampleRate,
      // Profiling
      profilesSampleRate: config.sentry.profilesSampleRate,
      // Ignore common errors
      ignoreErrors: [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'RequestValidationError'
      ],
      // Capture unhandled rejections
      beforeSend(event, hint) {
        // Filter out expected errors
        if (event.exception) {
          const error = hint.originalException;
          if (error && error.statusCode && error.statusCode < 500) {
            return null; // Don't send 4xx errors
          }
        }
        return event;
      }
    });

    logger.info('Sentry initialized successfully', {
      environment: config.sentry.environment,
      tracesSampleRate: config.sentry.tracesSampleRate
    });
  } catch (error) {
    logger.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Get Sentry request handler middleware
 */
function getRequestHandler() {
  if (!config.sentry.enabled) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler();
}

/**
 * Get Sentry tracing handler middleware
 */
function getTracingHandler() {
  if (!config.sentry.enabled) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.tracingHandler();
}

/**
 * Get Sentry error handler middleware
 */
function getErrorHandler() {
  if (!config.sentry.enabled) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture 5xx errors
      return error.status >= 500;
    }
  });
}

/**
 * Manually capture an exception
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
function captureException(error, context = {}) {
  if (!config.sentry.enabled) {
    return;
  }

  Sentry.withScope((scope) => {
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureException(error);
  });
}

/**
 * Manually capture a message
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 */
function captureMessage(message, level = 'info') {
  if (!config.sentry.enabled) {
    return;
  }
  Sentry.captureMessage(message, level);
}

module.exports = {
  initializeSentry,
  getRequestHandler,
  getTracingHandler,
  getErrorHandler,
  captureException,
  captureMessage,
  Sentry
};
