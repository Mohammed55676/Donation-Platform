const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// These proxies call paid LLM APIs with the server's key. The endpoints are
// intentionally public (site chatbot for visitors), so cap usage per IP to
// prevent anonymous credit-burning / abuse rather than locking them behind auth.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                  // AI calls per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many AI requests. Please slow down.' },
});

// Claude proxy (primary)
router.post('/chat', aiLimiter, aiController.chatWithClaude);

// Gemini proxy (fallback) — server-side to avoid browser CORS
router.post('/chat/gemini', aiLimiter, aiController.chatWithGemini);

module.exports = router;
