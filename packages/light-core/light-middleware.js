"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachLightContext = attachLightContext;
exports.logLightReviewMiddleware = logLightReviewMiddleware;
exports.failOnPrincipleViolation = failOnPrincipleViolation;
exports.addCharterHeaders = addCharterHeaders;
exports.auditLogRequests = auditLogRequests;
const light_logger_1 = require("./light-logger");
function attachLightContext(req, res, next) {
    let sensitivityLevel = 'medium';
    const criticalRoutes = ['/api/scan/vertical', '/api/scan'];
    if (criticalRoutes.some(route => req.path.startsWith(route))) {
        sensitivityLevel = 'high';
    }
    const userId = req.headers['x-user-id'] ||
        req.query.userId ||
        'anonymous';
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
    light_logger_1.lightLogger.info('Light context attached', {
        path: req.path,
        method: req.method,
        userId,
        sensitivityLevel
    });
    next();
}
function logLightReviewMiddleware(req, res, next) {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        if (body && body.lightReview) {
            const callId = `${req.method}-${req.path}-${Date.now()}`;
            (0, light_logger_1.logLightReview)(callId, body.lightReview);
        }
        return originalJson(body);
    };
    next();
}
function failOnPrincipleViolation(options = {}) {
    const { enabled = false, allowWarnings = true } = options;
    return (req, res, next) => {
        if (!enabled) {
            return next();
        }
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            if (body && body.lightReview) {
                const review = body.lightReview;
                if (review.truthfulness === 'needs_review') {
                    (0, light_logger_1.logPrincipleViolation)('truthfulness', review);
                    return res.status(500).json({
                        error: 'Principle Violation',
                        message: 'Response failed truthfulness review',
                        details: review.issues
                    });
                }
                if (review.trauma === 'soften_language') {
                    (0, light_logger_1.logPrincipleViolation)('trauma_informed', review);
                    return res.status(500).json({
                        error: 'Principle Violation',
                        message: 'Response contains harmful language',
                        details: review.issues
                    });
                }
                if (review.accessibility === 'missing_explanation') {
                    (0, light_logger_1.logPrincipleViolation)('accessibility_first', review);
                    return res.status(500).json({
                        error: 'Principle Violation',
                        message: 'Response lacks required explanations',
                        details: review.issues
                    });
                }
                if (!allowWarnings && review.warnings.length > 0) {
                    (0, light_logger_1.logPrincipleViolation)('general', review);
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
function addCharterHeaders(req, res, next) {
    res.setHeader('X-Light-Charter-Version', '1.0.0');
    res.setHeader('X-Light-Compliance', 'enabled');
    next();
}
function auditLogRequests(req, res, next) {
    const startTime = Date.now();
    light_logger_1.lightLogger.info('Request received', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        userId: req.lightContext?.userId || 'unknown',
        timestamp: new Date().toISOString()
    });
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        light_logger_1.lightLogger.info('Response sent', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date().toISOString()
        });
    });
    next();
}
exports.default = {
    attachLightContext,
    logLightReviewMiddleware,
    failOnPrincipleViolation,
    addCharterHeaders,
    auditLogRequests
};
