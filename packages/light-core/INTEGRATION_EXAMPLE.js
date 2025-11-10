/**
 * Example: Integrating Light Core with Scanner Service
 * This demonstrates how to wrap accessibility scanning with ethical guardrails
 */

const { lightModelCall } = require('../../packages/light-core');

/**
 * Example: Enhanced scanner service with Light Core integration
 * This would replace or wrap the existing scanner service
 */
class LightScannerService {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
  }

  /**
   * Scan a URL with Light protection
   * All results are reviewed for ethical compliance
   */
  async scan(url, context) {
    return await lightModelCall(
      async () => {
        // Perform the actual scan
        const scanResult = await this.baseScanner.scan(url);
        
        // Enhance results with explanations
        return this.enhanceResults(scanResult);
      },
      {
        ...context,
        purpose: `Accessibility scan: ${url}`,
        sensitivityLevel: 'high' // Scanning is high-sensitivity
      }
    );
  }

  /**
   * Enhance scan results with required explanations
   * Ensures all violations have clear descriptions
   */
  enhanceResults(scanResult) {
    if (!scanResult.violations) {
      return scanResult;
    }

    return {
      ...scanResult,
      violations: scanResult.violations.map(violation => ({
        ...violation,
        // Ensure explanation is present
        explanation: violation.help || violation.description || 
                    'This element violates WCAG accessibility standards',
        // Ensure WCAG reference
        wcagRef: this.extractWCAGRef(violation),
        // Add remediation steps
        remediation: this.getRemediationSteps(violation)
      }))
    };
  }

  /**
   * Extract WCAG reference from violation tags
   */
  extractWCAGRef(violation) {
    if (violation.wcagRef) return violation.wcagRef;
    
    // Try to extract from tags
    if (violation.tags && Array.isArray(violation.tags)) {
      const wcagTag = violation.tags.find(tag => 
        tag.startsWith('wcag2') || tag.startsWith('wcag21') || tag.startsWith('wcag22')
      );
      if (wcagTag) {
        return `WCAG ${wcagTag}`;
      }
    }
    
    return 'WCAG 2.1 (unspecified criterion)';
  }

  /**
   * Get remediation steps for a violation
   */
  getRemediationSteps(violation) {
    // This would ideally be more sophisticated
    return violation.helpUrl ? 
      `Learn more: ${violation.helpUrl}` :
      'Review WCAG documentation for remediation guidance';
  }

  /**
   * Scan multiple URLs with Light protection
   */
  async scanMultiple(urls, context) {
    const results = [];
    
    for (const url of urls) {
      const result = await this.scan(url, context);
      results.push(result);
    }
    
    return results;
  }
}

/**
 * Example: Using Light Scanner in a route handler
 */
async function scanRouteHandler(req, res) {
  const { lightModelCall } = require('../../packages/light-core');
  const scannerService = require('../services/scanner');
  
  try {
    const { url } = req.body;
    
    // Use Light model call to wrap the scanner
    const result = await lightModelCall(
      async () => {
        const scanResult = await scannerService.scan(url);
        
        // Ensure all violations have proper explanations
        if (scanResult.violations) {
          scanResult.violations = scanResult.violations.map(v => ({
            ...v,
            explanation: v.help || v.description || 
                        'This violates WCAG accessibility standards',
            wcagRef: extractWCAGRef(v),
            suggestion: getSuggestion(v)
          }));
        }
        
        return scanResult;
      },
      req.lightContext
    );

    // Check if there were any principle violations
    const { lightReview, data } = result;
    
    if (lightReview.issues.length > 0) {
      console.warn('Light review found issues:', lightReview.issues);
    }

    // Return results with review metadata
    res.json({
      success: true,
      url,
      scan: data,
      lightReview: {
        truthfulness: lightReview.truthfulness,
        trauma: lightReview.trauma,
        accessibility: lightReview.accessibility,
        timestamp: lightReview.timestamp
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Example: AI-powered violation analysis with Light Core
 * This would be used if you had an AI service analyzing violations
 */
async function analyzeViolationsWithAI(violations, context) {
  const { lightModelCall, buildSafePrompt } = require('../../packages/light-core');
  
  // Build a safe prompt
  const { system, user } = buildSafePrompt(
    `Analyze these accessibility violations: ${JSON.stringify(violations)}`,
    'wcagai'
  );

  // Make AI call through Light guard
  return await lightModelCall(
    async () => {
      // This would be your actual AI API call
      // For example: return await openai.chat.completions.create({...})
      
      // Simulated AI response
      return {
        summary: 'Found color contrast issues affecting readability',
        priority: 'high',
        affectedUsers: ['visually impaired', 'low vision'],
        recommendations: [
          'Increase contrast ratio to 4.5:1 minimum',
          'Test with color blindness simulators'
        ]
      };
    },
    {
      ...context,
      purpose: 'AI violation analysis',
      sensitivityLevel: 'high'
    }
  );
}

/**
 * Example: Complete workflow with validation
 */
async function completeWorkflowExample(url, userId) {
  const { 
    lightModelCall, 
    validatePrincipleConformance 
  } = require('../../packages/light-core');
  
  const context = {
    userId,
    purpose: 'Complete accessibility audit',
    sensitivityLevel: 'high',
    metadata: { url }
  };

  // Step 1: Scan with Light protection
  const scanResult = await lightModelCall(
    async () => {
      const scanner = require('../services/scanner');
      return await scanner.scan(url);
    },
    context
  );

  // Step 2: Validate principle conformance
  try {
    validatePrincipleConformance(scanResult);
    console.log('✅ Scan results conform to principles');
  } catch (error) {
    console.error('❌ Principle violation:', error.message);
    throw error;
  }

  // Step 3: Return enhanced results
  return {
    url,
    scan: scanResult.data,
    lightReview: scanResult.lightReview,
    compliance: {
      passed: scanResult.lightReview.issues.length === 0,
      issues: scanResult.lightReview.issues,
      warnings: scanResult.lightReview.warnings
    }
  };
}

module.exports = {
  LightScannerService,
  scanRouteHandler,
  analyzeViolationsWithAI,
  completeWorkflowExample
};
