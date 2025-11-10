export type A11ySeverity = 'critical' | 'serious' | 'moderate' | 'minor';
export interface A11yIssue {
    id: string;
    severity: A11ySeverity;
    wcagRef: string;
    description: string;
    suggestion: string;
    traumaInformed?: boolean;
}
export declare const BASE_ISSUES: A11yIssue[];
export declare function getIssueById(id: string): A11yIssue | undefined;
export declare function isCritical(issue: A11yIssue): boolean;
export declare function getCriticalIssues(): A11yIssue[];
export declare function getTraumaInformedIssues(): A11yIssue[];
export declare function getIssuesByWCAGLevel(level: 'A' | 'AA' | 'AAA'): A11yIssue[];
export declare function isValidIssueId(issueId: string): boolean;
declare const _default: {
    BASE_ISSUES: A11yIssue[];
    getIssueById: typeof getIssueById;
    isCritical: typeof isCritical;
    getCriticalIssues: typeof getCriticalIssues;
    getTraumaInformedIssues: typeof getTraumaInformedIssues;
    getIssuesByWCAGLevel: typeof getIssuesByWCAGLevel;
    isValidIssueId: typeof isValidIssueId;
};
export default _default;
