/**
 * src/controllers/donationRequest.controller.js
 *
 * POST   /api/donation-requests             — Beneficiary creates a request
 * GET    /api/donation-requests/my          — Beneficiary views their requests
 * GET    /api/donation-requests/admin       — Admin views all requests
 * PUT    /api/donation-requests/:id/review  — Admin accepts or rejects
 * PUT    /api/donation-requests/:id/received — Mark as received (admin or beneficiary)
 */
const DonationRequest    = require('../models/DonationRequest.model');
const BeneficiaryProfile = require('../models/BeneficiaryProfile.model');
const Donation           = require('../models/Donation.model');
const User               = require('../models/User.model');
const { sendSuccess }    = require('../utils/apiResponse');
const { AppError }       = require('../middleware/error.middleware');

/** Categories that require a verified (trusted) beneficiary */
const HIGH_VALUE_CATEGORIES = ['أثاث', 'مستلزمات طبية', 'أجهزة', 'أجهزة كهربائية', 'إلكترونيات'];

/** 14-day restriction helper — checks by national_id_number, not user account */
async function check14DayRestriction(national_id_number) {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recent = await DonationRequest.findOne({
    national_id_number,
    status: { $in: ['received', 'accepted'] },
    $or: [
      { received_at: { $gte: cutoff } },
      { accepted_at: { $gte: cutoff } },
    ],
  });
  return recent; // null if no restriction
}

// ── POST /api/donation-requests ──────────────────────────────────────
/**
 * Beneficiary creates a donation request.
 * Requires: trusted verification status.
 * Enforces 14-day restriction by national_id_number.
 */
