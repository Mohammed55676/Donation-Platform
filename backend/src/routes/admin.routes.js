/**
 * src/routes/admin.routes.js
 */
const express = require('express');
const router = express.Router();

const {
  listCharities, updateCharityStatus, listReports, updateReportStatus
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(protect);
router.use(requireRole('admin'));

router.get('/charities', listCharities);
router.put('/charities/:id/status', updateCharityStatus);

router.get('/reports', listReports);
router.put('/reports/:id/status', updateReportStatus);

module.exports = router;
