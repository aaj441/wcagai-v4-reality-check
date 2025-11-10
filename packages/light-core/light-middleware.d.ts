import { Request, Response, NextFunction } from 'express';
import { LightContext } from './light-guard';
declare global {
    namespace Express {
        interface Request {
            lightContext?: LightContext;
        }
    }
}
export declare function attachLightContext(req: Request, res: Response, next: NextFunction): void;
export declare function logLightReviewMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function failOnPrincipleViolation(options?: {
    enabled?: boolean;
    allowWarnings?: boolean;
}): (req: Request, res: Response, next: NextFunction) => void;
export declare function addCharterHeaders(req: Request, res: Response, next: NextFunction): void;
export declare function auditLogRequests(req: Request, res: Response, next: NextFunction): void;
declare const _default: {
    attachLightContext: typeof attachLightContext;
    logLightReviewMiddleware: typeof logLightReviewMiddleware;
    failOnPrincipleViolation: typeof failOnPrincipleViolation;
    addCharterHeaders: typeof addCharterHeaders;
    auditLogRequests: typeof auditLogRequests;
};
export default _default;
