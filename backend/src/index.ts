import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Security Configuration ─────────────────
// Generate JWT secrets if not provided (for development/initial setup)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  JWT_SECRET not set, using generated value. Set JWT_SECRET env var for production.');
}

if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  JWT_REFRESH_SECRET not set, using generated value. Set JWT_REFRESH_SECRET env var for production.');
}

// Trust proxy - important for Render and other deployment platforms
app.set('trust proxy', 1);

// ─── CORS ───────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// ─── Additional CORS Headers ────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ─── Security ───────────────────────────────
// Note: helmet disabled for ngrok CORS compatibility in dev
// app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});
app.use(limiter);

// ─── Parsing ────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Routes ─────────────────────────────────
app.use('/api', router);

// ─── Health check ───────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handler (must be last) ───────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🌸 Malamia API running on http://localhost:${PORT}`);
});

export default app;
