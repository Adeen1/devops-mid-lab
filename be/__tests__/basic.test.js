const request = require('supertest');
const express = require('express');

// Simple test to verify Jest is working
describe('Basic Jest Setup', () => {
  test('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should test string matching', () => {
    expect('Hello Jest').toMatch(/Jest/);
  });

  test('should test array contains', () => {
    const fruits = ['apple', 'banana', 'cherry'];
    expect(fruits).toContain('banana');
  });
});

// Basic API test example (you can expand this)
describe('API Basic Test', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Simple test route
    app.get('/test', (req, res) => {
      res.json({ message: 'Test endpoint working' });
    });
  });

  test('should respond to test endpoint', async () => {
    const response = await request(app).get('/test').expect(200);

    expect(response.body.message).toBe('Test endpoint working');
  });
});
