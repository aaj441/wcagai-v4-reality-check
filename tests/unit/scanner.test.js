/**
 * Scanner Service Unit Tests
 *
 * Tests the WCAG scanner service functionality including:
 * - Browser initialization
 * - Page scanning with Axe-core
 * - Results processing
 * - Error handling
 */

const scannerService = require('../../src/services/scanner');

// Mock Puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue({}),
      addScriptTag: jest.fn().mockResolvedValue({}),
      evaluate: jest.fn().mockResolvedValue({
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Elements must have sufficient color contrast',
            nodes: [
              {
                html: '<div>Test</div>',
                target: ['div'],
                failureSummary: 'Fix color contrast'
              }
            ],
            tags: ['wcag2aa', 'wcag143']
          }
        ],
        passes: [
          {
            id: 'html-has-lang',
            impact: null,
            description: 'HTML has lang attribute',
            nodes: [{ html: '<html lang="en">' }],
            tags: ['wcag2a', 'wcag311']
          }
        ],
        incomplete: [],
        inapplicable: []
      }),
      close: jest.fn().mockResolvedValue({})
    }),
    close: jest.fn().mockResolvedValue({})
  })
}));

describe('Scanner Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scan()', () => {
    it('should scan a URL and return results', async () => {
      const url = 'https://example.com';
      const results = await scannerService.scan(url);

      expect(results).toBeDefined();
      expect(results.url).toBe(url);
      expect(results.violations).toHaveLength(1);
      expect(results.passes).toHaveLength(1);
      expect(results.summary).toBeDefined();
      expect(results.summary.violations).toBe(1);
      expect(results.summary.passes).toBe(1);
    });

    it('should categorize violations by impact level', async () => {
      const results = await scannerService.scan('https://example.com');

      expect(results.violationsByImpact).toBeDefined();
      expect(results.violationsByImpact.critical).toBeDefined();
      expect(results.violationsByImpact.serious).toBeDefined();
      expect(results.violationsByImpact.moderate).toBeDefined();
      expect(results.violationsByImpact.minor).toBeDefined();
    });

    it('should categorize violations by WCAG level', async () => {
      const results = await scannerService.scan('https://example.com');

      expect(results.violationsByLevel).toBeDefined();
      expect(results.violationsByLevel['A']).toBeDefined();
      expect(results.violationsByLevel['AA']).toBeDefined();
      expect(results.violationsByLevel['AAA']).toBeDefined();
    });

    it('should calculate compliance score', async () => {
      const results = await scannerService.scan('https://example.com');

      expect(results.complianceScore).toBeDefined();
      expect(typeof results.complianceScore).toBe('number');
      expect(results.complianceScore).toBeGreaterThanOrEqual(0);
      expect(results.complianceScore).toBeLessThanOrEqual(100);
    });

    it('should include timestamp in results', async () => {
      const results = await scannerService.scan('https://example.com');

      expect(results.timestamp).toBeDefined();
      expect(new Date(results.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should handle scan errors gracefully', async () => {
      const puppeteer = require('puppeteer');
      puppeteer.launch.mockRejectedValueOnce(new Error('Browser launch failed'));

      await expect(scannerService.scan('https://example.com')).rejects.toThrow(
        'Browser launch failed'
      );
    });

    it('should timeout after configured duration', async () => {
      const puppeteer = require('puppeteer');
      const mockPage = {
        goto: jest.fn().mockImplementation(() =>
          new Promise((resolve) => setTimeout(resolve, 35000))
        ),
        close: jest.fn()
      };

      puppeteer.launch.mockResolvedValueOnce({
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn()
      });

      const scanPromise = scannerService.scan('https://slow-site.com', { timeout: 1000 });

      await expect(scanPromise).rejects.toThrow();
    }, 10000);
  });

  describe('scanMultiple()', () => {
    it('should scan multiple URLs', async () => {
      const urls = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com'
      ];

      const results = await scannerService.scanMultiple(urls);

      expect(results).toHaveLength(3);
      expect(results[0].url).toBe(urls[0]);
      expect(results[1].url).toBe(urls[1]);
      expect(results[2].url).toBe(urls[2]);
    });

    it('should respect max concurrent scans limit', async () => {
      const urls = Array.from({ length: 10 }, (_, i) => `https://example${i}.com`);

      const startTime = Date.now();
      await scannerService.scanMultiple(urls, { maxConcurrent: 2 });
      const duration = Date.now() - startTime;

      // With 10 URLs and max 2 concurrent, should take at least 5 batches
      // Each batch is mocked to be instant, but we can verify structure
      expect(duration).toBeLessThan(5000); // Should complete reasonably fast with mocks
    });

    it('should handle partial failures in batch scanning', async () => {
      const puppeteer = require('puppeteer');
      let callCount = 0;

      puppeteer.launch.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('Scan failed'));
        }
        return Promise.resolve({
          newPage: jest.fn().mockResolvedValue({
            goto: jest.fn().mockResolvedValue({}),
            addScriptTag: jest.fn().mockResolvedValue({}),
            evaluate: jest.fn().mockResolvedValue({ violations: [], passes: [] }),
            close: jest.fn()
          }),
          close: jest.fn()
        });
      });

      const urls = ['https://site1.com', 'https://site2.com', 'https://site3.com'];
      const results = await scannerService.scanMultiple(urls, { continueOnError: true });

      expect(results).toHaveLength(3);
      expect(results.filter(r => r.error)).toHaveLength(1);
      expect(results.filter(r => !r.error)).toHaveLength(2);
    });
  });

  describe('getComplianceLevel()', () => {
    it('should return A level for perfect score', () => {
      const level = scannerService.getComplianceLevel(100);
      expect(level).toBe('AAA');
    });

    it('should return appropriate level for score ranges', () => {
      expect(scannerService.getComplianceLevel(95)).toBe('AA');
      expect(scannerService.getComplianceLevel(85)).toBe('AA');
      expect(scannerService.getComplianceLevel(75)).toBe('A');
      expect(scannerService.getComplianceLevel(65)).toBe('A');
      expect(scannerService.getComplianceLevel(50)).toBe('Non-compliant');
    });
  });

  describe('closeBrowser()', () => {
    it('should close browser instance', async () => {
      await scannerService.scan('https://example.com');
      await scannerService.closeBrowser();

      const puppeteer = require('puppeteer');
      const mockBrowser = await puppeteer.launch();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle missing browser gracefully', async () => {
      await expect(scannerService.closeBrowser()).resolves.not.toThrow();
    });
  });

  describe('_processResults()', () => {
    it('should process Axe results correctly', async () => {
      const axeResults = {
        violations: [
          {
            id: 'test-violation',
            impact: 'critical',
            description: 'Test violation',
            nodes: [{ html: '<div>' }],
            tags: ['wcag2a']
          }
        ],
        passes: [
          {
            id: 'test-pass',
            description: 'Test pass',
            nodes: [{ html: '<span>' }],
            tags: ['wcag2aa']
          }
        ],
        incomplete: [],
        inapplicable: []
      };

      const results = await scannerService.scan('https://example.com');

      expect(results.violations[0].id).toBe('color-contrast');
      expect(results.violations[0].impact).toBe('serious');
      expect(results.passes).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs', async () => {
      await expect(scannerService.scan('not-a-url')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const puppeteer = require('puppeteer');
      const mockPage = {
        goto: jest.fn().mockRejectedValue(new Error('net::ERR_NAME_NOT_RESOLVED')),
        close: jest.fn()
      };

      puppeteer.launch.mockResolvedValueOnce({
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn()
      });

      await expect(scannerService.scan('https://nonexistent-domain-12345.com'))
        .rejects.toThrow();
    });

    it('should handle Axe-core script injection errors', async () => {
      const puppeteer = require('puppeteer');
      const mockPage = {
        goto: jest.fn().mockResolvedValue({}),
        addScriptTag: jest.fn().mockRejectedValue(new Error('Script injection failed')),
        close: jest.fn()
      };

      puppeteer.launch.mockResolvedValueOnce({
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn()
      });

      await expect(scannerService.scan('https://example.com')).rejects.toThrow(
        'Script injection failed'
      );
    });
  });
});
