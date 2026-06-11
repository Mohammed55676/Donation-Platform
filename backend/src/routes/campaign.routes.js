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
  current:     Joi.number().min(0).default(0),
  urgency:     Joi.string().valid('عالية', 'متوسطة').default('متوسطة'),
  isActive:    Joi.boolean().default(true),
});

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
router.put('/:id',         protect, requireRole('admin'), updateCampaign);
router.delete('/:id',      protect, requireRole('admin'), deleteCampaign);

module.exports = router;
