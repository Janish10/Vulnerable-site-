const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Internal Microservice API',
    version: '3.2.1',
    endpoints: ['/health', '/api/v1/users', '/api/v1/orders'],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/api/v1/users', (req, res) => {
  res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
});

app.get('/api/v1/orders', (req, res) => {
  res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
});

app.get('/api/v1/internal/metrics', (req, res) => {
  res.json({
    requests_total: 154823,
    errors_total: 42,
    avg_latency_ms: 23.4,
    active_connections: 18,
  });
});

app.get('/swagger.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'Internal Service', version: '3.2.1' },
    paths: {
      '/api/v1/users': { get: { summary: 'List users', security: [{ bearerAuth: [] }] } },
      '/api/v1/orders': { get: { summary: 'List orders', security: [{ bearerAuth: [] }] } },
    },
  });
});

app.listen(3011, '0.0.0.0', () => {
  console.log('api-target listening on port 3011');
});
