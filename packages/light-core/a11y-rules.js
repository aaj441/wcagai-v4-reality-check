"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_ISSUES = void 0;
exports.getIssueById = getIssueById;
exports.isCritical = isCritical;
exports.getCriticalIssues = getCriticalIssues;
exports.getTraumaInformedIssues = getTraumaInformedIssues;
exports.getIssuesByWCAGLevel = getIssuesByWCAGLevel;
exports.isValidIssueId = isValidIssueId;
exports.BASE_ISSUES = [
    {
        id: 'COLOR_CONTRAST',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level AA (1.4.3)',
        description: 'Text does not have sufficient color contrast against background',
        suggestion: 'Ensure text has at least 4.5:1 contrast ratio (3:1 for large text)'
    },
    {
        id: 'CONTRAST_AAA',
        severity: 'moderate',
        wcagRef: 'WCAG 2.1 Level AAA (1.4.6)',
        description: 'Text does not meet enhanced contrast requirements',
        suggestion: 'Aim for 7:1 contrast ratio for body text (4.5:1 for large text)'
    },
    {
        id: 'MOTION_HAZARD',
        severity: 'critical',
        wcagRef: 'WCAG 2.1 Level A (2.3.1)',
        description: 'Content flashes more than 3 times per second',
        suggestion: 'Remove or reduce flashing content to prevent seizures',
        traumaInformed: true
    },
    {
        id: 'SEIZURE_RISK',
        severity: 'critical',
        wcagRef: 'WCAG 2.1 Level AA (2.3.2)',
        description: 'Content contains patterns that could trigger seizures',
        suggestion: 'Avoid rapid flashing and high-contrast patterns'
    },
    {
        id: 'COGNITIVE_LOAD',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level AAA (3.1.5)',
        description: 'Content is too complex or requires advanced reading level',
        suggestion: 'Simplify language, use clear headings, provide summaries',
        traumaInformed: true
    },
    {
        id: 'TRAUMA_CONTENT_WARNING',
        severity: 'serious',
        wcagRef: 'Best Practice (Trauma-Informed)',
        description: 'Content may be triggering without adequate warning',
        suggestion: 'Provide content warnings for potentially triggering material',
        traumaInformed: true
    },
    {
        id: 'MISSING_ALT_TEXT',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (1.1.1)',
        description: 'Images lack alternative text',
        suggestion: 'Provide meaningful alt text describing image content and function'
    },
    {
        id: 'DECORATIVE_ALT_TEXT',
        severity: 'moderate',
        wcagRef: 'WCAG 2.1 Level A (1.1.1)',
        description: 'Decorative images have unnecessary alt text',
        suggestion: 'Use empty alt="" for purely decorative images'
    },
    {
        id: 'KEYBOARD_TRAP',
        severity: 'critical',
        wcagRef: 'WCAG 2.1 Level A (2.1.2)',
        description: 'Keyboard focus cannot escape from component',
        suggestion: 'Ensure all interactive elements can be navigated away from'
    },
    {
        id: 'MISSING_FOCUS_INDICATOR',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level AA (2.4.7)',
        description: 'Interactive elements lack visible focus indicators',
        suggestion: 'Ensure focus is clearly visible for keyboard navigation'
    },
    {
        id: 'POOR_HEADING_STRUCTURE',
        severity: 'moderate',
        wcagRef: 'WCAG 2.1 Level A (1.3.1)',
        description: 'Heading levels are skipped or out of order',
        suggestion: 'Use proper heading hierarchy (h1, h2, h3) without skipping levels'
    },
    {
        id: 'MISSING_LABEL',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (3.3.2)',
        description: 'Form inputs lack proper labels',
        suggestion: 'Associate labels with inputs using for/id or aria-label'
    },
    {
        id: 'MISSING_ERROR_MESSAGE',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (3.3.1)',
        description: 'Form errors not clearly communicated',
        suggestion: 'Provide clear, specific error messages with suggestions'
    },
    {
        id: 'COERCIVE_LANGUAGE',
        severity: 'serious',
        wcagRef: 'Best Practice (Trauma-Informed)',
        description: 'Language pressures or manipulates user decisions',
        suggestion: 'Use neutral, empowering language that respects autonomy',
        traumaInformed: true
    },
    {
        id: 'SHAMING_LANGUAGE',
        severity: 'serious',
        wcagRef: 'Best Practice (Trauma-Informed)',
        description: 'Language shames or blames users',
        suggestion: 'Reframe messaging to be supportive and blame-free',
        traumaInformed: true
    },
    {
        id: 'DARK_PATTERN_CONFIRM_SHAMING',
        severity: 'serious',
        wcagRef: 'Best Practice (Autonomy)',
        description: 'Confirmation dialogs use shame to prevent action',
        suggestion: 'Use neutral language in confirmation dialogs'
    },
    {
        id: 'DARK_PATTERN_HIDDEN_COSTS',
        severity: 'critical',
        wcagRef: 'Best Practice (Autonomy)',
        description: 'Costs or terms hidden until late in process',
        suggestion: 'Display all costs and terms upfront and clearly'
    },
    {
        id: 'INSUFFICIENT_TIME',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (2.2.1)',
        description: 'Time limits too short for users to complete tasks',
        suggestion: 'Provide adequate time limits or allow users to extend time'
    },
    {
        id: 'AUTOPLAY_AUDIO',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (1.4.2)',
        description: 'Audio plays automatically without user control',
        suggestion: 'Require user interaction to start audio/video',
        traumaInformed: true
    },
    {
        id: 'MISSING_SKIP_LINK',
        severity: 'moderate',
        wcagRef: 'WCAG 2.1 Level A (2.4.1)',
        description: 'Page lacks skip navigation link',
        suggestion: 'Provide skip link to main content for keyboard users'
    },
    {
        id: 'NON_DESCRIPTIVE_LINK_TEXT',
        severity: 'moderate',
        wcagRef: 'WCAG 2.1 Level A (2.4.4)',
        description: 'Links use generic text like "click here"',
        suggestion: 'Use descriptive link text that indicates destination'
    },
    {
        id: 'LANGUAGE_NOT_IDENTIFIED',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (3.1.1)',
        description: 'Page language not identified in HTML',
        suggestion: 'Set lang attribute on html element'
    },
    {
        id: 'MISSING_PAGE_TITLE',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (2.4.2)',
        description: 'Page lacks descriptive title',
        suggestion: 'Provide clear, descriptive page titles'
    },
    {
        id: 'LAYOUT_TABLES',
        severity: 'moderate',
        wcagRef: 'WCAG 2.1 Level A (1.3.1)',
        description: 'Tables used for layout instead of CSS',
        suggestion: 'Use CSS for layout, reserve tables for tabular data'
    },
    {
        id: 'MISSING_TABLE_HEADERS',
        severity: 'serious',
        wcagRef: 'WCAG 2.1 Level A (1.3.1)',
        description: 'Data tables lack proper header markup',
        suggestion: 'Use th elements with scope attributes for table headers'
    }
];
function getIssueById(id) {
    return exports.BASE_ISSUES.find(issue => issue.id === id);
}
function isCritical(issue) {
    return issue.severity === 'critical';
}
function getCriticalIssues() {
    return exports.BASE_ISSUES.filter(isCritical);
}
function getTraumaInformedIssues() {
    return exports.BASE_ISSUES.filter(issue => issue.traumaInformed === true);
}
function getIssuesByWCAGLevel(level) {
    const levelPattern = new RegExp(`Level ${level}`, 'i');
    return exports.BASE_ISSUES.filter(issue => levelPattern.test(issue.wcagRef));
}
function isValidIssueId(issueId) {
    return exports.BASE_ISSUES.some(issue => issue.id === issueId);
}
exports.default = {
    BASE_ISSUES: exports.BASE_ISSUES,
    getIssueById,
    isCritical,
    getCriticalIssues,
    getTraumaInformedIssues,
    getIssuesByWCAGLevel,
    isValidIssueId
};
