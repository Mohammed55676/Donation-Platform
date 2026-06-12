/**
 * src/routes/auth.routes.js
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  register, login, logout, getMe, googleLogin,
  forgotPassword, validateResetOtp, resetPassword, verifyOtp, resendOtp,
} = require('../controllers/auth.controller');
const { protect }  = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// Strong password rule — kept in sync with User.model.js validator and the frontend
// isValidPassword(): at least 8 chars, one uppercase letter, one digit, one special character.
const passwordRule = Joi.string()
  .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_]).{8,}$/)
  .required()
  .messages({
    'string.pattern.base':
      'Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.',
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.',
  });

const registerSchema = Joi.object({
  name:      Joi.string().min(3).max(80).required(),
  email:     Joi.string().email().required(),
  password:  passwordRule,
  user_type: Joi.string().valid('donor', 'charity').default('donor'),
  phone:     Joi.string().allow('', null).optional(),
  location:  Joi.string().allow('', null).optional(),
  charityCategory: Joi.string().allow('', null).optional(),
  charityDescription: Joi.string().allow('', null).optional(),
  charityRegistrationNumber: Joi.string().allow('', null).optional(),
  charityLicenseDocument: Joi.string().allow('', null).optional(),
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
  password: passwordRule,
});

router.post('/register',        validate(registerSchema),       register);
router.post('/login',           validate(loginSchema),          login);
router.post('/verify-otp',      validate(otpSchema),            verifyOtp);
router.post('/resend-otp',      validate(resendOtpSchema),      resendOtp);
router.post('/google',                                          googleLogin);
router.post('/logout',          protect,                        logout);
router.get('/me',               protect,                        getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/validate-reset-otp', validate(otpSchema), validateResetOtp);
router.post('/reset-password',  validate(resetPasswordSchema),  resetPassword);

module.exports = router;
