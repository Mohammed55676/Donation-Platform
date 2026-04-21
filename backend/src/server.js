/**
 * src/server.js
 * Express application entry point.
 *
 * Responsibilities:
 *  1. Load environment variables
 *  2. Connect to MongoDB
 *  3. Configure middleware stack (security, logging, parsing)
 *  4. Mount API routes
 *  5. Centralized error handling
 *  6. Start HTTP server
 */
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const connectDB           = require('./config/db');
const apiRouter           = require('./routes/index');
const { errorHandler }    = require('./middleware/error.middleware');
const { sendError }       = require('./utils/apiResponse');

// ── App init ─────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ───────────────────────────────────────────────
connectDB();

// ── Security headers (helmet) ────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Request logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Body parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Global rate limiter ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// ── Stricter limiter on auth endpoints ───────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many auth attempts. Please wait 15 minutes.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── API routes ───────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── 404 handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// ── Centralized error handler (MUST be last) ─────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Server] API base: http://localhost:${PORT}/api`);
  console.log(`[Server] Health:   http://localhost:${PORT}/api/health`);
});

module.exports = app; // for testing
