/**
 * src/routes/donation.routes.js
 *
 * GET    /api/donations              (public)
 * GET    /api/donations/:id          (public)
 * POST   /api/donations              (auth)
 * PUT    /api/donations/:id          (owner or admin)
 * PUT    /api/donations/:id/status   (admin)
 * DELETE /api/donations/:id          (owner or admin)
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  listDonations, getDonation, createDonation,
  updateDonation, updateDonationStatus, deleteDonation,
} = require('../controllers/donation.controller');
const { protect }      = require('../middleware/auth.middleware');
const { requireRole }  = require('../middleware/role.middleware');
const { validate }     = require('../middleware/validate.middleware');

const donationSchema = Joi.object({
  title:       Joi.string().max(120).required(),
  description: Joi.string().max(1000).required(),
  category:    Joi.string().valid('ملابس', 'طعام', 'أثاث', 'كتب', 'أخرى').required(),
  condition:   Joi.string().valid('جديد', 'جيد جداً', 'جيد', 'مستعمل').required(),
  location:    Joi.string().required(),
  urgency:     Joi.string().valid('عالية', 'متوسطة', 'منخفضة').default('متوسطة'),
  image:       Joi.string().allow('', null),
});

router.get('/',               listDonations);
router.get('/:id',            getDonation);
router.post('/',              protect, validate(donationSchema), createDonation);
router.put('/:id',            protect, updateDonation);
router.put('/:id/status',     protect, requireRole('admin'), updateDonationStatus);
router.delete('/:id',         protect, deleteDonation);

module.exports = router;
