const { getJson } = require('serpapi');
const config = require('../../config');
const logger = require('../utils/logger');
const cacheService = require('./cache');
const { VERTICAL_BENCHMARKS } = require('../utils/constants');

class DiscoveryService {
  constructor() {
    this.apiKey = config.serpapi.key;
  }

  async discover(vertical, maxResults = 20) {
    const cacheKey = `discovery:${vertical}:${maxResults}`;

    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for ${vertical} discovery`);
      return JSON.parse(cached);
    }

    // Get fallback data for known verticals
    const fallbackData = this._getFallbackData(vertical, maxResults);

    // If no API key, use fallback
    if (!this.apiKey) {
      logger.warn('No SerpAPI key configured, using fallback data');
      await cacheService.set(cacheKey, JSON.stringify(fallbackData), config.redis.ttl);
      return fallbackData;
    }

    try {
      // Search using SerpAPI
      const searchQuery = this._buildSearchQuery(vertical);
      logger.info(`Searching SerpAPI for: ${searchQuery}`);

      const response = await getJson({
        api_key: this.apiKey,
        engine: 'google',
        q: searchQuery,
        num: Math.min(maxResults, 20) // SerpAPI max is typically 20
      });

      if (!response.organic_results || response.organic_results.length === 0) {
        logger.warn(`No SerpAPI results for ${vertical}, using fallback`);
        await cacheService.set(cacheKey, JSON.stringify(fallbackData), config.redis.ttl);
        return fallbackData;
      }

      const sites = response.organic_results
        .slice(0, maxResults)
        .map(result => ({
          url: result.link,
          title: result.title,
          snippet: result.snippet || ''
        }));

      // Cache results
      await cacheService.set(cacheKey, JSON.stringify(sites), config.redis.ttl);

      logger.info(`Discovered ${sites.length} sites for ${vertical} via SerpAPI`);
      return sites;

    } catch (error) {
      logger.error(`SerpAPI error for ${vertical}:`, error.message);

      // Use fallback on error
      await cacheService.set(cacheKey, JSON.stringify(fallbackData), 3600); // Cache fallback for 1 hour
      return fallbackData;
    }
  }

  _getFallbackData(vertical, maxResults) {
    const benchmark = VERTICAL_BENCHMARKS[vertical];
    if (!benchmark || !benchmark.sites) {
      return [];
    }

    return benchmark.sites.slice(0, maxResults).map(site => ({
      url: site.url,
      title: site.title,
      snippet: `${site.title} - ${site.monthlyVisits.toLocaleString()} monthly visits`
    }));
  }

  _buildSearchQuery(vertical) {
    const queries = {
      healthcare: 'top healthcare websites medical information patient resources',
      fintech: 'top fintech companies financial services banking platforms',
      ecommerce: 'top ecommerce websites online shopping platforms',
      education: 'top educational institutions universities online learning'
    };
    return queries[vertical] || `top ${vertical} websites`;
  }

  getVerticalInfo(vertical) {
    const benchmark = VERTICAL_BENCHMARKS[vertical];
    if (!benchmark) {
      return null;
    }

    return {
      vertical,
      avgCompliance: benchmark.avgCompliance,
      mandate: benchmark.mandate,
      sampleSize: benchmark.sites.length
    };
  }
}

module.exports = new DiscoveryService();
