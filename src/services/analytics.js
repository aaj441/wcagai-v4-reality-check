const { VERTICAL_BENCHMARKS } = require('../utils/constants');
const logger = require('../utils/logger');

class AnalyticsService {
  calculateVerticalMetrics(scanResults, vertical) {
    const benchmark = VERTICAL_BENCHMARKS[vertical];

    if (!scanResults || scanResults.length === 0) {
      return null;
    }

    // Calculate average compliance
    const totalCompliance = scanResults.reduce((sum, result) => {
      return sum + (result.complianceScore || 0);
    }, 0);
    const avgCompliance = Math.round(totalCompliance / scanResults.length);

    // Count total violations
    const totalViolations = scanResults.reduce((sum, result) => {
      return sum + (result.violationCount || 0);
    }, 0);

    // Calculate violation breakdown
    const violationSummary = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    };

    scanResults.forEach(result => {
      if (result.summary) {
        violationSummary.critical += result.summary.critical || 0;
        violationSummary.serious += result.summary.serious || 0;
        violationSummary.moderate += result.summary.moderate || 0;
        violationSummary.minor += result.summary.minor || 0;
      }
    });

    // Calculate top violations
    const allViolations = {};
    scanResults.forEach(result => {
      if (result.violations) {
        result.violations.forEach(v => {
          if (!allViolations[v.id]) {
            allViolations[v.id] = {
              id: v.id,
              description: v.description,
              impact: v.impact,
              count: 0
            };
          }
          allViolations[v.id].count += v.nodes || 1;
        });
      }
    });

    const topViolations = Object.values(allViolations)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate ROI/revenue impact (simplified)
    const complianceGap = Math.max(0, (benchmark?.avgCompliance || 50) - avgCompliance);
    const revenueImpact = this._estimateRevenueImpact(complianceGap, vertical);

    return {
      vertical,
      sitesScanned: scanResults.length,
      avgCompliance,
      benchmarkCompliance: benchmark?.avgCompliance || null,
      complianceGap,
      totalViolations,
      violationSummary,
      topViolations,
      revenueImpact,
      mandate: benchmark?.mandate || 'N/A',
      timestamp: new Date().toISOString()
    };
  }

  _estimateRevenueImpact(complianceGap, vertical) {
    const benchmark = VERTICAL_BENCHMARKS[vertical];
    if (!benchmark || !benchmark.averageRevenue) {
      return null;
    }

    // Simple estimation: each 1% compliance gap = 0.1% revenue impact
    // This is a simplified model for demonstration
    const revenuePercentImpact = complianceGap * 0.1;
    const estimatedImpact = Math.round(benchmark.averageRevenue * (revenuePercentImpact / 100));

    return {
      complianceGap: `${complianceGap}%`,
      estimatedRevenueLoss: estimatedImpact,
      currency: 'USD',
      note: 'Estimated based on industry benchmarks'
    };
  }

  compareToIndustry(complianceScore, vertical) {
    const benchmark = VERTICAL_BENCHMARKS[vertical];
    if (!benchmark) {
      return null;
    }

    const difference = complianceScore - benchmark.avgCompliance;
    const percentDifference = benchmark.avgCompliance > 0
      ? Math.round((difference / benchmark.avgCompliance) * 100)
      : 0;

    return {
      yourScore: complianceScore,
      industryAverage: benchmark.avgCompliance,
      difference,
      percentDifference,
      rating: this._getRating(complianceScore),
      recommendation: this._getRecommendation(complianceScore, benchmark.avgCompliance)
    };
  }

  _getRating(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  }

  _getRecommendation(score, benchmark) {
    if (score >= benchmark) {
      return 'You are meeting or exceeding industry standards. Continue monitoring and maintaining compliance.';
    } else if (score >= benchmark - 10) {
      return 'You are close to industry standards. Focus on addressing critical and serious violations.';
    } else if (score >= benchmark - 25) {
      return 'You are below industry standards. Implement a comprehensive accessibility remediation plan.';
    } else {
      return 'You are significantly below industry standards. Immediate action required to avoid compliance risks.';
    }
  }

  aggregateScans(scanResults) {
    if (!scanResults || scanResults.length === 0) {
      return null;
    }

    const totalSites = scanResults.length;
    const successfulScans = scanResults.filter(r => r.success).length;
    const failedScans = totalSites - successfulScans;

    const avgScore = scanResults
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.complianceScore || 0), 0) / (successfulScans || 1);

    return {
      totalSites,
      successfulScans,
      failedScans,
      avgComplianceScore: Math.round(avgScore),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AnalyticsService();
