/**
 * src/routes/donationRequest.routes.js
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
    createRequest,
    getActiveRequests,
    getMyRequests,
    updateRequest,
    cancelRequest,
    listPendingRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/donationRequest.controller');

const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');

const requestSchema = Joi.object({
    title: Joi.string().max(120).required(),
    description: Joi.string().max(2000).required(),
    category: Joi.string().required(),
    quantityNeeded: Joi.number().min(1).required(),
    urgency: Joi.string().valid('عالية', 'متوسطة', 'منخفضة').default('متوسطة'),
    location: Joi.string().required()
});

const rejectSchema = Joi.object({
    adminNote: Joi.string().allow('', null)
});

// Public
router.get('/', getActiveRequests);

// Charity
router.get('/my', protect, getMyRequests);
router.post('/', protect, validate(requestSchema), createRequest);
router.put('/:id', protect, validate(requestSchema), updateRequest);
router.patch('/:id/cancel', protect, cancelRequest);

// Admin
router.get('/admin/pending', protect, requireRole('admin'), listPendingRequests);
router.patch('/admin/:id/approve', protect, requireRole('admin'), approveRequest);
router.patch('/admin/:id/reject', protect, requireRole('admin'), validate(rejectSchema), rejectRequest);

module.exports = router;
