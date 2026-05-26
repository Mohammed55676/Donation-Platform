/**
 * src/routes/rating.routes.js
 *
 * POST   /api/ratings              — Submit a rating (auth)
 * GET    /api/ratings/user/:userId — Get visible ratings for a user (public)
 * PUT    /api/ratings/:id/hide     — Admin: toggle hide/show
 */
const express = require('express');
const router  = express.Router();

const { submitRating, getUserRatings, adminToggleHide } = require('../controllers/rating.controller');
const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/',              protect, submitRating);
router.get('/user/:userId',   getUserRatings);             // Public
router.put('/:id/hide',       protect, requireRole('admin'), adminToggleHide);

module.exports = router;
