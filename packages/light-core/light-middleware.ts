/**
 * Light Middleware - Express Middleware for WCAGAI
 * Attaches Light Context to requests and enforces principles
 */

import { Request, Response, NextFunction } from 'express';
import { LightContext } from './light-guard';
import { lightLogger, logLightReview, logPrincipleViolation } from './light-logger';

// Extend Express Request type to include lightContext
declare global {
  namespace Express {
    interface Request {
      lightContext?: LightContext;
    }
  }
}

/**
 * Attach Light Context to request
 * This middleware should be used on all routes that may interact with AI
 */
export function attachLightContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Determine sensitivity level based on route and request
  let sensitivityLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  
  // Critical routes that need extra scrutiny
  const criticalRoutes = ['/api/scan/vertical', '/api/scan'];
  if (criticalRoutes.some(route => req.path.startsWith(route))) {
    sensitivityLevel = 'high';
  }

  // Extract user ID if available (from auth middleware, session, etc.)
  const userId = req.headers['x-user-id'] as string || 
                 req.query.userId as string || 
                 'anonymous';

  // Create Light Context
  req.lightContext = {
    userId,
    purpose: `${req.method} ${req.path}`,
    sensitivityLevel,
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    }
  };

  lightLogger.info('Light context attached', {
    path: req.path,
    method: req.method,
    userId,
    sensitivityLevel
  });

  next();
}

/**
 * Log Light Review results
 * Use this middleware after operations that use lightModelCall
 */
export function logLightReviewMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to log review if present
  res.json = function (body: any) {
    if (body && body.lightReview) {
      const callId = `${req.method}-${req.path}-${Date.now()}`;
      logLightReview(callId, body.lightReview);
    }
    
    return originalJson(body);
  };

  next();
}

/**
 * Fail on principle violation - strict mode for production
 * Use this middleware to enforce that no responses with violations are sent
 * 
 * @param options - Configuration options
 * @param options.enabled - Whether strict mode is enabled (default: false)
 * @param options.allowWarnings - Whether to allow warnings (default: true)
 */
export function failOnPrincipleViolation(options: {
  enabled?: boolean;
  allowWarnings?: boolean;
} = {}) {
  const { enabled = false, allowWarnings = true } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!enabled) {
      return next();
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to check for violations
    res.json = function (body: any) {
      if (body && body.lightReview) {
        const review = body.lightReview;
        
        // Check for critical violations
        if (review.truthfulness === 'needs_review') {
          logPrincipleViolation('truthfulness', review);
          return res.status(500).json({
            error: 'Principle Violation',
            message: 'Response failed truthfulness review',
            details: review.issues
          });
        }

        if (review.trauma === 'soften_language') {
          logPrincipleViolation('trauma_informed', review);
          return res.status(500).json({
            error: 'Principle Violation',
            message: 'Response contains harmful language',
            details: review.issues
          });
        }

        if (review.accessibility === 'missing_explanation') {
          logPrincipleViolation('accessibility_first', review);
          return res.status(500).json({
            error: 'Principle Violation',
            message: 'Response lacks required explanations',
            details: review.issues
          });
        }

        // Check for warnings in strict mode
        if (!allowWarnings && review.warnings.length > 0) {
          logPrincipleViolation('general', review);
          return res.status(500).json({
            error: 'Principle Warning',
            message: 'Response has principle warnings in strict mode',
            details: review.warnings
          });
        }
      }
      
      return originalJson(body);
    };

    next();
  };
}

/**
 * Charter compliance middleware
 * Adds charter information to response headers
 */
export function addCharterHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader('X-Light-Charter-Version', '1.0.0');
  res.setHeader('X-Light-Compliance', 'enabled');
  next();
}

/**
 * Request audit logging
 * Logs all requests for auditability principle
 */
export function auditLogRequests(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Log request
  lightLogger.info('Request received', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    userId: req.lightContext?.userId || 'unknown',
    timestamp: new Date().toISOString()
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    lightLogger.info('Response sent', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    });
  });

  next();
}

export default {
  attachLightContext,
  logLightReviewMiddleware,
  failOnPrincipleViolation,
  addCharterHeaders,
  auditLogRequests
};
