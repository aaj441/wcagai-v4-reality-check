/**
 * Light Logger - Structured Logging for Auditability
 * Winston logger configured for production
 */

import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger instance
export const lightLogger = winston.createLogger({
  level: process.env.LIGHT_LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'light-core',
    charter_version: '1.0.0'
  },
  transports: [
    // Console output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [LIGHT] ${level}: ${message} ${metaStr}`;
        })
      )
    }),
    
    // File output for audit trail
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'light-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'light-combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

/**
 * Log a Light model call with context
 */
export function logLightCall(
  callId: string,
  context: any,
  duration?: number
): void {
  lightLogger.info('Light model call', {
    callId,
    context,
    duration,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log a Light review result
 */
export function logLightReview(
  callId: string,
  review: any
): void {
  const level = review.issues.length > 0 ? 'warn' : 'info';
  
  lightLogger.log(level, 'Light review completed', {
    callId,
    review,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log a principle violation as ERROR level
 */
export function logPrincipleViolation(
  principle: string,
  details: any
): void {
  lightLogger.error('PRINCIPLE VIOLATION', {
    principle,
    details,
    severity: 'CRITICAL',
    timestamp: new Date().toISOString()
  });
}

/**
 * Log audit event for compliance tracking
 */
export function logAuditEvent(
  eventType: string,
  eventData: any
): void {
  lightLogger.info('AUDIT_EVENT', {
    eventType,
    eventData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Create a child logger with specific metadata
 */
export function createChildLogger(metadata: Record<string, any>): winston.Logger {
  return lightLogger.child(metadata);
}

// Export default logger
export default lightLogger;
