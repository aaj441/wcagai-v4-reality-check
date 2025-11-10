/**
 * Report Synthesizer Agent - Comprehensive Report Generator
 * 
 * Responsibilities:
 * - Compiles audit + analysis results
 * - Generates actionable remediation steps
 * - Creates executive summary
 * - Produces developer-focused technical report
 * - Scores overall compliance (0-100)
 */

import type { AuditResult } from './auditor';
import type { AnalyzerResult } from './analyzer';

export interface SynthesizerInput {
  auditResult: AuditResult;
  analysisResult: AnalyzerResult;
  auditId: string;
}

export interface ReportOutput {
  executiveSummary: string;
  technicalDetails: string;
  remediationSteps: RemediationStep[];
  complianceScore: number;
  priorityActions: string[];
  metadata: {
    generated: Date;
    duration: number;
  };
}

export interface RemediationStep {
  priority: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  impact: string;
  solution: string;
  estimatedEffort: string;
  wcagCriteria: string[];
}

export class ReportSynthesizerAgent {
  /**
   * Generate comprehensive report
   */
  async synthesize(input: SynthesizerInput): Promise<ReportOutput> {
    const startTime = Date.now();

    try {
      // Calculate overall compliance score
      const complianceScore = this.calculateOverallScore(input.auditResult, input.analysisResult);

      // Generate executive summary
      const executiveSummary = this.generateExecutiveSummary(
        complianceScore,
        input.auditResult,
        input.analysisResult
      );

      // Generate technical details
      const technicalDetails = this.generateTechnicalDetails(
        input.auditResult,
        input.analysisResult
      );

      // Generate remediation steps
      const remediationSteps = this.generateRemediationSteps(
        input.auditResult,
        input.analysisResult
      );

      // Identify priority actions
      const priorityActions = this.identifyPriorityActions(remediationSteps);

      return {
        executiveSummary,
        technicalDetails,
        remediationSteps,
        complianceScore,
        priorityActions,
        metadata: {
          generated: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      throw new Error(
        `Report synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(auditResult: AuditResult, analysisResult: AnalyzerResult): number {
    // Weighted average of audit and analysis scores
    const auditWeight = 0.7;
    const analysisWeight = 0.3;

    const analysisScore =
      (analysisResult.semanticScore +
        analysisResult.ariaScore +
        analysisResult.contrastScore +
        analysisResult.readabilityScore) /
      4;

    return Math.round(
      auditResult.complianceScore * auditWeight + analysisScore * analysisWeight
    );
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    score: number,
    auditResult: AuditResult,
    analysisResult: AnalyzerResult
  ): string {
    return `
# Executive Summary

**Overall Compliance Score: ${score}/100**

${this.getScoreInterpretation(score)}

## Key Findings

- **Accessibility Tests**: ${auditResult.passedTests} passed, ${auditResult.failedTests} failed
- **Violations Found**: ${auditResult.violations.length}
- **Semantic HTML Score**: ${analysisResult.semanticScore}/100
- **ARIA Implementation**: ${analysisResult.ariaScore}/100
- **Color Contrast**: ${analysisResult.contrastScore}/100
- **Readability**: ${analysisResult.readabilityScore}/100

## Recommendations

${analysisResult.recommendations.join('\n')}

---
*Report generated on ${new Date().toLocaleDateString()}*
    `.trim();
  }

  /**
   * Generate technical details
   */
  private generateTechnicalDetails(
    auditResult: AuditResult,
    analysisResult: AnalyzerResult
  ): string {
    return `
# Technical Audit Report

## WCAG Compliance Analysis

- **Level**: ${auditResult.metadata.wcagLevel}
- **Tools Used**: ${auditResult.metadata.toolsUsed.join(', ')}
- **Test Duration**: ${auditResult.metadata.duration}ms
- **Total Tests**: ${auditResult.passedTests + auditResult.failedTests + auditResult.inapplicableTests}

## Detailed Findings

### Passed Tests: ${auditResult.passedTests}
These tests indicate areas where your site meets WCAG standards.

### Failed Tests: ${auditResult.failedTests}
These tests indicate areas that require immediate attention.

### Inapplicable Tests: ${auditResult.inapplicableTests}
These tests don't apply to your current content.

## Content Analysis

- **Semantic HTML**: ${analysisResult.semanticScore}/100
- **ARIA Attributes**: ${analysisResult.ariaScore}/100
- **Color Contrast**: ${analysisResult.contrastScore}/100
- **Readability**: ${analysisResult.readabilityScore}/100

---
*Detailed technical analysis complete*
    `.trim();
  }

  /**
   * Generate remediation steps
   */
  private generateRemediationSteps(
    auditResult: AuditResult,
    analysisResult: AnalyzerResult
  ): RemediationStep[] {
    const steps: RemediationStep[] = [];

    // Add steps based on audit violations
    auditResult.violations.forEach((violation) => {
      steps.push({
        priority: this.mapSeverityToPriority(violation.severity),
        issue: violation.description,
        impact: violation.impact,
        solution: violation.fixSuggestion || 'Refer to WCAG documentation',
        estimatedEffort: '2-4 hours',
        wcagCriteria: [violation.wcagCriterion],
      });
    });

    // Add steps based on analysis issues
    analysisResult.issues.forEach((issue) => {
      steps.push({
        priority: this.mapSeverityToPriority(issue.severity as any),
        issue: issue.description,
        impact: 'Affects user experience and accessibility',
        solution: issue.suggestedFix || 'Review and implement best practices',
        estimatedEffort: '1-3 hours',
        wcagCriteria: [],
      });
    });

    return steps.sort((a, b) => this.priorityValue(a.priority) - this.priorityValue(b.priority));
  }

  /**
   * Identify priority actions
   */
  private identifyPriorityActions(steps: RemediationStep[]): string[] {
    return steps
      .filter((step) => step.priority === 'critical' || step.priority === 'high')
      .slice(0, 5)
      .map((step) => step.issue);
  }

  /**
   * Get score interpretation
   */
  private getScoreInterpretation(score: number): string {
    if (score >= 90) return '✅ Excellent - Your site demonstrates strong accessibility.';
    if (score >= 75) return '⚠️  Good - Some improvements needed for full compliance.';
    if (score >= 60) return '⚠️  Fair - Significant accessibility issues require attention.';
    return '❌ Poor - Critical accessibility barriers must be addressed immediately.';
  }

  /**
   * Map severity to priority
   */
  private mapSeverityToPriority(
    severity: 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'MINOR'
  ): 'critical' | 'high' | 'medium' | 'low' {
    const map = {
      CRITICAL: 'critical',
      SERIOUS: 'high',
      MODERATE: 'medium',
      MINOR: 'low',
    };
    return map[severity] as 'critical' | 'high' | 'medium' | 'low';
  }

  /**
   * Get priority numeric value for sorting
   */
  private priorityValue(priority: string): number {
    const values = { critical: 0, high: 1, medium: 2, low: 3 };
    return values[priority as keyof typeof values] || 999;
  }
}
