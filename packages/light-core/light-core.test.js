/**
 * Light Core Integration Tests
 */

const { 
  LIGHT_CHARTER, 
  validateCriticalPrinciples,
  isPrincipleEnabled,
  getEnabledPrinciples 
} = require('./light-config');

const {
  lightModelCall,
  validatePrincipleConformance
} = require('./light-guard');

const {
  BASE_ISSUES,
  getIssueById,
  isCritical,
  isValidIssueId
} = require('./a11y-rules');

const {
  expectExplainable,
  expectNoTraumaLanguage,
  expectAccessible,
  expectPrincipleConformance
} = require('./light-tests');

describe('Light Charter', () => {
  test('should load charter successfully', () => {
    expect(LIGHT_CHARTER).toBeDefined();
    expect(LIGHT_CHARTER.version).toBe('1.0.0');
    expect(LIGHT_CHARTER.principles).toBeDefined();
  });

  test('should have all required principles', () => {
    const requiredPrinciples = [
      'truthfulness',
      'accessibility_first',
      'trauma_informed',
      'autonomy_respect',
      'auditability',
      'intersectionality'
    ];

    for (const principle of requiredPrinciples) {
      expect(LIGHT_CHARTER.principles[principle]).toBeDefined();
    }
  });

  test('should validate critical principles', () => {
    expect(() => validateCriticalPrinciples()).not.toThrow();
  });

  test('should check if principles are enabled', () => {
    expect(isPrincipleEnabled('truthfulness')).toBe(true);
    expect(isPrincipleEnabled('accessibility_first')).toBe(true);
    expect(isPrincipleEnabled('auditability')).toBe(true);
  });

  test('should get all enabled principles', () => {
    const enabled = getEnabledPrinciples();
    expect(enabled).toContain('truthfulness');
    expect(enabled).toContain('accessibility_first');
    expect(enabled.length).toBeGreaterThan(0);
  });
});

describe('A11y Rules', () => {
  test('should have base issues defined', () => {
    expect(BASE_ISSUES).toBeDefined();
    expect(Array.isArray(BASE_ISSUES)).toBe(true);
    expect(BASE_ISSUES.length).toBeGreaterThan(0);
  });

  test('should get issue by ID', () => {
    const issue = getIssueById('COLOR_CONTRAST');
    expect(issue).toBeDefined();
    expect(issue.id).toBe('COLOR_CONTRAST');
    expect(issue.wcagRef).toContain('WCAG');
  });

  test('should identify critical issues', () => {
    const criticalIssue = getIssueById('KEYBOARD_TRAP');
    expect(isCritical(criticalIssue)).toBe(true);
    
    const nonCriticalIssue = getIssueById('NON_DESCRIPTIVE_LINK_TEXT');
    expect(isCritical(nonCriticalIssue)).toBe(false);
  });

  test('should validate issue IDs', () => {
    expect(isValidIssueId('COLOR_CONTRAST')).toBe(true);
    expect(isValidIssueId('KEYBOARD_TRAP')).toBe(true);
    expect(isValidIssueId('INVALID_ISSUE_123')).toBe(false);
  });

  test('all issues should have WCAG references', () => {
    for (const issue of BASE_ISSUES) {
      expect(issue.wcagRef).toBeDefined();
      expect(issue.wcagRef.length).toBeGreaterThan(0);
    }
  });
});

