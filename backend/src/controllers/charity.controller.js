/**
 * src/controllers/charity.controller.js
 *
 * Charity verification & beneficiary management endpoints.
 *
 * POST   /api/charity/profile              — Charity submits license
 * GET    /api/charity/verified              — List verified charities (public-ish)
 * POST   /api/charity/join/:charityId       — Beneficiary requests to join charity
 * GET    /api/charity/my-status             — Beneficiary checks their charity join status
 * GET    /api/charity/beneficiaries         — Charity lists pending beneficiaries
 * PUT    /api/charity/beneficiaries/:id     — Charity approves/rejects beneficiary
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

// ── POST /api/charity/join/:charityId ────────────────────────────────
/**
 * Beneficiary requests to join a verified charity for verification.
 */
async function beneficiaryJoinCharity(req, res, next) {
  try {
    if (req.user.user_type !== 'beneficiary') {
      throw new AppError('هذه الميزة للمستفيدين فقط.', 403);
    }

    // Don't allow re-request if already verified
    if (req.user.beneficiaryStatus === 'verified') {
      throw new AppError('أنت موثق بالفعل.', 400);
    }

    // Don't allow if already pending admin review or already linked
    if (req.user.charityId) {
      throw new AppError('أنت مرتبط بجمعية بالفعل.', 400);
    }

    const charityId = req.params.charityId;
    const charity = await User.findById(charityId);

    if (!charity || charity.user_type !== 'charity') {
      throw new AppError('الجمعية غير موجودة.', 404);
    }
    if (charity.charityStatus !== 'verified') {
      throw new AppError('هذه الجمعية ليست موثقة بعد.', 400);
    }

    const { note } = req.body;

    // Link the beneficiary to the charity — verification remains admin-controlled
    await User.findByIdAndUpdate(req.user._id, {
      charityId: charity._id,
      beneficiaryVerificationNote: note || null,
    });

    const updatedUser = await User.findById(req.user._id);
    return sendSuccess(res, updatedUser, 'تم ربطك بالجمعية. التحقق من هويتك يتم عبر الإدارة.');
  } catch (err) {
    next(err);
  }
}

// ── GET /api/charity/my-status ───────────────────────────────────────
/**
 * Beneficiary checks their current charity verification status.
 */
async function getMyCharityStatus(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate('charityId', 'name charityName charityBadge avatar');

    return sendSuccess(res, {
      beneficiaryStatus: user.beneficiaryStatus,
      verifiedBy: user.verifiedBy,
      charityId: user.charityId,
      beneficiaryVerificationNote: user.beneficiaryVerificationNote,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/charity/beneficiaries ───────────────────────────────────
/**
 * Verified charity lists beneficiaries who requested to join them.
 */
async function charityListBeneficiaries(req, res, next) {
  try {
    if (req.user.user_type !== 'charity') {
      throw new AppError('هذه الميزة للجمعيات الخيرية فقط.', 403);
    }
    if (req.user.charityStatus !== 'verified') {
      throw new AppError('يجب أن تكون جمعيتك موثقة أولاً.', 403);
    }

    const filter = { charityId: req.user._id, user_type: 'beneficiary' };
    if (req.query.status) {
      filter.beneficiaryStatus = req.query.status;
    }

    const beneficiaries = await User.find(filter)
      .select('name email phone location beneficiaryStatus beneficiaryVerificationNote createdAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, beneficiaries, 'Beneficiaries retrieved.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/charity/beneficiaries/:id ───────────────────────────────
/**
 * Verified charity approves or rejects a beneficiary.
 */
async function charityReviewBeneficiary(req, res, next) {
  try {
    if (req.user.user_type !== 'charity') {
      throw new AppError('هذه الميزة للجمعيات الخيرية فقط.', 403);
    }
    if (req.user.charityStatus !== 'verified') {
      throw new AppError('يجب أن تكون جمعيتك موثقة أولاً.', 403);
    }

    const { action, note } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      throw new AppError('الإجراء يجب أن يكون approve أو reject.', 400);
    }

    const beneficiary = await User.findById(req.params.id);
    if (!beneficiary || beneficiary.user_type !== 'beneficiary') {
      throw new AppError('المستفيد غير موجود.', 404);
    }
    if (beneficiary.charityId?.toString() !== req.user._id.toString()) {
      throw new AppError('هذا المستفيد لم يتقدم لجمعيتك.', 403);
    }
    throw new AppError('توثيق المستفيدين يتم من قِبَل الإدارة فقط.', 403);
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
      // Unlink all beneficiaries tied to this rejected charity
      await User.updateMany(
        { charityId: charity._id },
        { charityId: null, beneficiaryVerificationNote: 'تم رفض الجمعية من الإدارة.' }
      );
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
  beneficiaryJoinCharity,
  getMyCharityStatus,
  charityListBeneficiaries,
  charityReviewBeneficiary,
  adminListCharities,
  adminReviewCharity,
};
