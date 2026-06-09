/**
 * src/routes/donationRequest.routes.js
 *
 * POST /api/donation-requests                  — Charity creates request
 * GET  /api/donation-requests/my               — Charity views their requests
 * GET  /api/donation-requests/for-donor        — Donor views requests on their donations (masked)
 * GET  /api/donation-requests/admin            — Admin oversight (read-only)
 * PUT  /api/donation-requests/:id/donor-review — Donor accepts or rejects
 * PUT  /api/donation-requests/:id/received     — Mark as received
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  createRequest,
  getMyRequests,
  getRequestsForMyDonations,
  adminListRequests,
  donorReviewRequest,
  markReceived,
} = require('../controllers/donationRequest.controller');

const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');

const createRequestSchema = Joi.object({
  donation_id: Joi.string().hex().length(24).required(),
});

const donorReviewSchema = Joi.object({
  action:      Joi.string().valid('accept', 'reject').required(),
  donor_notes: Joi.string().allow('', null),
});

// Note: named routes must come BEFORE /:id routes to avoid ID matching
router.get('/my',               protect, getMyRequests);
router.get('/for-donor', protect, getRequestsForMyDonations);
router.get('/admin',            protect, requireRole('admin'), adminListRequests);

router.post('/', protect, validate(createRequestSchema), createRequest);
router.put('/:id/donor-review', protect, validate(donorReviewSchema), donorReviewRequest);
router.put('/:id/received',     protect, markReceived);

module.exports = router;
