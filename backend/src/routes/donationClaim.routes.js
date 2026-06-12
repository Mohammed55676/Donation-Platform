const express = require('express');
const Joi = require('joi');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createClaim, getClaimsForDonor, reviewClaim } = require('../controllers/donationClaim.controller');

const createClaimSchema = Joi.object({
  donation_id: Joi.string().required(),
});

const reviewClaimSchema = Joi.object({
  action: Joi.string().valid('accept', 'reject').required(),
});

router.post('/', protect, validate(createClaimSchema), createClaim);
router.get('/for-donor', protect, getClaimsForDonor);
router.put('/:id/donor-review', protect, validate(reviewClaimSchema), reviewClaim);

module.exports = router;
