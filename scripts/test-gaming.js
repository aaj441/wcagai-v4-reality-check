#!/usr/bin/env node

/**
 * Gaming Accessibility Test Suite
 * Tests accessibility compliance for major gaming platforms
 */

const scannerService = require('../src/services/scanner');
const discoveryService = require('../src/services/discovery');

async function testGamingSites() {
  console.log('\n🎮 GAMING ACCESSIBILITY TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get gaming sites
  const sites = await discoveryService.discover('gaming', 5);
  console.log(`Testing ${sites.length} gaming platforms:\n`);

  sites.forEach((site, idx) => {
    console.log(`${idx + 1}. ${site.title} - ${site.url}`);
  });

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // Scan results storage
  const results = [];

  // Test each site
  for (const [idx, site] of sites.entries()) {
    console.log(`\n[${idx + 1}/${sites.length}] Scanning: ${site.title}`);
    console.log(`URL: ${site.url}`);
    console.log('─────────────────────────────────────────────────────────');

    try {
      const startTime = Date.now();
      const scanResult = await scannerService.scan(site.url);
      const duration = Date.now() - startTime;

      console.log(`✅ Scan completed in ${(duration / 1000).toFixed(2)}s`);
      console.log(`   Compliance Score: ${scanResult.complianceScore}%`);
      console.log(`   Total Violations: ${scanResult.violationCount}`);
      console.log(`   Passes: ${scanResult.passCount}`);

      if (scanResult.violations && scanResult.violations.length > 0) {
        const bySeverity = scanResult.violations.reduce((acc, v) => {
          acc[v.impact] = (acc[v.impact] || 0) + 1;
          return acc;
        }, {});

        console.log(`   By Severity:`);
        if (bySeverity.critical) console.log(`     - Critical: ${bySeverity.critical}`);
        if (bySeverity.serious) console.log(`     - Serious: ${bySeverity.serious}`);
        if (bySeverity.moderate) console.log(`     - Moderate: ${bySeverity.moderate}`);
        if (bySeverity.minor) console.log(`     - Minor: ${bySeverity.minor}`);
      }

      results.push({
        ...site,
        ...scanResult,
        scanDuration: duration
      });

    } catch (error) {
      console.log(`❌ Scan failed: ${error.message}`);
      results.push({
        ...site,
        error: error.message,
        complianceScore: 0,
        violationCount: 0
      });
    }

    // Add delay to avoid overwhelming sites
    if (idx < sites.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Generate summary report
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('📊 GAMING INDUSTRY ACCESSIBILITY REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  const successfulScans = results.filter(r => !r.error);

  if (successfulScans.length > 0) {
    const avgCompliance = successfulScans.reduce((sum, r) => sum + r.complianceScore, 0) / successfulScans.length;
    const totalViolations = successfulScans.reduce((sum, r) => sum + r.violationCount, 0);

    console.log(`Sites Scanned: ${successfulScans.length}`);
    console.log(`Average Compliance: ${avgCompliance.toFixed(1)}%`);
    console.log(`Total Violations Found: ${totalViolations}`);
    console.log(`Average Violations per Site: ${(totalViolations / successfulScans.length).toFixed(1)}`);
    console.log();

    // Top 3 issues
    const allViolations = successfulScans.flatMap(r => r.violations || []);
    const violationCounts = {};

    allViolations.forEach(v => {
      const key = v.description || v.id;
      violationCounts[key] = (violationCounts[key] || 0) + 1;
    });

    const topIssues = Object.entries(violationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topIssues.length > 0) {
      console.log('Top Accessibility Issues in Gaming:');
      topIssues.forEach(([issue, count], idx) => {
        console.log(`  ${idx + 1}. ${issue} (${count} occurrences)`);
      });
      console.log();
    }

    // Site rankings
    console.log('Site Rankings by Compliance:');
    console.log('─────────────────────────────────────────────────────────');

    const ranked = [...successfulScans].sort((a, b) => b.complianceScore - a.complianceScore);
    ranked.forEach((site, idx) => {
      const emoji = site.complianceScore >= 70 ? '🟢' : site.complianceScore >= 50 ? '🟡' : '🔴';
      console.log(`${idx + 1}. ${emoji} ${site.title}`);
      console.log(`   Score: ${site.complianceScore}% | Violations: ${site.violationCount}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // Close browser
  await scannerService.closeBrowser();

  return results;
}

// Run if called directly
if (require.main === module) {
  testGamingSites()
    .then(results => {
      console.log('✅ Gaming accessibility test complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testGamingSites };
