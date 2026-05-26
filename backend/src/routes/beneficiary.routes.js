/**
 * src/routes/beneficiary.routes.js
 *
 * GET  /api/beneficiary/profile                         — Get my profile
 * POST /api/beneficiary/profile                         — Submit/update verification
 * GET  /api/beneficiary/admin/profiles                  — Admin: list all profiles
 * PUT  /api/beneficiary/admin/profiles/:id/status       — Admin: update status
 * GET  /api/beneficiary/admin/profiles/:id/document     — Admin: view ID document
 * GET  /api/beneficiary/admin/profiles/:id/proof/:index — Admin: view proof document
 */
const express = require('express');
const router  = express.Router();

const {
  getMyProfile,
  submitVerification,
  adminListProfiles,
  adminUpdateStatus,
  adminGetDocument,
  adminGetProofDocument,
} = require('../controllers/beneficiaryProfile.controller');

const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { nationalIdUploadMiddleware, proofDocumentsUploadMiddleware } = require('../utils/upload');

// ── Beneficiary routes ────────────────────────────────────────────────
router.get('/profile', protect, getMyProfile);
// Chain middlewares: first handle national_id_document (single), then proof_documents (array)
router.post('/profile', protect, nationalIdUploadMiddleware, proofDocumentsUploadMiddleware, submitVerification);

// ── Admin routes ──────────────────────────────────────────────────────
router.get('/admin/profiles', protect, requireRole('admin'), adminListProfiles);
router.put('/admin/profiles/:id/status', protect, requireRole('admin'), adminUpdateStatus);
router.get('/admin/profiles/:id/document', protect, requireRole('admin'), adminGetDocument);
router.get('/admin/profiles/:id/proof/:index', protect, requireRole('admin'), adminGetProofDocument);

module.exports = router;
