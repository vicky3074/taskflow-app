const request = require('supertest');

// Mock app for testing
const express = require('express');
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'taskflow-app'
  });
});

describe('Health Check', () => {
  test('GET /health should return 200 OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.service).toBe('taskflow-app');
    expect(response.body.timestamp).toBeDefined();
  });
});