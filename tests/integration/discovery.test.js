const request = require('supertest');
const app = require('../../src/app');

describe('Discovery Endpoints', () => {
  describe('GET /api/discovery', () => {
    it('should return 400 without vertical parameter', async () => {
      const response = await request(app).get('/api/discovery');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 with invalid vertical', async () => {
      const response = await request(app).get('/api/discovery?vertical=invalid');

      expect(response.status).toBe(400);
    });

    it('should discover healthcare sites', async () => {
      const response = await request(app).get('/api/discovery?vertical=healthcare');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('vertical', 'healthcare');
      expect(response.body).toHaveProperty('sites');
      expect(Array.isArray(response.body.sites)).toBe(true);
      expect(response.body.sites.length).toBeGreaterThan(0);
    });

    it('should discover fintech sites', async () => {
      const response = await request(app).get('/api/discovery?vertical=fintech');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('vertical', 'fintech');
      expect(response.body.sites.length).toBeGreaterThan(0);
    });

    it('should respect maxResults parameter', async () => {
      const response = await request(app).get('/api/discovery?vertical=healthcare&maxResults=3');

      expect(response.status).toBe(200);
      expect(response.body.sites.length).toBeLessThanOrEqual(3);
    });

    it('should include vertical info', async () => {
      const response = await request(app).get('/api/discovery?vertical=healthcare');

      expect(response.body).toHaveProperty('verticalInfo');
      expect(response.body.verticalInfo).toHaveProperty('avgCompliance');
      expect(response.body.verticalInfo).toHaveProperty('mandate');
    });

    it('should return valid site objects', async () => {
      const response = await request(app).get('/api/discovery?vertical=healthcare&maxResults=1');

      expect(response.body.sites[0]).toHaveProperty('url');
      expect(response.body.sites[0]).toHaveProperty('title');
      expect(response.body.sites[0].url).toMatch(/^https?:\/\//);
    });
  });

  describe('GET /api/discovery/verticals', () => {
    it('should return list of available verticals', async () => {
      const response = await request(app).get('/api/discovery/verticals');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('verticals');
      expect(Array.isArray(response.body.verticals)).toBe(true);
      expect(response.body.verticals.length).toBeGreaterThan(0);
    });

    it('should include healthcare vertical', async () => {
      const response = await request(app).get('/api/discovery/verticals');

      const healthcare = response.body.verticals.find(v => v.id === 'healthcare');
      expect(healthcare).toBeDefined();
      expect(healthcare).toHaveProperty('avgCompliance');
      expect(healthcare).toHaveProperty('mandate');
    });

    it('should include fintech vertical', async () => {
      const response = await request(app).get('/api/discovery/verticals');

      const fintech = response.body.verticals.find(v => v.id === 'fintech');
      expect(fintech).toBeDefined();
      expect(fintech.avgCompliance).toBeLessThan(50); // Fintech has low compliance
    });
  });
});
