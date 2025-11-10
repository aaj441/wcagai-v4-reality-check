import type { GuardedResponse } from '../light-guard';
export declare function expectExplainable(response: any): void;
export declare function expectNoTraumaLanguage(text: string): void;
export declare function expectAccessible(html: string, wcagLevel?: 'A' | 'AA' | 'AAA'): void;
export declare function expectPrincipleConformance(response: GuardedResponse): void;
export declare function expectWCAGReferences(violations: any[]): void;
export declare function expectValidIssueIds(issueIds: string[]): void;
export declare function expectNoDarkPatterns(text: string): void;
export declare const lightMatchers: {
    toBeExplainable(received: any): {
        pass: boolean;
        message: () => any;
    };
    toHaveNoTraumaLanguage(received: string): {
        pass: boolean;
        message: () => any;
    };
    toConformToPrinciples(received: GuardedResponse): {
        pass: boolean;
        message: () => any;
    };
};
declare const _default: {
    expectExplainable: typeof expectExplainable;
    expectNoTraumaLanguage: typeof expectNoTraumaLanguage;
    expectAccessible: typeof expectAccessible;
    expectPrincipleConformance: typeof expectPrincipleConformance;
    expectWCAGReferences: typeof expectWCAGReferences;
    expectValidIssueIds: typeof expectValidIssueIds;
    expectNoDarkPatterns: typeof expectNoDarkPatterns;
    lightMatchers: {
        toBeExplainable(received: any): {
            pass: boolean;
            message: () => any;
        };
        toHaveNoTraumaLanguage(received: string): {
            pass: boolean;
            message: () => any;
        };
        toConformToPrinciples(received: GuardedResponse): {
            pass: boolean;
            message: () => any;
        };
    };
};
export default _default;