describe('Light Guard', () => {
  test('should wrap model call successfully', async () => {
    const testFn = async () => {
      return { message: 'Test response', status: 'ok' };
    };

    const context = {
      userId: 'test-user',
      purpose: 'Unit test',
      sensitivityLevel: 'low'
    };

    const result = await lightModelCall(testFn, context);

    expect(result).toBeDefined();
    expect(result.data).toEqual({ message: 'Test response', status: 'ok' });
    expect(result.lightReview).toBeDefined();
    expect(result.lightReview.truthfulness).toBeDefined();
    expect(result.lightReview.trauma).toBeDefined();
    expect(result.lightReview.accessibility).toBeDefined();
  });

  test('should flag uncertain language', async () => {
    const testFn = async () => {
      return 'This might be a problem, probably needs fixing';
    };

    const context = {
      userId: 'test-user',
      purpose: 'Test uncertainty',
      sensitivityLevel: 'medium'
    };

    const result = await lightModelCall(testFn, context);
    expect(result.lightReview.truthfulness).toBe('uncertain');
  });

  test('should flag trauma language', async () => {
    const testFn = async () => {
      return 'You should have done this, it is your fault';
    };

    const context = {
      userId: 'test-user',
      purpose: 'Test trauma language',
      sensitivityLevel: 'medium'
    };

    const result = await lightModelCall(testFn, context);
    expect(result.lightReview.trauma).toBe('soften_language');
    expect(result.lightReview.issues.length).toBeGreaterThan(0);
  });

  test('should pass clean response', async () => {
    const testFn = async () => {
      return { 
        violations: [
          {
            id: 'COLOR_CONTRAST',
            description: 'Text has insufficient contrast',
            help: 'Ensure contrast ratio of at least 4.5:1'
          }
        ]
      };
    };

    const context = {
      userId: 'test-user',
      purpose: 'Test clean response',
      sensitivityLevel: 'low'
    };

    const result = await lightModelCall(testFn, context);
    expect(result.lightReview.truthfulness).toBe('ok');
    expect(result.lightReview.trauma).toBe('ok');
    expect(result.lightReview.accessibility).toBe('ok');
  });
});

describe('Light Test Helpers', () => {
  test('expectExplainable should pass for explainable content', () => {
    const response = {
      description: 'This is a test',
      explanation: 'Because reasons'
    };

    expect(() => expectExplainable(response)).not.toThrow();
  });

  test('expectExplainable should fail for non-explainable content', () => {
    const response = {};
    expect(() => expectExplainable(response)).toThrow();
  });

  test('expectNoTraumaLanguage should pass for clean text', () => {
    const text = 'This is helpful guidance for improving accessibility';
    expect(() => expectNoTraumaLanguage(text)).not.toThrow();
  });

  test('expectNoTraumaLanguage should fail for harmful text', () => {
    const text = 'You should have known better, this is your fault';
    expect(() => expectNoTraumaLanguage(text)).toThrow();
  });

  test('expectAccessible should pass for accessible HTML', () => {
    const html = '<html lang="en"><img src="test.jpg" alt="Test image" /></html>';
    expect(() => expectAccessible(html)).not.toThrow();
  });

  test('expectAccessible should fail for inaccessible HTML', () => {
    const html = '<img src="test.jpg" />';
    expect(() => expectAccessible(html)).toThrow();
  });

  test('expectPrincipleConformance should pass for conforming response', async () => {
    const testFn = async () => {
      return { message: 'Clean response with proper explanation' };
    };

    const context = {
      userId: 'test-user',
      purpose: 'Conformance test',
      sensitivityLevel: 'low'
    };

    const result = await lightModelCall(testFn, context);
    expect(() => expectPrincipleConformance(result)).not.toThrow();
  });

  test('expectPrincipleConformance should fail for non-conforming response', async () => {
    const testFn = async () => {
      return 'You must do this now, it is your fault you failed';
    };

    const context = {
      userId: 'test-user',
      purpose: 'Non-conformance test',
      sensitivityLevel: 'medium'
    };

    const result = await lightModelCall(testFn, context);
    expect(() => expectPrincipleConformance(result)).toThrow();
  });
});

describe('Integration', () => {
  test('complete workflow should work end-to-end', async () => {
    // Simulate a complete workflow
    const context = {
      userId: 'integration-test',
      purpose: 'End-to-end test',
      sensitivityLevel: 'high'
    };

    // 1. Make a protected AI call
    const result = await lightModelCall(
      async () => {
        return {
          violations: [
            {
              id: 'COLOR_CONTRAST',
              description: 'Text contrast is insufficient',
              help: 'Increase contrast to at least 4.5:1',
              helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum'
            }
          ],
          passes: [],
          summary: 'Found 1 accessibility violation'
        };
      },
      context
    );

    // 2. Check review results
    expect(result.lightReview).toBeDefined();
    expect(result.lightReview.truthfulness).toBe('ok');
    expect(result.lightReview.trauma).toBe('ok');
    expect(result.lightReview.accessibility).toBe('ok');

    // 3. Validate principle conformance
    expect(() => expectPrincipleConformance(result)).not.toThrow();

    // 4. Validate issue IDs
    for (const violation of result.data.violations) {
      expect(isValidIssueId(violation.id)).toBe(true);
    }

    // 5. Check explanations
    expectExplainable(result.data);
  });
});