async function createRequest(req, res, next) {
  try {
    if (req.user.user_type !== 'beneficiary') {
      throw new AppError('هذه الميزة للمستفيدين فقط.', 403);
    }

    const { donation_id } = req.body;
    if (!donation_id) throw new AppError('معرّف التبرع مطلوب.', 400);

    // Verify beneficiary has a trusted profile
    const profile = await BeneficiaryProfile.findOne({ user_id: req.user._id });
    if (!profile) {
      throw new AppError('يجب تقديم وثائق التحقق من الهوية أولاً.', 403);
    }
    if (profile.verification_status === 'pending_review') {
      throw new AppError('طلب التحقق قيد المراجعة. يرجى الانتظار.', 403);
    }
    if (profile.verification_status === 'rejected') {
      throw new AppError('تم رفض طلب التحقق الخاص بك. يرجى تحديث بيانات الهوية.', 403);
    }
    if (profile.verification_status === 'blocked') {
      throw new AppError('لا يمكنك طلب التبرعات حالياً، يرجى التواصل مع الإدارة.', 403);
    }
    if (profile.verification_status !== 'trusted') {
      throw new AppError('يجب إتمام التحقق من الهوية أولاً.', 403);
    }

    // Verify donation exists and is available
    const donation = await Donation.findById(donation_id);
    if (!donation) throw new AppError('التبرع غير موجود.', 404);
    if (donation.status !== 'متاح') {
      throw new AppError('هذا التبرع غير متاح للطلب حالياً.', 400);
    }

    // High-value category check — only verified beneficiaries can request these
    if (HIGH_VALUE_CATEGORIES.includes(donation.category) && profile.verification_status !== 'trusted') {
      throw new AppError(
        'هذا التبرع من فئة عالية القيمة. يجب أن تكون حالة التحقق "موثق" لطلبه.',
        403
      );
    }

    // Prevent duplicate request from same beneficiary
    const duplicate = await DonationRequest.findOne({
      donation_id,
      beneficiary_id: req.user._id,
    });
    if (duplicate) {
      throw new AppError('لقد قدّمت طلباً لهذا التبرع مسبقاً.', 409);
    }

    // 14-day restriction check (by national ID, cross-account safe)
    const recentReceived = await check14DayRestriction(profile.national_id_number);
    if (recentReceived) {
      throw new AppError(
        'رقم الهوية الوطنية هذا استلم تبرعاً خلال الـ 14 يوماً الماضية. ' +
        'لا يمكن تقديم طلب جديد حتى انتهاء فترة الانتظار.',
        403
      );
    }

    const request = await DonationRequest.create({
      donation_id,
      beneficiary_id: req.user._id,
      national_id_number: profile.national_id_number,
      status: 'pending_review',
    });

    return sendSuccess(res, request, 'تم تقديم طلب التبرع بنجاح. سيتم مراجعته من قِبَل الإدارة.', 201);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/donation-requests/my ────────────────────────────────────
async function getMyRequests(req, res, next) {
  try {
    const requests = await DonationRequest.find({ beneficiary_id: req.user._id })
      .populate('donation_id', 'title description image category status location createdAt donor')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Requests retrieved.');
  } catch (err) {
    next(err);
  }
}

// ── GET /api/donation-requests/admin ─────────────────────────────────
async function adminListRequests(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await DonationRequest.find(filter)
      .populate('donation_id', 'title description image category status location')
      .populate('beneficiary_id', 'name email user_type status')
      .sort({ createdAt: -1 });

    // Attach beneficiary profile for each request (for admin to see verification details)
    const nationalIds = [...new Set(requests.map(r => r.national_id_number))];
    const profiles = await BeneficiaryProfile.find({
      national_id_number: { $in: nationalIds },
    });
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.national_id_number] = p; });

    const enriched = requests.map(r => ({
      ...r.toJSON(),
      beneficiary_profile: profileMap[r.national_id_number] || null,
    }));

    return sendSuccess(res, enriched, 'Requests retrieved.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/donation-requests/:id/review ────────────────────────────
/**
 * Admin accepts or rejects a donation request.
 * On accept:
 *   - 14-day restriction check (can be bypassed with emergency_exception + reason)
 *   - Sets donation → 'محجوز'
 *   - Rejects all other pending requests for the same donation
 */
async function adminReviewRequest(req, res, next) {
  try {
    const { action, admin_notes, emergency_exception, emergency_reason } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      throw new AppError('الإجراء يجب أن يكون accept أو reject.', 400);
    }

    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new AppError('الطلب غير موجود.', 404);
    if (request.status !== 'pending_review') {
      throw new AppError('يمكن مراجعة الطلبات التي حالتها "قيد المراجعة" فقط.', 400);
    }

    if (action === 'reject') {
      request.status     = 'rejected';
      request.admin_notes = admin_notes || null;
      await request.save();
      return sendSuccess(res, request, 'تم رفض الطلب.');
    }

    // ── Accept logic ──────────────────────────────────────────────
    // 14-day restriction check
    const recentReceived = await check14DayRestriction(request.national_id_number);
    if (recentReceived && !emergency_exception) {
      return res.status(409).json({
        success: false,
        error:
          'رقم الهوية الوطنية هذا استلم تبرعاً خلال الـ 14 يوماً الماضية. ' +
          'يمكنك تجاوز هذا القيد بتفعيل الاستثناء الطارئ مع ذكر السبب.',
        requires_emergency_exception: true,
        recent_request_id: recentReceived._id,
      });
    }

    if (emergency_exception && !emergency_reason?.trim()) {
      throw new AppError('سبب الاستثناء الطارئ مطلوب.', 400);
    }

    const donation = await Donation.findById(request.donation_id);
    if (!donation) throw new AppError('التبرع المرتبط بالطلب غير موجود.', 404);

    // Update this request
    request.status              = 'accepted';
    request.accepted_at          = new Date();
    request.admin_notes          = admin_notes || null;
    request.emergency_exception  = !!emergency_exception;
    request.emergency_reason     = emergency_exception ? emergency_reason.trim() : null;
    await request.save();

    // Reserve the donation
    donation.status    = 'محجوز';
    donation.claimedBy = request.beneficiary_id;
    await donation.save();

    // Auto-reject other pending requests for the same donation
    await DonationRequest.updateMany(
      {
        donation_id:  request.donation_id,
        _id:          { $ne: request._id },
        status:       'pending_review',
      },
      { $set: { status: 'rejected', admin_notes: 'تم قبول طلب مستفيد آخر لنفس التبرع.' } }
    );

    await request.populate('donation_id beneficiary_id');
    return sendSuccess(res, request, 'تم قبول الطلب وحجز التبرع.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/donation-requests/:id/received ──────────────────────────
/**
 * Marks a request as received and sets donation status to 'تم التسليم'.
 * Can be done by admin or the beneficiary who owns the request.
 */
async function markReceived(req, res, next) {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new AppError('الطلب غير موجود.', 404);

    const isAdmin = req.user.role === 'admin';
    const isOwner = request.beneficiary_id.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) throw new AppError('غير مسموح.', 403);

    if (request.status !== 'accepted') {
      throw new AppError('يمكن تأكيد الاستلام للطلبات المقبولة فقط.', 400);
    }

    request.status      = 'received';
    request.received_at = new Date();
    await request.save();

    const donation = await Donation.findByIdAndUpdate(request.donation_id, { status: 'تم التسليم' });

    // Increment completed_donations_count for both donor and beneficiary
    if (donation) {
      await User.findByIdAndUpdate(donation.donor, { $inc: { completed_donations_count: 1 } });
      await User.findByIdAndUpdate(request.beneficiary_id, { $inc: { completed_donations_count: 1 } });
    }

    return sendSuccess(res, request, 'تم تأكيد استلام التبرع.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest,
  getMyRequests,
  adminListRequests,
  adminReviewRequest,
  markReceived,
};
