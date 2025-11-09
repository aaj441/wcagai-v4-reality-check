/**
 * Analytics Service Unit Tests
 *
 * Tests the analytics service functionality including:
 * - Vertical metrics calculation
 * - Industry benchmarking
 * - Revenue impact estimation
 * - Scan aggregation
 */

const analyticsService = require('../../src/services/analytics');
const { VERTICAL_BENCHMARKS } = require('../../src/utils/constants');

describe('Analytics Service', () => {
  const mockScanResults = [
    {
      url: 'https://example1.com',
      success: true,
      complianceScore: 85,
      violationCount: 15,
      summary: { critical: 2, serious: 5, moderate: 6, minor: 2 },
      violations: [
        { id: 'color-contrast', description: 'Color contrast', impact: 'serious', nodes: 5 },
        { id: 'alt-text', description: 'Alt text missing', impact: 'critical', nodes: 2 }
      ]
    },
    {
      url: 'https://example2.com',
      success: true,
      complianceScore: 75,
      violationCount: 25,
      summary: { critical: 3, serious: 8, moderate: 10, minor: 4 },
      violations: [
        { id: 'color-contrast', description: 'Color contrast', impact: 'serious', nodes: 8 },
        { id: 'heading-order', description: 'Heading order', impact: 'moderate', nodes: 3 }
      ]
    },
    {
      url: 'https://example3.com',
      success: true,
      complianceScore: 90,
      violationCount: 8,
      summary: { critical: 1, serious: 2, moderate: 3, minor: 2 },
      violations: [
        { id: 'alt-text', description: 'Alt text missing', impact: 'critical', nodes: 1 }
      ]
    }
  ];

  describe('calculateVerticalMetrics()', () => {
    it('should calculate average compliance correctly', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');

      expect(metrics.avgCompliance).toBe(83); // (85 + 75 + 90) / 3 = 83.33 rounded
      expect(metrics.sitesScanned).toBe(3);
    });

    it('should calculate total violations', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');

      expect(metrics.totalViolations).toBe(48); // 15 + 25 + 8
    });

    it('should calculate violation summary by severity', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');

      expect(metrics.violationSummary).toEqual({
        critical: 6,  // 2 + 3 + 1
        serious: 15,  // 5 + 8 + 2
        moderate: 19, // 6 + 10 + 3
        minor: 8      // 2 + 4 + 2
      });
    });

    it('should identify top violations', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');

      expect(metrics.topViolations).toBeDefined();
      expect(metrics.topViolations.length).toBeGreaterThan(0);
      expect(metrics.topViolations[0]).toHaveProperty('id');
      expect(metrics.topViolations[0]).toHaveProperty('count');
      expect(metrics.topViolations[0]).toHaveProperty('description');

      // color-contrast appears in 2 results with 5 + 8 = 13 nodes
      const colorContrast = metrics.topViolations.find(v => v.id === 'color-contrast');
      expect(colorContrast).toBeDefined();
      expect(colorContrast.count).toBe(13);
    });

    it('should calculate compliance gap against benchmark', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');
      const benchmark = VERTICAL_BENCHMARKS.healthcare;

      expect(metrics.benchmarkCompliance).toBe(benchmark.avgCompliance);
      expect(metrics.complianceGap).toBe(
        Math.max(0, benchmark.avgCompliance - metrics.avgCompliance)
      );
    });

    it('should include mandate information', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');

      expect(metrics.mandate).toBeDefined();
      expect(typeof metrics.mandate).toBe('string');
    });

    it('should calculate revenue impact', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');

      expect(metrics.revenueImpact).toBeDefined();
      if (metrics.complianceGap > 0) {
        expect(metrics.revenueImpact.estimatedRevenueLoss).toBeGreaterThan(0);
        expect(metrics.revenueImpact.currency).toBe('USD');
      }
    });

    it('should include timestamp', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'healthcare');

      expect(metrics.timestamp).toBeDefined();
      expect(new Date(metrics.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should return null for empty results', () => {
      const metrics = analyticsService.calculateVerticalMetrics([], 'healthcare');
      expect(metrics).toBeNull();
    });

    it('should handle missing vertical gracefully', () => {
      const metrics = analyticsService.calculateVerticalMetrics(mockScanResults, 'unknown');

      expect(metrics.avgCompliance).toBe(83);
      expect(metrics.benchmarkCompliance).toBeNull();
    });
  });

  describe('compareToIndustry()', () => {
    it('should compare score to industry average', () => {
      const comparison = analyticsService.compareToIndustry(85, 'healthcare');
      const benchmark = VERTICAL_BENCHMARKS.healthcare;

      expect(comparison.yourScore).toBe(85);
      expect(comparison.industryAverage).toBe(benchmark.avgCompliance);
      expect(comparison.difference).toBe(85 - benchmark.avgCompliance);
    });

    it('should calculate percent difference correctly', () => {
      const comparison = analyticsService.compareToIndustry(90, 'healthcare');
      const benchmark = VERTICAL_BENCHMARKS.healthcare;
      const expectedPercent = Math.round(
        ((90 - benchmark.avgCompliance) / benchmark.avgCompliance) * 100
      );

      expect(comparison.percentDifference).toBe(expectedPercent);
    });

    it('should provide appropriate rating for excellent score', () => {
      const comparison = analyticsService.compareToIndustry(95, 'healthcare');
      expect(comparison.rating).toBe('Excellent');
    });

    it('should provide appropriate rating for good score', () => {
      const comparison = analyticsService.compareToIndustry(80, 'healthcare');
      expect(comparison.rating).toBe('Good');
    });

    it('should provide appropriate rating for fair score', () => {
      const comparison = analyticsService.compareToIndustry(65, 'healthcare');
      expect(comparison.rating).toBe('Fair');
    });

    it('should provide appropriate rating for poor score', () => {
      const comparison = analyticsService.compareToIndustry(50, 'healthcare');
      expect(comparison.rating).toBe('Poor');
    });

    it('should provide appropriate rating for critical score', () => {
      const comparison = analyticsService.compareToIndustry(30, 'healthcare');
      expect(comparison.rating).toBe('Critical');
    });

    it('should provide recommendation when above benchmark', () => {
      const comparison = analyticsService.compareToIndustry(90, 'healthcare');
      expect(comparison.recommendation).toContain('meeting or exceeding');
    });

    it('should provide recommendation when close to benchmark', () => {
      const benchmark = VERTICAL_BENCHMARKS.healthcare.avgCompliance;
      const comparison = analyticsService.compareToIndustry(benchmark - 5, 'healthcare');
      expect(comparison.recommendation).toContain('close to industry standards');
    });

    it('should provide recommendation when below benchmark', () => {
      const benchmark = VERTICAL_BENCHMARKS.healthcare.avgCompliance;
      const comparison = analyticsService.compareToIndustry(benchmark - 15, 'healthcare');
      expect(comparison.recommendation).toContain('below industry standards');
    });

    it('should provide urgent recommendation when significantly below', () => {
      const benchmark = VERTICAL_BENCHMARKS.healthcare.avgCompliance;
      const comparison = analyticsService.compareToIndustry(benchmark - 30, 'healthcare');
      expect(comparison.recommendation).toContain('significantly below');
      expect(comparison.recommendation).toContain('Immediate action');
    });

    it('should return null for unknown vertical', () => {
      const comparison = analyticsService.compareToIndustry(85, 'unknown-vertical');
      expect(comparison).toBeNull();
    });
  });

  describe('aggregateScans()', () => {
    it('should aggregate multiple scan results', () => {
      const aggregate = analyticsService.aggregateScans(mockScanResults);

      expect(aggregate.totalSites).toBe(3);
      expect(aggregate.successfulScans).toBe(3);
      expect(aggregate.failedScans).toBe(0);
    });

    it('should calculate average compliance score', () => {
      const aggregate = analyticsService.aggregateScans(mockScanResults);
      const expectedAvg = Math.round((85 + 75 + 90) / 3);

      expect(aggregate.avgComplianceScore).toBe(expectedAvg);
    });

    it('should count failed scans', () => {
      const resultsWithFailure = [
        ...mockScanResults,
        { url: 'https://failed.com', success: false }
      ];

      const aggregate = analyticsService.aggregateScans(resultsWithFailure);

      expect(aggregate.totalSites).toBe(4);
      expect(aggregate.successfulScans).toBe(3);
      expect(aggregate.failedScans).toBe(1);
    });

    it('should include timestamp', () => {
      const aggregate = analyticsService.aggregateScans(mockScanResults);

      expect(aggregate.timestamp).toBeDefined();
      expect(new Date(aggregate.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should return null for empty results', () => {
      const aggregate = analyticsService.aggregateScans([]);
      expect(aggregate).toBeNull();
    });

    it('should handle all failed scans', () => {
      const failedResults = [
        { url: 'https://fail1.com', success: false },
        { url: 'https://fail2.com', success: false }
      ];

      const aggregate = analyticsService.aggregateScans(failedResults);

      expect(aggregate.totalSites).toBe(2);
      expect(aggregate.successfulScans).toBe(0);
      expect(aggregate.failedScans).toBe(2);
      expect(aggregate.avgComplianceScore).toBe(0);
    });
  });

  describe('_estimateRevenueImpact()', () => {
    it('should estimate revenue impact based on compliance gap', () => {
      const complianceGap = 10; // 10% gap
      const impact = analyticsService._estimateRevenueImpact(complianceGap, 'healthcare');

      expect(impact).toBeDefined();
      expect(impact.complianceGap).toBe('10%');
      expect(impact.estimatedRevenueLoss).toBeGreaterThan(0);
      expect(impact.currency).toBe('USD');
      expect(impact.note).toBeDefined();
    });

    it('should return null for unknown vertical', () => {
      const impact = analyticsService._estimateRevenueImpact(10, 'unknown');
      expect(impact).toBeNull();
    });

    it('should scale revenue loss with compliance gap', () => {
      const impact1 = analyticsService._estimateRevenueImpact(5, 'healthcare');
      const impact2 = analyticsService._estimateRevenueImpact(10, 'healthcare');

      expect(impact2.estimatedRevenueLoss).toBeGreaterThan(impact1.estimatedRevenueLoss);
    });

    it('should handle zero compliance gap', () => {
      const impact = analyticsService._estimateRevenueImpact(0, 'healthcare');

      expect(impact).toBeDefined();
      expect(impact.estimatedRevenueLoss).toBe(0);
    });
  });

  describe('_getRating()', () => {
    it('should return correct ratings for all score ranges', () => {
      expect(analyticsService._getRating(95)).toBe('Excellent');
      expect(analyticsService._getRating(90)).toBe('Excellent');
      expect(analyticsService._getRating(85)).toBe('Good');
      expect(analyticsService._getRating(75)).toBe('Good');
      expect(analyticsService._getRating(70)).toBe('Fair');
      expect(analyticsService._getRating(60)).toBe('Fair');
      expect(analyticsService._getRating(50)).toBe('Poor');
      expect(analyticsService._getRating(40)).toBe('Poor');
      expect(analyticsService._getRating(30)).toBe('Critical');
      expect(analyticsService._getRating(0)).toBe('Critical');
    });
  });

  describe('Edge Cases', () => {
    it('should handle scan results with missing fields', () => {
      const incompleteResults = [
        { url: 'https://incomplete.com', success: true }
      ];

      const metrics = analyticsService.calculateVerticalMetrics(incompleteResults, 'healthcare');

      expect(metrics.avgCompliance).toBe(0);
      expect(metrics.totalViolations).toBe(0);
    });

    it('should handle negative compliance scores gracefully', () => {
      const negativeResults = [
        { url: 'https://negative.com', success: true, complianceScore: -10 }
      ];

      const aggregate = analyticsService.aggregateScans(negativeResults);
      expect(aggregate.avgComplianceScore).toBe(-10);
    });

    it('should handle very large violation counts', () => {
      const largeResults = [
        {
          url: 'https://large.com',
          success: true,
          complianceScore: 20,
          violationCount: 10000,
          summary: { critical: 2000, serious: 3000, moderate: 3000, minor: 2000 },
          violations: []
        }
      ];

      const metrics = analyticsService.calculateVerticalMetrics(largeResults, 'healthcare');
      expect(metrics.totalViolations).toBe(10000);
    });
  });
});
