/**
 * src/routes/conversation.routes.js
 */
const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', conversationController.getConversations);
router.get('/requests', conversationController.getRequests);
router.post('/request', conversationController.createRequest);

router.put('/:id/accept', conversationController.acceptConversation);
router.put('/:id/reject', conversationController.rejectConversation);
router.put('/:id/block', conversationController.blockConversation);

router.get('/:id/messages', conversationController.getMessages);
router.post('/:id/messages', conversationController.sendMessage);

router.put('/:id/agreement', conversationController.confirmAgreement);
router.put('/:id/delivery', conversationController.confirmDelivery);

module.exports = router;
