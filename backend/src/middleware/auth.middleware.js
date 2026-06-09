/**
 * src/middleware/auth.middleware.js
 * Verifies JWT access token from the Authorization header.
 * Attaches the decoded user payload to req.user.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware: require a valid JWT.
 * Usage: router.get('/protected', protect, handler)
 */
async function protect(req, res, next) {
  try {
    // Support both "Bearer <token>" header and cookie (cookie optional)
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return sendError(res, 'Server JWT secret is not configured.', 500);
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Attach live user to request (re-query so we see the latest status/role)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'User not found. Token is invalid.', 401);
    }
    if (user.status === 'banned') {
      return sendError(res, 'Your account has been suspended.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid token.', 401);
  }
}

module.exports = { protect };
