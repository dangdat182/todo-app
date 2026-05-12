require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust nginx proxy (required for rate-limit X-Forwarded-For handling)
app.set('trust proxy', 1);

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
// NOTE: do NOT add express.json() here — it consumes the request body stream,
// which prevents http-proxy-middleware from forwarding POST bodies to upstream services.

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Auth limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// JWT verification middleware (optional - for protected routes)
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`bl_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-email'] = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date() });
});

// ── Auth routes (no auth required) ──────────────────────────────
app.use('/api/auth', authLimiter, createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  on: {
    error: (err, req, res) => {
      res.status(503).json({ error: 'Auth service unavailable' });
    }
  }
}));

// ── Todo shared routes (no auth required) ───────────────────────
app.use('/api/todos/shared', createProxyMiddleware({
  target: process.env.TODO_SERVICE_URL || 'http://todo-service:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/todos': '/todos' },
  on: {
    error: (err, req, res) => {
      res.status(503).json({ error: 'Todo service unavailable' });
    }
  }
}));

// ── Todo routes (auth required) ─────────────────────────────────
app.use('/api/todos', verifyToken, createProxyMiddleware({
  target: process.env.TODO_SERVICE_URL || 'http://todo-service:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/todos': '/todos' },
  on: {
    error: (err, req, res) => {
      res.status(503).json({ error: 'Todo service unavailable' });
    }
  }
}));

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
