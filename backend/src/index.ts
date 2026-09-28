import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { auditLog } from './middleware/audit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import orgRoutes from './routes/orgs';
import assetRoutes from './routes/assets';
import scanRoutes from './routes/scans';
import findingRoutes from './routes/findings';
import technologyRoutes from './routes/technologies';
import cveRoutes from './routes/cves';
import apiTokenRoutes from './routes/apiTokens';
import adminRoutes from './routes/admin';

const app = express();

app.set('trust proxy', true);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// REAL VULN: Rate limit bypassable via X-Forwarded-For header spoofing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', limiter);

app.use(auditLog);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/findings', findingRoutes);
app.use('/api/technologies', technologyRoutes);
app.use('/api/cves', cveRoutes);
app.use('/api/tokens', apiTokenRoutes);
app.use('/api/admin', adminRoutes);

// OpenAPI docs endpoint (FP-19: contains example Bearer tokens)
app.get('/api/docs', (_req, res) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'Soltrisk ASM API',
      version: '1.0.0',
      description: 'Attack Surface Management API for security monitoring and vulnerability tracking.',
    },
    servers: [
      { url: 'https://api.krizznaa.tech', description: 'Production' },
    ],
    security: [
      { BearerAuth: [] },
      { ApiKeyAuth: [] },
    ],
    paths: {
      '/api/auth/login': {
        post: {
          summary: 'Authenticate user',
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } },
                example: { email: 'user@example.com', password: 'your-password' },
              },
            },
          },
        },
      },
      '/api/assets': {
        get: {
          summary: 'List assets',
          description: 'Returns all assets for the authenticated organization.\n\nExample request:\n```\ncurl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsIm9yZ19pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSJ9.example_signature" https://api.krizznaa.tech/api/assets\n```',
          parameters: [
            { name: 'api_key', in: 'query', description: 'Alternative: pass API key as query param. Example: `slt_ci_a1b2c3d4e5f6`', schema: { type: 'string' } },
          ],
        },
      },
      '/api/findings': {
        get: {
          summary: 'List findings',
          description: 'Retrieve security findings.\n\nExample with API token:\n```bash\nexport API_KEY="slt_example_token_do_not_use_in_production_abc123"\ncurl -H "Authorization: Bearer $API_KEY" https://api.krizznaa.tech/api/findings\n```',
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token. Obtain via POST /api/auth/login.\n\nExample token (DO NOT USE IN PRODUCTION):\n`eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.example`',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key prefixed with `slt_`. Example: `slt_ci_a1b2c3d4e5f6`',
        },
      },
    },
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'soltrisk-backend', version: '1.0.0' });
});

app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${config.port}`);
});

export default app;
