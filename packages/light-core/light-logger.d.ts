import winston from 'winston';
export declare const lightLogger: winston.Logger;
export declare function logLightCall(callId: string, context: any, duration?: number): void;
export declare function logLightReview(callId: string, review: any): void;
export declare function logPrincipleViolation(principle: string, details: any): void;
export declare function logAuditEvent(eventType: string, eventData: any): void;
export declare function createChildLogger(metadata: Record<string, any>): winston.Logger;
export default lightLogger;
