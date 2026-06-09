const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Claude proxy (primary)
router.post('/chat', aiController.chatWithClaude);

// Gemini proxy (fallback) — server-side to avoid browser CORS
router.post('/chat/gemini', aiController.chatWithGemini);

module.exports = router;
