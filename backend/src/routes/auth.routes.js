/**
 * src/routes/auth.routes.js
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout      (protected)
 * GET  /api/auth/me          (protected)
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const { register, login, logout, getMe, googleLogin, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect }  = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// Joi schemas
const registerSchema = Joi.object({
  name:      Joi.string().min(3).max(80).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).required(),
  user_type: Joi.string().valid('beneficiary').optional(),
  role:      Joi.string().valid('user', 'volunteer').default('user'),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/google',   googleLogin);
router.post('/logout',   protect,                  logout);
router.get('/me',        protect,                  getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

module.exports = router;
