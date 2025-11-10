export interface A11yIssue {
  id: string; severity: 'low'|'medium'|'high'; wcagRef: string;
  description: string; suggestion: string; traumaSensitive?: boolean;
}
export const BASE_ISSUES: A11yIssue[] = [
    {
        "id": "missing-alt-text",
        "severity": "high",
        "wcagRef": "1.1.1",
        "description": "Image is missing alternative text.",
        "suggestion": "Add a descriptive alt attribute to the image tag.",
        "traumaSensitive": false
    }
];
