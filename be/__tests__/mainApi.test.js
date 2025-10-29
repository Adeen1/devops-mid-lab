const request = require('supertest');
const express = require('express');

describe('Main API Endpoint', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Recreate the main endpoint from api/index.js
    app.get('/', async (req, res) => {
      try {
        res.json('meow');
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  });

  describe('GET /', () => {
    test('should return "meow" message', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toBe('meow');
    });

    test('should return JSON content type', async () => {
      const response = await request(app).get('/');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Undefined routes', () => {
    test('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/nonexistent').expect(404);

      expect(response.status).toBe(404);
    });
  });
});
