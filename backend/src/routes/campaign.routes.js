/**
 * src/routes/campaign.routes.js
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  listCampaigns, getMyCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, donateToCampaign,
  listPendingCampaigns, reviewCampaign
} = require('../controllers/campaign.controller');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');

const campaignSchema = Joi.object({
  title:       Joi.string().max(120).required(),
  description: Joi.string().max(2000).allow(''),
  image:       Joi.string().uri().allow('', null),
  target:      Joi.number().min(1).required(),
  urgency:     Joi.string().valid('عالية', 'متوسطة').default('متوسطة'),
  isActive:    Joi.boolean().default(true),
});

// Update schema: allowlist of admin-editable fields only. With stripUnknown,
// protected/system fields (current, currentItems, createdBy, charityId,
// demoTransactions) are dropped so they can't be mass-assigned via PUT.
const updateCampaignSchema = Joi.object({
  title:        Joi.string().max(120),
  description:  Joi.string().max(2000).allow(''),
  image:        Joi.string().uri().allow('', null),
  category:     Joi.string().max(60),
  target:       Joi.number().min(1),
  targetItems:  Joi.number().min(0).allow(null),
  donationType: Joi.string().valid('money', 'items', 'both'),
  urgency:      Joi.string().valid('عالية', 'متوسطة'),
  isActive:     Joi.boolean(),
  status:       Joi.string().valid('pending_review', 'active', 'completed', 'cancelled', 'rejected'),
  endDate:      Joi.date().allow(null),
}).min(1);

const donateSchema = Joi.object({
  amount:        Joi.number().min(0.01).required(),
  paymentMethod: Joi.string().valid('card', 'apple_google', 'bank').default('card'),
  isDemoPayment: Joi.boolean().default(true),
});

const reviewSchema = Joi.object({
    action: Joi.string().valid('approve', 'reject').required(),
});

router.get('/pending',     protect, requireRole('admin'), listPendingCampaigns);
router.patch('/:id/review', protect, requireRole('admin'), validate(reviewSchema), reviewCampaign);

router.get('/my',          protect, getMyCampaigns);
router.get('/',            listCampaigns);
router.get('/:id',         getCampaign); // protect inside if needed, currently custom logic
router.post('/',           protect, validate(campaignSchema), createCampaign);
router.post('/:id/donate', protect, validate(donateSchema), donateToCampaign);
router.put('/:id',         protect, requireRole('admin'), validate(updateCampaignSchema), updateCampaign);
router.delete('/:id',      protect, requireRole('admin'), deleteCampaign);

module.exports = router;
