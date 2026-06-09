/**
 * src/middleware/error.middleware.js
 * Centralized error handler — must be the LAST middleware registered in server.js.
 *
 * Handles:
 *  - Mongoose validation errors        → 400
 *  - Mongoose duplicate key errors     → 409
 *  - Mongoose cast errors (bad IDs)    → 400
 *  - JWT errors                        → 401
 *  - Custom AppError instances         → their own statusCode
 *  - Everything else                   → 500
 */
const { sendError } = require('../utils/apiResponse');

// Simple custom error class for intentional operational errors
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log all errors in development
  if (isDev) {
    console.error('[ERROR]', err);
  }

  // ── Mongoose: Validation error ──────────────────────────────────
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Validation failed.', 400, details);
  }

  // ── Mongoose: Duplicate key ─────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `${field} already exists.`, 409);
  }

  // ── Mongoose: Bad ObjectId ──────────────────────────────────────
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // ── JWT errors ──────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired.', 401);
  }

  // ── Intentional AppError ────────────────────────────────────────
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode);
  }

  // ── Generic 500 ─────────────────────────────────────────────────
  return sendError(
    res,
    isDev ? err.message : 'An unexpected error occurred. Please try again.',
    err.statusCode || 500
  );
}

module.exports = { errorHandler, AppError };
