export type PrincipleKey = 'truthfulness' | 'accessibility_first' | 'trauma_informed' | 'autonomy_respect' | 'auditability' | 'intersectionality';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export interface Principle {
    enabled: boolean;
    description: string;
    rules: string[];
    severity: Severity;
    standards?: string[];
}
export interface LightCharter {
    version: string;
    principles: Record<PrincipleKey, Principle>;
    metadata: {
        created: string;
        masonic_symbolism: Record<string, string>;
    };
}
export declare const LIGHT_CHARTER: LightCharter;
export declare function isPrincipleEnabled(key: PrincipleKey): boolean;
export declare function getEnabledPrinciples(): PrincipleKey[];
export declare function getPrinciple(key: PrincipleKey): Principle | undefined;
export declare function validateCriticalPrinciples(): void;
declare const _default: {
    LIGHT_CHARTER: LightCharter;
    isPrincipleEnabled: typeof isPrincipleEnabled;
    getEnabledPrinciples: typeof getEnabledPrinciples;
    getPrinciple: typeof getPrinciple;
    validateCriticalPrinciples: typeof validateCriticalPrinciples;
};
export default _default;
