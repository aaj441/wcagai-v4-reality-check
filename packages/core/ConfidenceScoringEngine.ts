/**
 * Confidence Scoring Engine for WCAG Violations
 *
 * Purpose: Apply ML-based confidence scores to raw axe-core violations
 * to reduce false positives and prioritize manual review.
 *
 * Algorithm:
 * - Base score: Impact-based (critical=95%, serious=85%, moderate=75%, minor=60%)
 * - Contextual rules: Adjust based on element visibility, location, complexity
 * - Visual validation: Use computer vision to verify violations
 * - Final score: Weighted average (40% base + 30% context + 30% visual)
 *
 * Flagging logic:
 * - confidence < 0.85 → Flag for manual review
 * - confidence < 0.6 → Likely false positive
 *
 * Usage:
 * ```typescript
 * const engine = new ConfidenceScoringEngine();
 * const scoredViolation = await engine.scoreViolation(axeResult, page);
 *
 * if (scoredViolation.flaggedForReview) {
 *   await manualReviewQueue.add(scoredViolation);
 * }
 * ```
 */

import { Page } from 'puppeteer';
import { Result as AxeResult } from 'axe-core';

// External clients (to be implemented)
interface ComputerVisionClient {
  isRealText(violation: AxeResult, page: Page): Promise<boolean>;
  classifyImage(violation: AxeResult, page: Page): Promise<'informative' | 'decorative'>;
}

interface NLPClient {
  validateHeadingStructure(violation: AxeResult, page: Page): Promise<boolean>;
}

// Scored violation with confidence metadata
export interface ScoredViolation extends AxeResult {
  confidence: number;
  flaggedForReview: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'false_positive';
  evidence: {
    screenshotPath?: string;
    context?: ElementContext;
    manualReviewNote?: string;
  };
  scoring: {
    baseScore: number;
    contextScore: number;
    visualScore: number;
    adjustments: string[];
  };
}

// Element context from page evaluation
interface ElementContext {
  isInViewport: boolean;
  isHidden: boolean;
  isInModal: boolean;
  hasComplexDescendants: boolean;
  tagName: string;
  computedStyle?: any;
  ariaAttributes?: Record<string, string>;
}

export class ConfidenceScoringEngine {
  private cvClient?: ComputerVisionClient;
  private nlpClient?: NLPClient;

  constructor(
    cvClient?: ComputerVisionClient,
    nlpClient?: NLPClient
  ) {
    this.cvClient = cvClient;
    this.nlpClient = nlpClient;
  }

  /**
   * Score a single violation with confidence metadata
   */
  async scoreViolation(violation: AxeResult, page: Page): Promise<ScoredViolation> {
    const adjustments: string[] = [];

    // Step 1: Calculate base confidence from impact
    const baseScore = this.calculateBaseConfidence(violation, adjustments);

    // Step 2: Apply contextual rules
    const contextScore = await this.applyContextualRules(violation, page, adjustments);

    // Step 3: Visual validation (if clients available)
    const visualScore = await this.validateVisually(violation, page, adjustments);

    // Step 4: Weighted average
    const finalConfidence = (baseScore * 0.4) + (contextScore * 0.3) + (visualScore * 0.3);
    const roundedConfidence = Math.round(finalConfidence * 100) / 100;

    // Step 5: Determine if manual review needed
    const flaggedForReview = this.shouldFlagForReview(
      violation,
      roundedConfidence,
      adjustments
    );

    // Step 6: Map to severity
    const severity = this.mapSeverity(violation, roundedConfidence);

    // Step 7: Capture evidence
    const evidence = await this.captureEvidence(violation, page);

    return {
      ...violation,
      confidence: roundedConfidence,
      flaggedForReview,
      severity,
      evidence,
      scoring: {
        baseScore,
        contextScore,
        visualScore,
        adjustments
      }
    };
  }

  /**
   * Calculate base confidence from impact and rule reliability
   */
  private calculateBaseConfidence(
    violation: AxeResult,
    adjustments: string[]
  ): number {
    // Impact-based scoring
    const impactScore: Record<string, number> = {
      minor: 0.6,
      moderate: 0.75,
      serious: 0.85,
      critical: 0.95
    };

    let score = impactScore[violation.impact] || 0.7;
    adjustments.push(`Base impact: ${violation.impact} → ${score}`);

    // Known flaky rules (high false positive rate)
    const flakyRules = [
      'color-contrast',        // Often fails on decorative text
      'aria-hidden-focus',     // Complex interaction patterns
      'heading-order',         // Semantic structure subjective
      'label-content-name-mismatch', // ARIA label variations
      'scrollable-region-focusable'  // Custom scroll implementations
    ];

    if (flakyRules.includes(violation.id)) {
      score -= 0.15;
      adjustments.push(`Flaky rule: ${violation.id} → -0.15`);
    }

    // Known reliable rules (low false positive rate)
    const reliableRules = [
      'image-alt',             // Clear requirement
      'html-lang',             // Clear requirement
      'document-title',        // Clear requirement
      'frame-title',           // Clear requirement
      'form-field-multiple-labels', // Structural issue
      'duplicate-id'           // Structural issue
    ];

    if (reliableRules.includes(violation.id)) {
      score += 0.1;
      adjustments.push(`Reliable rule: ${violation.id} → +0.1`);
    }

    // Clamp to valid range
    return Math.max(0.1, Math.min(1.0, score));
  }

