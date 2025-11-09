const puppeteer = require('puppeteer');
const axe = require('axe-core');
const config = require('../../config');
const logger = require('../utils/logger');
const cacheService = require('./cache');

class ScannerService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      logger.info('Puppeteer browser initialized');
    }
    return this.browser;
  }

  async scan(url, options = {}) {
    const cacheKey = `scan:${url}`;

    // Try cache first
    if (!options.skipCache) {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for scan: ${url}`);
        return JSON.parse(cached);
      }
    }

    logger.info(`Starting accessibility scan for: ${url}`);
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Set timeout
      await page.setDefaultNavigationTimeout(config.scanner.timeout);

      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Inject axe-core
      await page.addScriptTag({
        content: axe.source
      });

      // Run axe analysis
      const results = await page.evaluate(async () => {
        return await window.axe.run({
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
          }
        });
      });

      // Process results
      const scanResult = this._processResults(url, results);

      // Cache results
      await cacheService.set(cacheKey, JSON.stringify(scanResult), config.redis.ttl);

      logger.info(`Scan completed for ${url}: ${scanResult.violations.length} violations found`);

      return scanResult;

    } catch (error) {
      logger.error(`Scan error for ${url}:`, error.message);

      // Return error result
      return {
        url,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
        violations: [],
        passes: [],
        inapplicable: [],
        incomplete: [],
        complianceScore: 0
      };

    } finally {
      await page.close();
    }
  }

  async scanMultiple(urls, maxConcurrent = config.scanner.maxConcurrent) {
    logger.info(`Scanning ${urls.length} URLs with max concurrency ${maxConcurrent}`);

    const results = [];
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(url => this.scan(url).catch(err => {
          logger.error(`Batch scan error for ${url}:`, err.message);
          return {
            url,
            success: false,
            error: err.message,
            violations: [],
            complianceScore: 0
          };
        }))
      );
      results.push(...batchResults);
    }

    return results;
  }

  _processResults(url, axeResults) {
    const violations = axeResults.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.length
    }));

    const passes = axeResults.passes.length;
    const totalTests = violations.length + passes + axeResults.incomplete.length;
    const complianceScore = totalTests > 0
      ? Math.round((passes / totalTests) * 100)
      : 0;

    return {
      url,
      timestamp: new Date().toISOString(),
      success: true,
      complianceScore,
      violations,
      violationCount: violations.length,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
      inapplicable: axeResults.inapplicable.length,
      summary: {
        critical: violations.filter(v => v.impact === 'critical').length,
        serious: violations.filter(v => v.impact === 'serious').length,
        moderate: violations.filter(v => v.impact === 'moderate').length,
        minor: violations.filter(v => v.impact === 'minor').length
      }
    };
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Puppeteer browser closed');
    }
  }
}

module.exports = new ScannerService();
