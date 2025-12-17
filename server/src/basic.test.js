const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.status(200).send('Hello World'));

describe('Basic Server Test', () => {
    it('GET / should return 200', async () => {
        // This mocks the app without running the full server
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
    });

    it('Simple math test', () => {
        expect(1 + 1).toBe(2);
    });
});