  /**
   * Apply contextual rules based on element properties
   */
  private async applyContextualRules(
    violation: AxeResult,
    page: Page,
    adjustments: string[]
  ): Promise<number> {
    // Get first target selector
    const selector = violation.nodes[0]?.target?.[0];
    if (!selector) {
      adjustments.push('No selector found → default 0.5');
      return 0.5;
    }

    // Evaluate element context in page
    const context = await this.getElementContext(page, selector);
    if (!context) {
      adjustments.push('Element not found → default 0.5');
      return 0.5;
    }

    let boost = 0;

    // Hidden elements likely not impacting users
    if (context.isHidden) {
      boost -= 0.4;
      adjustments.push('Element hidden → -0.4');
    }

    // Modal violations may be transient
    if (violation.id === 'color-contrast' && context.isInModal) {
      boost -= 0.2;
      adjustments.push('Color contrast in modal → -0.2');
    }

    // Complex descendants may have workarounds
    if (context.hasComplexDescendants) {
      boost -= 0.15;
      adjustments.push('Complex descendants → -0.15');
    }

    // In viewport + simple structure = high confidence
    if (context.isInViewport && !context.hasComplexDescendants) {
      boost += 0.1;
      adjustments.push('In viewport + simple → +0.1');
    }

    // ARIA attributes may provide alternative accessibility
    if (context.ariaAttributes && Object.keys(context.ariaAttributes).length > 0) {
      boost += 0.05;
      adjustments.push(`ARIA attributes present → +0.05`);
    }

    return Math.max(0.2, Math.min(1.0, 0.7 + boost));
  }

  /**
   * Validate violation using computer vision and NLP
   */
  private async validateVisually(
    violation: AxeResult,
    page: Page,
    adjustments: string[]
  ): Promise<number> {
    // Rule-specific visual validation
    switch (violation.id) {
      case 'color-contrast':
        if (this.cvClient) {
          const isRealText = await this.cvClient.isRealText(violation, page);
          const score = isRealText ? 0.9 : 0.4;
          adjustments.push(`Visual: ${isRealText ? 'Real text' : 'Decorative'} → ${score}`);
          return score;
        }
        return 0.7;

      case 'image-alt':
        if (this.cvClient) {
          const imageType = await this.cvClient.classifyImage(violation, page);
          const score = imageType === 'informative' ? 0.95 : 0.6;
          adjustments.push(`Visual: Image ${imageType} → ${score}`);
          return score;
        }
        return 0.7;

      case 'heading-order':
        if (this.nlpClient) {
          const isValid = await this.nlpClient.validateHeadingStructure(violation, page);
          const score = isValid ? 0.9 : 0.5;
          adjustments.push(`NLP: Heading structure ${isValid ? 'valid' : 'invalid'} → ${score}`);
          return score;
        }
        return 0.7;

      default:
        adjustments.push('No visual validation → default 0.7');
        return 0.7;
    }
  }

