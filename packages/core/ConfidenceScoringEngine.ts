/**
 * ConfidenceScoringEngine - Rule-Based Confidence Scoring for WCAG Violations
 * 
 * This engine evaluates the reliability and confidence level of detected WCAG violations
 * by analyzing multiple factors including severity, context, and detection method.
 * 
 * @module ConfidenceScoringEngine
 * @version 1.0.0
 */

export interface ViolationInput {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
  description: string;
  help: string;
  helpUrl: string;
}

export interface ConfidenceScore {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  factors: {
    severityWeight: number;
    detectionReliability: number;
    contextClarity: number;
    falsePositiveRisk: number;
  };
  reasoning: string[];
}

export interface ScoredViolation extends ViolationInput {
  confidence: ConfidenceScore;
}

/**
 * Rule-based confidence scoring weights
 */
const WEIGHTS = {
  severity: {
    critical: 1.0,
    serious: 0.85,
    moderate: 0.7,
    minor: 0.5,
  },
  detectionMethod: {
    automated: 0.9,
    semiAutomated: 0.7,
    manual: 0.95,
  },
  contextQuality: {
    high: 1.0,
    medium: 0.8,
    low: 0.6,
  },
} as const;

/**
 * Known patterns that may indicate false positives
 * Using non-greedy quantifiers and bounded patterns to avoid ReDoS
 */
const FALSE_POSITIVE_PATTERNS = [
  /aria-label[^>]{0,200}?empty/i,
  /hidden[^>]{0,200}?element/i,
  /display:\s*none/i,
  /visibility:\s*hidden/i,
  /role[^>]{0,200}?presentation/i,
];

/**
 * High-confidence rule categories
 */
const HIGH_CONFIDENCE_RULES = [
  'color-contrast',
  'image-alt',
  'label',
  'duplicate-id',
  'html-has-lang',
  'valid-lang',
  'button-name',
  'link-name',
];

/**
 * Rules with known false positive issues
 */
const PROBLEMATIC_RULES = [
  'region',
  'landmark-unique',
  'aria-allowed-attr',
  'aria-required-children',
];

export class ConfidenceScoringEngine {
  /**
   * Score a single violation
   */
  public scoreViolation(violation: ViolationInput): ScoredViolation {
    const confidence = this.calculateConfidence(violation);
    
    return {
      ...violation,
      confidence,
    };
  }

  /**
   * Score multiple violations
   */
  public scoreViolations(violations: ViolationInput[]): ScoredViolation[] {
    return violations.map((v) => this.scoreViolation(v));
  }

  /**
   * Calculate confidence score for a violation
   */
  private calculateConfidence(violation: ViolationInput): ConfidenceScore {
    const factors = {
      severityWeight: this.calculateSeverityWeight(violation),
      detectionReliability: this.calculateDetectionReliability(violation),
      contextClarity: this.calculateContextClarity(violation),
      falsePositiveRisk: this.calculateFalsePositiveRisk(violation),
    };

    // Weighted average with adjustments
    const baseScore =
      factors.severityWeight * 0.3 +
      factors.detectionReliability * 0.3 +
      factors.contextClarity * 0.2 +
      (1 - factors.falsePositiveRisk) * 0.2;

    // Scale to 0-100
    const score = Math.round(baseScore * 100);

    const level = this.determineConfidenceLevel(score);
    const reasoning = this.generateReasoning(violation, factors);

    return {
      score,
      level,
      factors,
      reasoning,
    };
  }

  /**
   * Calculate severity weight based on impact level
   */
  private calculateSeverityWeight(violation: ViolationInput): number {
    return WEIGHTS.severity[violation.impact];
  }

  /**
   * Calculate detection reliability based on rule type and tags
   */
  private calculateDetectionReliability(violation: ViolationInput): number {
    const ruleId = violation.id;

    // High confidence rules
    if (HIGH_CONFIDENCE_RULES.some((rule) => ruleId.includes(rule))) {
      return 0.95;
    }

    // Problematic rules
    if (PROBLEMATIC_RULES.some((rule) => ruleId.includes(rule))) {
      return 0.6;
    }

    // Check for WCAG tags (indicates standards-based detection)
    const hasWCAGTags = violation.tags.some((tag) => tag.startsWith('wcag'));
    if (hasWCAGTags) {
      return 0.85;
    }

    // Default reliability
    return 0.75;
  }

  /**
   * Calculate context clarity based on node information
   */
  private calculateContextClarity(violation: ViolationInput): number {
    const nodes = violation.nodes;

    if (nodes.length === 0) {
      return 0.3; // No context
    }

    let clarityScore = 0.5; // Base score

    // Check if we have detailed failure summaries
    const hasFailureSummaries = nodes.every((node) => node.failureSummary);
    if (hasFailureSummaries) {
      clarityScore += 0.2;
    }

    // Check if we have specific targets
    const hasSpecificTargets = nodes.every(
      (node) => node.target && node.target.length > 0
    );
    if (hasSpecificTargets) {
      clarityScore += 0.15;
    }

    // Check if HTML context is available
    const hasHtml = nodes.every((node) => node.html && node.html.length > 0);
    if (hasHtml) {
      clarityScore += 0.15;
    }

    return Math.min(clarityScore, 1.0);
  }

