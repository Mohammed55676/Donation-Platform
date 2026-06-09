/**
 * src/controllers/admin.controller.js
 */
const User = require('../models/User.model');
const Report = require('../models/Report.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/admin/charities ─────────────────────────────────────────
async function listCharities(req, res, next) {
  try {
    const filter = { user_type: 'charity' };
    if (req.query.status) {
      filter.charityStatus = req.query.status;
    }
    const charities = await User.find(filter).sort('-createdAt');
    return sendSuccess(res, charities, 'Charities retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/admin/charities/:id/status ──────────────────────────────
async function updateCharityStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      throw new AppError('Invalid charity status.', 400);
    }

    const charity = await User.findById(id);
    if (!charity) throw new AppError('Charity not found.', 404);

    charity.charityStatus = status;
    await charity.save({ validateBeforeSave: false });

    return sendSuccess(res, charity, 'Charity status updated successfully.');
  } catch (err) {
    next(err);
  }
}

// ── GET /api/admin/reports ───────────────────────────────────────────
async function listReports(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const reports = await Report.find(filter)
      .populate('reporter_id', 'name email avatar')
      .populate('reported_user_id', 'name email avatar')
      .sort('-createdAt');
    return sendSuccess(res, reports, 'Reports retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/admin/reports/:id/status ────────────────────────────────
async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      throw new AppError('Invalid report status.', 400);
    }

    const report = await Report.findById(id);
    if (!report) throw new AppError('Report not found.', 404);

    report.status = status;
    await report.save();

    return sendSuccess(res, report, 'Report status updated successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCharities,
  updateCharityStatus,
  listReports,
  updateReportStatus,
};
