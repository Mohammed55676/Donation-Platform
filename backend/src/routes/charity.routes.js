/**
 * src/routes/charity.routes.js
 *
 * POST   /api/charity/profile              (charity user)
 * GET    /api/charity/verified              (authenticated)
 * POST   /api/charity/join/:charityId       (beneficiary)
 * GET    /api/charity/my-status             (beneficiary)
 * GET    /api/charity/beneficiaries         (verified charity)
 * PUT    /api/charity/beneficiaries/:id     (verified charity)
 * GET    /api/charity/admin/list            (admin)
 * PUT    /api/charity/admin/:id/review      (admin)
 */
const express = require('express');
const router  = express.Router();

const {
  submitCharityProfile,
  listVerifiedCharities,
  beneficiaryJoinCharity,
  getMyCharityStatus,
  charityListBeneficiaries,
  charityReviewBeneficiary,
  adminListCharities,
  adminReviewCharity,
} = require('../controllers/charity.controller');

const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Charity profile
router.post('/profile',              protect, submitCharityProfile);

// Public-ish — list verified charities
router.get('/verified',              protect, listVerifiedCharities);

// Beneficiary joins charity
router.post('/join/:charityId',      protect, beneficiaryJoinCharity);
router.get('/my-status',             protect, getMyCharityStatus);

// Charity manages beneficiaries
router.get('/beneficiaries',         protect, charityListBeneficiaries);
router.put('/beneficiaries/:id',     protect, charityReviewBeneficiary);

// Admin manages charities
router.get('/admin/list',            protect, requireRole('admin'), adminListCharities);
router.put('/admin/:id/review',      protect, requireRole('admin'), adminReviewCharity);

module.exports = router;
