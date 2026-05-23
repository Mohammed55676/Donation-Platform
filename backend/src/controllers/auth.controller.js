/**
 * src/controllers/auth.controller.js
 *
 * POST /api/auth/register   — Register a new user
 * POST /api/auth/login      — Login, receive JWT
 * POST /api/auth/logout     — Logout hint (client clears token)
 * GET  /api/auth/me         — Get current authenticated user
 */
const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

/** Sign a JWT for the given user id */
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── POST /api/auth/register ──────────────────────────────────────────
/**
 * @route   POST /api/auth/register
 * @access  Public
 * @body    { name, email, password }
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered.', 409);

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    return sendSuccess(res, { user, token }, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────────
/**
 * @route   POST /api/auth/login
 * @access  Public
 * @body    { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new AppError('Invalid email or password.', 401);

    const valid = await user.comparePassword(password);
    if (!valid) throw new AppError('Invalid email or password.', 401);

    if (user.status === 'banned') throw new AppError('Your account has been suspended.', 403);

    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    return sendSuccess(res, { user, token }, 'Login successful.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/logout ────────────────────────────────────────────
/**
 * @route   POST /api/auth/logout
 * @access  Private
 * Stateless JWT — client must discard the token.
 * For server-side invalidation, maintain a token blacklist (Redis recommended).
 */
async function logout(req, res) {
  return sendSuccess(res, null, 'Logged out successfully. Please discard your token.');
}

// ── GET /api/auth/me ─────────────────────────────────────────────────
/**
 * @route   GET /api/auth/me
 * @access  Private
 */
async function getMe(req, res) {
  return sendSuccess(res, req.user);
}

// ── POST /api/auth/google ────────────────────────────────────────────
/**
 * @route   POST /api/auth/google
 * @access  Public
 * @body    { email, name, avatar }
 * Simplified Google Login: In production, verify Firebase/Google ID token!
 */
async function googleLogin(req, res, next) {
  try {
    const { email, name, avatar } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user if they don't exist
      // Use a truly random password they'll never use for login
      const randomPass = Math.random().toString(36).slice(-10) + Date.now();
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        password: randomPass,
        avatar: avatar || null
      });
    }

    if (user.status === 'banned') throw new AppError('Your account has been suspended.', 403);

    const token = signToken(user._id);
    return sendSuccess(res, { user, token }, 'Google login successful.');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe, googleLogin };
