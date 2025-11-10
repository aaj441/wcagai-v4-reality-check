export type TruthfulnessFlag = 'ok' | 'uncertain' | 'needs_review';
export type TraumaFlag = 'ok' | 'soften_language';
export type AccessibilityFlag = 'ok' | 'missing_explanation';
export interface LightContext {
    userId?: string;
    purpose: string;
    sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
}
export interface LightReview {
    truthfulness: TruthfulnessFlag;
    trauma: TraumaFlag;
    accessibility: AccessibilityFlag;
    issues: string[];
    warnings: string[];
    timestamp: string;
}
export interface GuardedResponse<T = any> {
    data: T;
    lightReview: LightReview;
    context: LightContext;
}
export declare function rawModelCall<T>(modelFn: () => Promise<T>, context: LightContext): Promise<T>;
export declare function lightModelCall<T>(modelFn: () => Promise<T>, context: LightContext): Promise<GuardedResponse<T>>;
export declare function validatePrincipleConformance(review: LightReview): void;
declare const _default: {
    lightModelCall: typeof lightModelCall;
    rawModelCall: typeof rawModelCall;
    validatePrincipleConformance: typeof validatePrincipleConformance;
};
export default _default;
