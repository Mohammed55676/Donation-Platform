/**
 * src/routes/auth.routes.js
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  register, login, logout, getMe, googleLogin,
  forgotPassword, resetPassword, verifyOtp, resendOtp,
} = require('../controllers/auth.controller');
const { protect }  = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const registerSchema = Joi.object({
  name:      Joi.string().min(3).max(80).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).required(),
  user_type: Joi.string().valid('donor', 'charity').default('donor'),
  phone:     Joi.string().allow('', null).optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp:   Joi.string().length(6).required(),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email:    Joi.string().email().required(),
  otp:      Joi.string().length(6).required(),
  password: Joi.string().min(6).required(),
});

router.post('/register',        validate(registerSchema),       register);
router.post('/login',           validate(loginSchema),          login);
router.post('/verify-otp',      validate(otpSchema),            verifyOtp);
router.post('/resend-otp',      validate(resendOtpSchema),      resendOtp);
router.post('/google',                                          googleLogin);
router.post('/logout',          protect,                        logout);
router.get('/me',               protect,                        getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),  resetPassword);

module.exports = router;
