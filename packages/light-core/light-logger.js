"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightLogger = void 0;
exports.logLightCall = logLightCall;
exports.logLightReview = logLightReview;
exports.logPrincipleViolation = logPrincipleViolation;
exports.logAuditEvent = logAuditEvent;
exports.createChildLogger = createChildLogger;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
exports.lightLogger = winston_1.default.createLogger({
    level: process.env.LIGHT_LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'light-core',
        charter_version: '1.0.0'
    },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `${timestamp} [LIGHT] ${level}: ${message} ${metaStr}`;
            }))
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'light-error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'light-combined.log'),
            maxsize: 5242880,
            maxFiles: 10
        })
    ]
});
function logLightCall(callId, context, duration) {
    exports.lightLogger.info('Light model call', {
        callId,
        context,
        duration,
        timestamp: new Date().toISOString()
    });
}
function logLightReview(callId, review) {
    const level = review.issues.length > 0 ? 'warn' : 'info';
    exports.lightLogger.log(level, 'Light review completed', {
        callId,
        review,
        timestamp: new Date().toISOString()
    });
}
function logPrincipleViolation(principle, details) {
    exports.lightLogger.error('PRINCIPLE VIOLATION', {
        principle,
        details,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString()
    });
}
function logAuditEvent(eventType, eventData) {
    exports.lightLogger.info('AUDIT_EVENT', {
        eventType,
        eventData,
        timestamp: new Date().toISOString()
    });
}
function createChildLogger(metadata) {
    return exports.lightLogger.child(metadata);
}
exports.default = exports.lightLogger;
