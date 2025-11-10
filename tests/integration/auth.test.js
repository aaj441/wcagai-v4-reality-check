const request = require('supertest');
const app = require('../../src/app');
const config = require('../../config');

describe('Authentication Middleware', () => {
  const originalApiKey = config.apiKey;
  const originalEnv = config.env;

  afterAll(() => {
    // Restore original values
    config.apiKey = originalApiKey;
    config.env = originalEnv;
  });

  describe('Development mode', () => {
    beforeAll(() => {
      config.env = 'development';
      config.apiKey = 'test-api-key';
    });

    it('should allow access without API key in development', async () => {
      const response = await request(app)
        .get('/api/discovery/verticals');

      expect(response.status).toBe(200);
    });
  });

  describe('API Key validation', () => {
    it('should expose API docs without authentication', async () => {
      const response = await request(app).get('/api-docs/');

      // Swagger UI returns HTML
      expect([200, 301, 302]).toContain(response.status);
    });

    it('should allow health check without authentication', async () => {
      const response = await request(app).get('/health');

      expect([200, 503]).toContain(response.status);
    });
  });

  describe('Rate limiting', () => {
    it('should apply rate limiting to API endpoints', async () => {
      // Make multiple requests quickly
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/api/discovery/verticals')
      );

      const responses = await Promise.all(requests);

      // All should succeed (rate limit is 100/15min by default)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Check for rate limit headers
      expect(responses[0].headers).toHaveProperty('x-ratelimit-limit');
    });
  });
});
