const request = require('supertest');
const app = require('../../src/app');

describe('Health Check Endpoint', () => {
  describe('GET /health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });

    it('should include version info', async () => {
      const response = await request(app).get('/health');
      const packageJson = require('../../package.json');

      expect(response.body.version).toBe(packageJson.version);
    });

    it('should include environment info', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('environment');
      expect(response.body.environment).toBeDefined();
    });

    it('should check Redis connection status', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('redis');
      expect(['connected', 'disconnected', 'error']).toContain(response.body.redis);
    });

    it('should check SerpAPI configuration', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('serpapi');
      expect(['configured', 'missing']).toContain(response.body.serpapi);
    });

    it('should include memory usage info', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
    });
  });
});
