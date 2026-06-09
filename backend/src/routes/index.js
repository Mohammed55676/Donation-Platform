/**
 * src/routes/index.js
 * Central router — mounts all sub-routers under /api
 */
const express   = require('express');
const router    = express.Router();

router.use('/auth',              require('./auth.routes'));
router.use('/users',             require('./user.routes'));
router.use('/donations',         require('./donation.routes'));
router.use('/campaigns',         require('./campaign.routes'));
router.use('/volunteer',         require('./volunteer.routes'));
router.use('/community',         require('./community.routes'));
router.use('/conversations',     require('./conversation.routes'));

router.use('/donation-requests', require('./donationRequest.routes'));
router.use('/contact',           require('./contact.routes'));
router.use('/ratings',           require('./rating.routes'));
router.use('/charity',           require('./charity.routes'));
router.use('/ai',                require('./ai.routes'));
router.use('/reports',           require('./report.routes'));
router.use('/admin',             require('./admin.routes'));

// Health-check endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
