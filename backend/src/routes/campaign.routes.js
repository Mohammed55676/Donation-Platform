/**
 * src/routes/campaign.routes.js
 *
 * GET    /api/campaigns       (public)
 * GET    /api/campaigns/:id   (public)
 * POST   /api/campaigns       (admin)
 * PUT    /api/campaigns/:id   (admin)
 * DELETE /api/campaigns/:id   (admin)
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign,
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

router.get('/',        listCampaigns);
router.get('/:id',     getCampaign);
router.post('/',       protect, requireRole('admin'), validate(campaignSchema), createCampaign);
router.put('/:id',     protect, requireRole('admin'), updateCampaign);
router.delete('/:id',  protect, requireRole('admin'), deleteCampaign);

module.exports = router;
