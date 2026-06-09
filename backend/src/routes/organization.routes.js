/**
 * src/routes/organization.routes.js
 *
 * GET    /api/organizations              (public)
 * GET    /api/organizations/:id          (public)
 * POST   /api/organizations              (admin)
 * PUT    /api/organizations/:id          (admin)
 * DELETE /api/organizations/:id          (admin)
 * POST   /api/organizations/:id/register (auth)
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  registerAndDonate,
} = require('../controllers/organization.controller');

const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');

const orgSchema = Joi.object({
  name:         Joi.string().max(120).required(),
  description:  Joi.string().max(2000).required(),
  image:        Joi.string().uri().allow('', null),
  location:     Joi.string().required(),
  contactEmail: Joi.string().email().allow('', null),
  contactPhone: Joi.string().allow('', null),
  isActive:     Joi.boolean().default(true),
});

const registerSchema = Joi.object({
  amount:      Joi.number().min(1).required(),
  cardNumber:  Joi.string().length(16).pattern(/^\d+$/).required(),
  expiry:      Joi.string().pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).required(),
  cvv:         Joi.string().pattern(/^\d{3,4}$/).required(),
  nameOnCard:  Joi.string().required(),
  phone:       Joi.string().required(),
  nationality: Joi.string().required(),
  message:     Joi.string().allow('', null),
});

router.get('/',        listOrganizations);
router.get('/:id',     getOrganization);
router.post('/',       protect, requireRole('admin'), validate(orgSchema), createOrganization);
router.put('/:id',     protect, requireRole('admin'), updateOrganization);
router.delete('/:id',  protect, requireRole('admin'), deleteOrganization);
router.post('/:id/register', protect, validate(registerSchema), registerAndDonate);

module.exports = router;
