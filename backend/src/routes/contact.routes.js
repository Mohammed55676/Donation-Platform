const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { sendContactMessage } = require('../controllers/contact.controller');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

const contactSchema = Joi.object({
  user_name:  Joi.string().max(100).required(),
  user_email: Joi.string().email().max(160).required(),
  subject:    Joi.string().max(160).required(),
  message:    Joi.string().max(5000).required(),
});

// Public form that sends an email — cap per IP to prevent spam / SMTP abuse.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // messages per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many messages. Please try again later.' },
});

router.post('/', contactLimiter, validate(contactSchema), sendContactMessage);

module.exports = router;