  /**
   * Get element context from page
   */
  private async getElementContext(
    page: Page,
    selector: string
  ): Promise<ElementContext | null> {
    try {
      return await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        // Extract ARIA attributes
        const ariaAttributes: Record<string, string> = {};
        for (const attr of el.attributes) {
          if (attr.name.startsWith('aria-')) {
            ariaAttributes[attr.name] = attr.value;
          }
        }

        return {
          isInViewport: rect.top < window.innerHeight && rect.bottom > 0,
          isHidden: el.offsetParent === null || style.display === 'none' || style.visibility === 'hidden',
          isInModal: !!el.closest('[role="dialog"], .modal, [aria-modal="true"]'),
          hasComplexDescendants: el.querySelectorAll('*').length > 10,
          tagName: el.tagName.toLowerCase(),
          ariaAttributes
        };
      }, selector);
    } catch (error) {
      console.error(`Failed to get context for ${selector}:`, error);
      return null;
    }
  }

  /**
   * Capture evidence (screenshot + context)
   */
  private async captureEvidence(
    violation: AxeResult,
    page: Page
  ): Promise<ScoredViolation['evidence']> {
    const selector = violation.nodes[0]?.target?.[0];
    if (!selector) return {};

    try {
      // Capture element screenshot
      const element = await page.$(selector);
      if (element) {
        const screenshotPath = `evidence/${violation.id}-${Date.now()}.png`;
        await element.screenshot({ path: screenshotPath });

        return {
          screenshotPath,
          context: await this.getElementContext(page, selector)
        };
      }
    } catch (error) {
      console.error('Failed to capture evidence:', error);
    }

    return {};
  }

  /**
   * Determine if violation should be flagged for manual review
   */
  private shouldFlagForReview(
    violation: AxeResult,
    confidence: number,
    adjustments: string[]
  ): boolean {
    // Always flag low confidence
    if (confidence < 0.85) {
      adjustments.push(`Confidence ${confidence} < 0.85 → Flag for review`);
      return true;
    }

    // Always flag critical violations even with high confidence
    if (violation.impact === 'critical' && confidence < 0.95) {
      adjustments.push(`Critical impact with confidence ${confidence} → Flag for review`);
      return true;
    }

    // Flag known subjective rules
    const subjectiveRules = [
      'color-contrast',
      'aria-*',
      'heading-order',
      'label-content-name-mismatch'
    ];

    const isSubjective = subjectiveRules.some(rule =>
      violation.id === rule || (rule.includes('*') && violation.id.startsWith(rule.replace('*', '')))
    );

    if (isSubjective) {
      adjustments.push(`Subjective rule: ${violation.id} → Flag for review`);
      return true;
    }

    return false;
  }

  /**
   * Map confidence to severity
   */
  private mapSeverity(
    violation: AxeResult,
    confidence: number
  ): ScoredViolation['severity'] {
    if (confidence < 0.6) return 'false_positive';
    if (confidence < 0.75) return 'low';
    if (confidence < 0.85) return 'medium';

    // Map axe-core impact to severity
    switch (violation.impact) {
      case 'critical': return 'critical';
      case 'serious': return 'high';
      case 'moderate': return 'medium';
      case 'minor': return 'low';
      default: return 'medium';
    }
  }

  /**
   * Batch score multiple violations
   */
  async scoreViolations(
    violations: AxeResult[],
    page: Page
  ): Promise<ScoredViolation[]> {
    const scored: ScoredViolation[] = [];

    for (const violation of violations) {
      try {
        const scoredViolation = await this.scoreViolation(violation, page);
        scored.push(scoredViolation);
      } catch (error) {
        console.error(`Failed to score violation ${violation.id}:`, error);
        // Return with default confidence
        scored.push({
          ...violation,
          confidence: 0.5,
          flaggedForReview: true,
          severity: 'medium',
          evidence: {},
          scoring: {
            baseScore: 0.5,
            contextScore: 0.5,
            visualScore: 0.5,
            adjustments: ['Error during scoring → default 0.5']
          }
        });
      }
    }

    return scored;
  }

  /**
   * Get statistics about scored violations
   */
  getStatistics(scoredViolations: ScoredViolation[]): {
    total: number;
    flaggedForReview: number;
    avgConfidence: number;
    bySeverity: Record<string, number>;
    topRules: Array<{ rule: string; count: number }>;
  } {
    const bySeverity: Record<string, number> = {};
    const ruleCount = new Map<string, number>();

    let totalConfidence = 0;
    let flaggedCount = 0;

    for (const violation of scoredViolations) {
      totalConfidence += violation.confidence;

      if (violation.flaggedForReview) {
        flaggedCount++;
      }

      bySeverity[violation.severity] = (bySeverity[violation.severity] || 0) + 1;
      ruleCount.set(violation.id, (ruleCount.get(violation.id) || 0) + 1);
    }

    const topRules = Array.from(ruleCount.entries())
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: scoredViolations.length,
      flaggedForReview: flaggedCount,
      avgConfidence: Math.round((totalConfidence / scoredViolations.length) * 100) / 100,
      bySeverity,
      topRules
    };
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * import { ConfidenceScoringEngine } from './ConfidenceScoringEngine';
 * import puppeteer from 'puppeteer';
 * import axe from 'axe-core';
 *
 * const browser = await puppeteer.launch();
 * const page = await browser.newPage();
 * await page.goto('https://example.com');
 *
 * // Inject axe-core
 * await page.addScriptTag({ path: require.resolve('axe-core') });
 *
 * // Run audit
 * const results = await page.evaluate(async () => {
 *   const axe = window.axe;
 *   return await axe.run();
 * });
 *
 * // Score violations
 * const engine = new ConfidenceScoringEngine();
 * const scoredViolations = await engine.scoreViolations(results.violations, page);
 *
 * // Filter high-confidence violations
 * const highConfidence = scoredViolations.filter(v => v.confidence >= 0.85);
 * console.log(`${highConfidence.length} high-confidence violations found`);
 *
 * // Get violations needing manual review
 * const needsReview = scoredViolations.filter(v => v.flaggedForReview);
 * console.log(`${needsReview.length} violations flagged for manual review`);
 *
 * // Get statistics
 * const stats = engine.getStatistics(scoredViolations);
 * console.log('Statistics:', stats);
 * ```
 */

export default ConfidenceScoringEngine;
