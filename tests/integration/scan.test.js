const request = require('supertest');
const app = require('../../src/app');

describe('Scan API Endpoints', () => {
  describe('POST /api/scan', () => {
    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/api/scan')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/scan')
        .send({ url: 'not-a-valid-url' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid URL format', async () => {
      const response = await request(app)
        .post('/api/scan')
        .send({ url: 'https://www.example.com' });

      // Should either succeed or timeout, but not fail validation
      expect([200, 500, 504]).toContain(response.status);
    }, 65000);
  });

  describe('POST /api/scan/vertical', () => {
    it('should return 400 for missing vertical', async () => {
      const response = await request(app)
        .post('/api/scan/vertical')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid vertical', async () => {
      const response = await request(app)
        .post('/api/scan/vertical')
        .send({ vertical: 'invalid-vertical' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid vertical and maxSites', async () => {
      const response = await request(app)
        .post('/api/scan/vertical')
        .send({
          vertical: 'healthcare',
          maxSites: 2
        });

      // Should either succeed or timeout
      expect([200, 500, 504]).toContain(response.status);
    }, 120000);
  });

  describe('GET /api/scan/status', () => {
    it('should return scanner status', async () => {
      const response = await request(app).get('/api/scan/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('maxConcurrent');
    });

    it('should return numeric values for scan counts', async () => {
      const response = await request(app).get('/api/scan/status');

      expect(response.status).toBe(200);
      expect(typeof response.body.activeScans).toBe('number');
      expect(typeof response.body.maxConcurrent).toBe('number');
    });
  });
});
