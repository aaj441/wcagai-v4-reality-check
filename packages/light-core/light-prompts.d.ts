export declare const BASE_LIGHT_SYSTEM_PROMPT: string;
export declare const WCAG_AI_SYSTEM_PROMPT: string;
export declare function getSystemPrompt(type?: 'base' | 'wcagai'): string;
export declare function buildSafePrompt(userInput: string, systemPromptType?: 'base' | 'wcagai'): {
    system: string;
    user: string;
};
export declare function buildAccessibilityAnalysisPrompt(url: string, violations: any[]): string;
declare const _default: {
    BASE_LIGHT_SYSTEM_PROMPT: string;
    WCAG_AI_SYSTEM_PROMPT: string;
    getSystemPrompt: typeof getSystemPrompt;
    buildSafePrompt: typeof buildSafePrompt;
    buildAccessibilityAnalysisPrompt: typeof buildAccessibilityAnalysisPrompt;
};
export default _default;
