"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightMatchers = void 0;
exports.expectExplainable = expectExplainable;
exports.expectNoTraumaLanguage = expectNoTraumaLanguage;
exports.expectAccessible = expectAccessible;
exports.expectPrincipleConformance = expectPrincipleConformance;
exports.expectWCAGReferences = expectWCAGReferences;
exports.expectValidIssueIds = expectValidIssueIds;
exports.expectNoDarkPatterns = expectNoDarkPatterns;
const a11y_rules_1 = require("../a11y-rules");
function expectExplainable(response) {
    if (typeof response === 'string') {
        expect(response.length).toBeGreaterThan(0);
    }
    else if (typeof response === 'object' && response !== null) {
        const hasExplanation = response.description ||
            response.explanation ||
            response.reason ||
            response.help ||
            response.helpUrl ||
            (response.violations && Array.isArray(response.violations));
        expect(hasExplanation).toBeTruthy();
    }
    else {
        throw new Error('Response must be string or object with explanation fields');
    }
}
function expectNoTraumaLanguage(text) {
    const traumaPatterns = [
        /you\s+should\s+have/gi,
        /you\s+must\s+have/gi,
        /stupid/gi,
        /idiot/gi,
        /dumb/gi,
        /lazy/gi,
        /your\s+fault/gi,
        /you\s+failed/gi,
        /you're\s+wrong/gi,
        /shame\s+on\s+you/gi
    ];
    for (const pattern of traumaPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            throw new Error(`Trauma language detected: "${matches[0]}". This violates the trauma-informed principle.`);
        }
    }
}
function expectAccessible(html, wcagLevel = 'AA') {
    if (!html.includes('lang=') && !html.includes('<html')) {
        console.warn('Warning: No lang attribute found. May violate WCAG 3.1.1');
    }
    const imgRegex = /<img[^>]*>/gi;
    const images = html.match(imgRegex) || [];
    for (const img of images) {
        if (!img.includes('alt=')) {
            throw new Error(`Image missing alt attribute: "${img.substring(0, 50)}...". Violates WCAG 1.1.1`);
        }
    }
    const headings = html.match(/<h[1-6][^>]*>/gi) || [];
    if (headings.length > 0) {
        const levels = headings.map(h => parseInt(h.match(/h(\d)/)?.[1] || '0'));
        if (!levels.includes(1) && html.length > 200) {
            console.warn('Warning: No h1 found. Consider adding for WCAG 1.3.1');
        }
    }
    const inputs = html.match(/<input[^>]*>/gi) || [];
    for (const input of inputs) {
        const hasLabel = input.includes('aria-label=') ||
            input.includes('aria-labelledby=') ||
            html.includes(`for="${input.match(/id="([^"]*)"/)?.[1]}"`);
        if (!hasLabel && input.includes('type=')) {
            const type = input.match(/type="([^"]*)"/)?.[1];
            if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
                throw new Error(`Input missing label: "${input.substring(0, 50)}...". Violates WCAG 3.3.2`);
            }
        }
    }
}
function expectPrincipleConformance(response) {
    const { lightReview } = response;
    if (lightReview.truthfulness === 'needs_review') {
        throw new Error(`Truthfulness violation: Response needs review. Issues: ${lightReview.issues.join('; ')}`);
    }
    if (lightReview.truthfulness === 'uncertain') {
        console.warn('Warning: Response flagged as uncertain');
    }
    if (lightReview.trauma === 'soften_language') {
        throw new Error(`Trauma-informed violation: Language needs softening. Issues: ${lightReview.issues.join('; ')}`);
    }
    if (lightReview.accessibility === 'missing_explanation') {
        throw new Error(`Accessibility violation: Missing explanations. Issues: ${lightReview.issues.join('; ')}`);
    }
    if (lightReview.issues.length > 0) {
        console.warn(`Light review issues found: ${lightReview.issues.join('; ')}`);
    }
    if (lightReview.warnings.length > 0) {
        console.warn(`Light review warnings: ${lightReview.warnings.join('; ')}`);
    }
}
function expectWCAGReferences(violations) {
    for (const violation of violations) {
        expect(violation).toHaveProperty('wcagRef');
        expect(typeof violation.wcagRef).toBe('string');
        expect(violation.wcagRef.length).toBeGreaterThan(0);
    }
}
function expectValidIssueIds(issueIds) {
    for (const issueId of issueIds) {
        if (!(0, a11y_rules_1.isValidIssueId)(issueId)) {
            throw new Error(`Invalid issue ID: "${issueId}". AI must not create issues outside BASE_ISSUES ruleset.`);
        }
    }
}
function expectNoDarkPatterns(text) {
    const darkPatterns = [
        /are\s+you\s+sure\s+you\s+want\s+to\s+(quit|leave|cancel)/gi,
        /don't\s+miss\s+out/gi,
        /limited\s+time\s+only/gi,
        /act\s+now/gi,
        /you'll\s+lose\s+your\s+(progress|data|access)/gi
    ];
    for (const pattern of darkPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            throw new Error(`Dark pattern detected: "${matches[0]}". This violates the autonomy respect principle.`);
        }
    }
}
exports.lightMatchers = {
    toBeExplainable(received) {
        try {
            expectExplainable(received);
            return {
                pass: true,
                message: () => 'Response is explainable'
            };
        }
        catch (error) {
            return {
                pass: false,
                message: () => error.message
            };
        }
    },
    toHaveNoTraumaLanguage(received) {
        try {
            expectNoTraumaLanguage(received);
            return {
                pass: true,
                message: () => 'Text has no trauma language'
            };
        }
        catch (error) {
            return {
                pass: false,
                message: () => error.message
            };
        }
    },
    toConformToPrinciples(received) {
        try {
            expectPrincipleConformance(received);
            return {
                pass: true,
                message: () => 'Response conforms to principles'
            };
        }
        catch (error) {
            return {
                pass: false,
                message: () => error.message
            };
        }
    }
};
exports.default = {
    expectExplainable,
    expectNoTraumaLanguage,
    expectAccessible,
    expectPrincipleConformance,
    expectWCAGReferences,
    expectValidIssueIds,
    expectNoDarkPatterns,
    lightMatchers: exports.lightMatchers
};
