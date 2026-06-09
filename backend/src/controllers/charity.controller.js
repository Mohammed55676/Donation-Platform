/**
 * src/controllers/charity.controller.js
 *
 * Charity management endpoints.
 *
 * POST   /api/charity/profile              — Charity submits license
 * GET    /api/charity/verified              — List verified charities (public-ish)
 * GET    /api/charity/admin/list            — Admin lists all charities
 * PUT    /api/charity/admin/:id/review      — Admin approves/rejects charity
 */
const User = require('../models/User.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

// ── POST /api/charity/profile ────────────────────────────────────────
/**
 * Charity user submits their profile (license doc, charity name).
 * Sets charityStatus to 'pending'.
 */
async function submitCharityProfile(req, res, next) {
  try {
    if (req.user.user_type !== 'charity') {
      throw new AppError('هذه الميزة للجمعيات الخيرية فقط.', 403);
    }

    const { charityName, charityLicenseDocument } = req.body;
    if (!charityName || !charityName.trim()) {
      throw new AppError('اسم الجمعية مطلوب.', 400);
    }

    const update = {
      charityName: charityName.trim(),
      charityStatus: 'pending',
    };
    if (charityLicenseDocument) {
      update.charityLicenseDocument = charityLicenseDocument;
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    return sendSuccess(res, user, 'تم تقديم ملف الجمعية. سيتم مراجعته من الإدارة.');
  } catch (err) {
    next(err);
  }
}

// ── GET /api/charity/verified ────────────────────────────────────────
/**
 * Returns list of verified charities (for beneficiaries to browse & join).
 */
async function listVerifiedCharities(req, res, next) {
  try {
    const charities = await User.find({
      user_type: 'charity',
      charityStatus: 'verified',
      status: 'active',
    }).select('name charityName charityBadge avatar location phone createdAt');

    return sendSuccess(res, charities, 'Verified charities retrieved.');
  } catch (err) {
    next(err);
  }
}



// ── GET /api/charity/admin/list ───────────────────────────────────────
/**
 * Admin lists all charity users (with optional status filter).
 */
async function adminListCharities(req, res, next) {
  try {
    const filter = { user_type: 'charity' };
    if (req.query.status) {
      filter.charityStatus = req.query.status;
    }

    const charities = await User.find(filter)
      .select('name email charityName charityStatus charityBadge charityLicenseDocument phone location createdAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, charities, 'Charities retrieved.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/charity/admin/:id/review ────────────────────────────────
/**
 * Admin approves or rejects a charity.
 */
async function adminReviewCharity(req, res, next) {
  try {
    const { action, note } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      throw new AppError('الإجراء يجب أن يكون approve أو reject.', 400);
    }

    const charity = await User.findById(req.params.id);
    if (!charity || charity.user_type !== 'charity') {
      throw new AppError('الجمعية غير موجودة.', 404);
    }

    if (action === 'approve') {
      charity.charityStatus = 'verified';
      charity.charityBadge = true;
    } else {
      charity.charityStatus = 'rejected';
      charity.charityBadge = false;
    }

    await charity.save();
    return sendSuccess(res, charity, action === 'approve' ? 'تم اعتماد الجمعية.' : 'تم رفض الجمعية.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitCharityProfile,
  listVerifiedCharities,
  adminListCharities,
  adminReviewCharity,
};