  /**
   * Calculate false positive risk
   */
  private calculateFalsePositiveRisk(violation: ViolationInput): number {
    let risk = 0.1; // Base risk

    // Check for false positive patterns in HTML
    const nodes = violation.nodes;
    for (const node of nodes) {
      const html = node.html || '';
      const failureSummary = node.failureSummary || '';
      const combined = `${html} ${failureSummary}`;

      for (const pattern of FALSE_POSITIVE_PATTERNS) {
        if (pattern.test(combined)) {
          risk += 0.2;
          break;
        }
      }
    }

    // Rules with known high false positive rates
    if (PROBLEMATIC_RULES.some((rule) => violation.id.includes(rule))) {
      risk += 0.15;
    }

    // Multiple nodes might indicate broader issue (lower risk)
    if (nodes.length > 5) {
      risk -= 0.05;
    }

    return Math.max(0, Math.min(risk, 1.0));
  }

  /**
   * Determine confidence level based on score
   */
  private determineConfidenceLevel(
    score: number
  ): 'high' | 'medium' | 'low' {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Generate human-readable reasoning for the confidence score
   */
  private generateReasoning(
    violation: ViolationInput,
    factors: ConfidenceScore['factors']
  ): string[] {
    const reasoning: string[] = [];

    // Severity reasoning
    if (factors.severityWeight >= 0.85) {
      reasoning.push(
        `High severity (${violation.impact}) increases confidence in genuine issue`
      );
    } else if (factors.severityWeight < 0.6) {
      reasoning.push(
        `Lower severity (${violation.impact}) requires additional validation`
      );
    }

    // Detection reliability reasoning
    if (factors.detectionReliability >= 0.9) {
      reasoning.push('Rule has proven high accuracy in automated detection');
    } else if (factors.detectionReliability < 0.7) {
      reasoning.push(
        'Rule known to have occasional false positives, manual review recommended'
      );
    }

    // Context clarity reasoning
    if (factors.contextClarity >= 0.8) {
      reasoning.push('Clear context with specific element targets and details');
    } else if (factors.contextClarity < 0.5) {
      reasoning.push('Limited context available, may require manual inspection');
    }

    // False positive risk reasoning
    if (factors.falsePositiveRisk > 0.3) {
      reasoning.push(
        'Patterns detected that may indicate false positive, verify manually'
      );
    } else if (factors.falsePositiveRisk < 0.15) {
      reasoning.push('Low false positive risk based on detection patterns');
    }

    // Node count reasoning
    if (violation.nodes.length > 10) {
      reasoning.push(
        `${violation.nodes.length} instances found, likely systemic issue`
      );
    } else if (violation.nodes.length === 1) {
      reasoning.push('Single instance, may be isolated edge case');
    }

    return reasoning;
  }

  /**
   * Get aggregate statistics for a set of scored violations
   */
  public getStatistics(scoredViolations: ScoredViolation[]): {
    total: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    averageScore: number;
    criticalHighConfidence: number;
  } {
    const total = scoredViolations.length;
    const highConfidence = scoredViolations.filter(
      (v) => v.confidence.level === 'high'
    ).length;
    const mediumConfidence = scoredViolations.filter(
      (v) => v.confidence.level === 'medium'
    ).length;
    const lowConfidence = scoredViolations.filter(
      (v) => v.confidence.level === 'low'
    ).length;

    const averageScore =
      total > 0
        ? scoredViolations.reduce((sum, v) => sum + v.confidence.score, 0) /
          total
        : 0;

    const criticalHighConfidence = scoredViolations.filter(
      (v) => v.impact === 'critical' && v.confidence.level === 'high'
    ).length;

    return {
      total,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      averageScore: Math.round(averageScore),
      criticalHighConfidence,
    };
  }

  /**
   * Filter violations by minimum confidence score
   */
  public filterByConfidence(
    scoredViolations: ScoredViolation[],
    minScore: number
  ): ScoredViolation[] {
    return scoredViolations.filter((v) => v.confidence.score >= minScore);
  }

  /**
   * Sort violations by confidence score (descending)
   */
  public sortByConfidence(
    scoredViolations: ScoredViolation[]
  ): ScoredViolation[] {
    return [...scoredViolations].sort(
      (a, b) => b.confidence.score - a.confidence.score
    );
  }
}

// Export singleton instance
export const confidenceScoringEngine = new ConfidenceScoringEngine();
