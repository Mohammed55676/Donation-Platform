/**
 * src/routes/volunteer.routes.js
 *
 * GET    /api/volunteer              (public)
 * GET    /api/volunteer/:id          (public)
 * POST   /api/volunteer              (admin)
 * PUT    /api/volunteer/:id          (admin)
 * DELETE /api/volunteer/:id          (admin)
 * POST   /api/volunteer/:id/apply    (auth)
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  listOpportunities, getOpportunity, createOpportunity,
  updateOpportunity, deleteOpportunity, applyForOpportunity, getMyApplications,
  adminListApplications, adminRejectApplicant, adminApproveApplicant,
} = require('../controllers/volunteer.controller');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');

const opportunitySchema = Joi.object({
  title:        Joi.string().max(120).required(),
  description:  Joi.string().max(1000).allow(''),
  location:     Joi.string().required(),
  date:         Joi.date().allow(null),
  maxVolunteers: Joi.number().min(1).required(),
  isActive:     Joi.boolean().default(true),
});

router.get('/',              listOpportunities);
router.get('/admin/applications', protect, requireRole('admin'), adminListApplications);
router.get('/my',            protect, getMyApplications);
router.get('/:id',           getOpportunity);
router.post('/',             protect, requireRole('admin'), validate(opportunitySchema), createOpportunity);
router.put('/:id',           protect, requireRole('admin'), updateOpportunity);
router.put('/:id/applicants/:userId/approve', protect, requireRole('admin'), adminApproveApplicant);
router.put('/:id/applicants/:userId/reject', protect, requireRole('admin'), adminRejectApplicant);
router.delete('/:id',        protect, requireRole('admin'), deleteOpportunity);
router.post('/:id/apply',    protect, applyForOpportunity);

module.exports = router;
