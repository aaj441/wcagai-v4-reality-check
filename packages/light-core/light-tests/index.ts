/**
 * Light Tests - Jest Helpers for Charter Enforcement in CI
 * These must be used in every API test
 */

import { BASE_ISSUES, isValidIssueId } from '../a11y-rules';
import type { GuardedResponse, LightReview } from '../light-guard';

/**
 * Expect that a response has explainable reasoning
 * Fails if output lacks reasoning
 */
export function expectExplainable(response: any): void {
  if (typeof response === 'string') {
    expect(response.length).toBeGreaterThan(0);
  } else if (typeof response === 'object' && response !== null) {
    // Check for common explanation fields
    const hasExplanation = 
      response.description ||
      response.explanation ||
      response.reason ||
      response.help ||
      response.helpUrl ||
      (response.violations && Array.isArray(response.violations));
    
    expect(hasExplanation).toBeTruthy();
  } else {
    throw new Error('Response must be string or object with explanation fields');
  }
}

/**
 * Expect no trauma language in text
 * Scans for shame/coercion words
 */
export function expectNoTraumaLanguage(text: string): void {
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
      throw new Error(
        `Trauma language detected: "${matches[0]}". This violates the trauma-informed principle.`
      );
    }
  }
}

/**
 * Expect accessible HTML
 * WCAG compliance check
 */
export function expectAccessible(
  html: string,
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'
): void {
  // Basic checks for WCAG compliance
  
  // Check for lang attribute
  if (!html.includes('lang=') && !html.includes('<html')) {
    console.warn('Warning: No lang attribute found. May violate WCAG 3.1.1');
  }

  // Check for alt attributes on images
  const imgRegex = /<img[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  
  for (const img of images) {
    if (!img.includes('alt=')) {
      throw new Error(
        `Image missing alt attribute: "${img.substring(0, 50)}...". Violates WCAG 1.1.1`
      );
    }
  }

  // Check for proper heading structure
  const headings = html.match(/<h[1-6][^>]*>/gi) || [];
  if (headings.length > 0) {
    const levels = headings.map(h => parseInt(h.match(/h(\d)/)?.[1] || '0'));
    
    // Check for h1
    if (!levels.includes(1) && html.length > 200) {
      console.warn('Warning: No h1 found. Consider adding for WCAG 1.3.1');
    }
  }

  // Check for form labels
  const inputs = html.match(/<input[^>]*>/gi) || [];
  for (const input of inputs) {
    const hasLabel = 
      input.includes('aria-label=') ||
      input.includes('aria-labelledby=') ||
      html.includes(`for="${input.match(/id="([^"]*)"/)?.[1]}"`);
    
    if (!hasLabel && input.includes('type=')) {
      const type = input.match(/type="([^"]*)"/)?.[1];
      if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
        throw new Error(
          `Input missing label: "${input.substring(0, 50)}...". Violates WCAG 3.3.2`
        );
      }
    }
  }
}

/**
 * Expect principle conformance
 * Fails if lightReview flags issues
 */
export function expectPrincipleConformance(response: GuardedResponse): void {
  const { lightReview } = response;

  // Check truthfulness
  if (lightReview.truthfulness === 'needs_review') {
    throw new Error(
      `Truthfulness violation: Response needs review. Issues: ${lightReview.issues.join('; ')}`
    );
  }

  if (lightReview.truthfulness === 'uncertain') {
    console.warn('Warning: Response flagged as uncertain');
  }

  // Check trauma language
  if (lightReview.trauma === 'soften_language') {
    throw new Error(
      `Trauma-informed violation: Language needs softening. Issues: ${lightReview.issues.join('; ')}`
    );
  }

  // Check accessibility
  if (lightReview.accessibility === 'missing_explanation') {
    throw new Error(
      `Accessibility violation: Missing explanations. Issues: ${lightReview.issues.join('; ')}`
    );
  }

  // Check for any critical issues
  if (lightReview.issues.length > 0) {
    console.warn(`Light review issues found: ${lightReview.issues.join('; ')}`);
  }

  // Check for warnings
  if (lightReview.warnings.length > 0) {
    console.warn(`Light review warnings: ${lightReview.warnings.join('; ')}`);
  }
}

/**
 * Expect all violations have WCAG references
 */
export function expectWCAGReferences(violations: any[]): void {
  for (const violation of violations) {
    expect(violation).toHaveProperty('wcagRef');
    expect(typeof violation.wcagRef).toBe('string');
    expect(violation.wcagRef.length).toBeGreaterThan(0);
  }
}

/**
 * Expect valid issue IDs from base ruleset
 * Prevents AI from freelancing beyond defined rules
 */
export function expectValidIssueIds(issueIds: string[]): void {
  for (const issueId of issueIds) {
    if (!isValidIssueId(issueId)) {
      throw new Error(
        `Invalid issue ID: "${issueId}". AI must not create issues outside BASE_ISSUES ruleset.`
      );
    }
  }
}

/**
 * Expect no dark patterns in UI text
 */
export function expectNoDarkPatterns(text: string): void {
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
      throw new Error(
        `Dark pattern detected: "${matches[0]}". This violates the autonomy respect principle.`
      );
    }
  }
}

/**
 * Custom Jest matchers for Light Core
 */
export const lightMatchers = {
  toBeExplainable(received: any) {
    try {
      expectExplainable(received);
      return {
        pass: true,
        message: () => 'Response is explainable'
      };
    } catch (error: any) {
      return {
        pass: false,
        message: () => error.message
      };
    }
  },

  toHaveNoTraumaLanguage(received: string) {
    try {
      expectNoTraumaLanguage(received);
      return {
        pass: true,
        message: () => 'Text has no trauma language'
      };
    } catch (error: any) {
      return {
        pass: false,
        message: () => error.message
      };
    }
  },

  toConformToPrinciples(received: GuardedResponse) {
    try {
      expectPrincipleConformance(received);
      return {
        pass: true,
        message: () => 'Response conforms to principles'
      };
    } catch (error: any) {
      return {
        pass: false,
        message: () => error.message
      };
    }
  }
};

export default {
  expectExplainable,
  expectNoTraumaLanguage,
  expectAccessible,
  expectPrincipleConformance,
  expectWCAGReferences,
  expectValidIssueIds,
  expectNoDarkPatterns,
  lightMatchers
};
