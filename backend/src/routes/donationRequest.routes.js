/**
 * src/routes/donationRequest.routes.js
 *
 * POST /api/donation-requests               — Beneficiary creates request
 * GET  /api/donation-requests/my            — Beneficiary views their requests
 * GET  /api/donation-requests/admin         — Admin views all requests
 * PUT  /api/donation-requests/:id/review    — Admin reviews (accept/reject)
 * PUT  /api/donation-requests/:id/received  — Mark as received
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  createRequest,
  getMyRequests,
  adminListRequests,
  adminReviewRequest,
  markReceived,
} = require('../controllers/donationRequest.controller');

const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');

const createRequestSchema = Joi.object({
  donation_id: Joi.string().hex().length(24).required(),
});

const reviewSchema = Joi.object({
  action:              Joi.string().valid('accept', 'reject').required(),
  admin_notes:         Joi.string().allow('', null),
  emergency_exception: Joi.boolean(),
  emergency_reason:    Joi.string().allow('', null),
});

// Note: /my and /admin must come BEFORE /:id routes to avoid ID matching
router.get('/my',    protect, getMyRequests);
router.get('/admin', protect, requireRole('admin'), adminListRequests);

router.post('/',  protect, validate(createRequestSchema), createRequest);
router.put('/:id/review',   protect, requireRole('admin'), validate(reviewSchema), adminReviewRequest);
router.put('/:id/received', protect, markReceived);

module.exports = router;
