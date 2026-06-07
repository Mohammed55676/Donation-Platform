/**
 * src/controllers/donationRequest.controller.js
 *
 * POST   /api/donation-requests                  — Beneficiary creates a request
 * GET    /api/donation-requests/my               — Beneficiary views their requests
 * GET    /api/donation-requests/for-my-donations — Donor views requests on their donations (masked)
 * GET    /api/donation-requests/admin            — Admin oversight (read-only)
 * PUT    /api/donation-requests/:id/donor-review — Donor accepts or rejects
 * PUT    /api/donation-requests/:id/received     — Mark as received (donor or beneficiary)
 */
const DonationRequest    = require('../models/DonationRequest.model');
const BeneficiaryProfile = require('../models/BeneficiaryProfile.model');
const Donation           = require('../models/Donation.model');
const User               = require('../models/User.model');
const { sendSuccess }    = require('../utils/apiResponse');
const { AppError }       = require('../middleware/error.middleware');

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
  return recent;
}

/** Return non-sensitive beneficiary data only — never expose real name/phone/documents */
function maskBeneficiary(beneficiaryId, profile) {
  const caseCode = parseInt(beneficiaryId.toString().slice(-4), 16) % 10000;
  return {
    anonymousCode: `حالة إنسانية #${String(caseCode).padStart(4, '0')}`,
    city: profile?.city || null,
    needs_categories: profile?.needs_categories || [],
    family_members: profile?.family_members || null,
    situation_explanation: profile?.situation_explanation || null,
    delivery_ability: profile?.delivery_ability || null,
  };
}

// ── POST /api/donation-requests ──────────────────────────────────────
/**
 * Beneficiary creates a donation request.
 * Requires: admin-verified beneficiary status.
 * Enforces 14-day restriction by national_id_number.
 */
async function createRequest(req, res, next) {
  try {
    if (req.user.user_type !== 'beneficiary') {
      throw new AppError('هذه الميزة للمستفيدين فقط.', 403);
    }

    if (req.user.beneficiaryStatus !== 'verified') {
      throw new AppError(
        'يجب أن تكون موثقاً من الإدارة قبل طلب التبرعات. قم بزيارة صفحة التحقق من الهوية.',
        403
      );
    }

    const { donation_id } = req.body;
    if (!donation_id) throw new AppError('معرّف التبرع مطلوب.', 400);

    const donation = await Donation.findById(donation_id);
    if (!donation) throw new AppError('التبرع غير موجود.', 404);
    if (donation.status !== 'متاح') {
      throw new AppError('هذا التبرع غير متاح للطلب حالياً.', 400);
    }

    const duplicate = await DonationRequest.findOne({
      donation_id,
      beneficiary_id: req.user._id,
    });
    if (duplicate) {
      throw new AppError('لقد قدّمت طلباً لهذا التبرع مسبقاً.', 409);
    }

    const profile = await BeneficiaryProfile.findOne({ user_id: req.user._id });
    if (!profile) {
      throw new AppError('لم يتم العثور على ملفك الشخصي. يرجى إكمال التحقق من الهوية.', 404);
    }

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

    return sendSuccess(res, request, 'تم تقديم طلب التبرع بنجاح. في انتظار موافقة المتبرع.', 201);
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

// ── GET /api/donation-requests/for-my-donations ──────────────────────
/**
 * Donor sees incoming requests for all donations they own.
 * Beneficiary identity is masked — no real name, phone, or documents.
 */
async function getRequestsForMyDonations(req, res, next) {
  try {
    // Find all donations owned by this donor
    const myDonations = await Donation.find({ donor: req.user._id }).select('_id title');
    const donationIds = myDonations.map(d => d._id);

    if (donationIds.length === 0) return sendSuccess(res, [], 'No donations found.');

    const requests = await DonationRequest.find({ donation_id: { $in: donationIds } })
      .populate('donation_id', 'title category status')
      .sort({ createdAt: -1 });

    // Fetch beneficiary profiles for masking
    const beneficiaryIds = requests.map(r => r.beneficiary_id);
    const profiles = await BeneficiaryProfile.find({ user_id: { $in: beneficiaryIds } })
      .select('user_id city needs_categories family_members situation_explanation delivery_ability');
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user_id.toString()] = p; });

    const masked = requests.map(r => {
      const benId = r.beneficiary_id.toString();
      const profile = profileMap[benId];
      return {
        id: r.id,
        donation_id: r.donation_id,
        status: r.status,
        donor_notes: r.donor_notes,
        createdAt: r.createdAt,
        beneficiary: maskBeneficiary(r.beneficiary_id, profile),
      };
    });

    return sendSuccess(res, masked, 'Requests retrieved.');
  } catch (err) {
    next(err);
  }
}

// ── GET /api/donation-requests/admin ─────────────────────────────────
/** Admin oversight — read only, no action required. */
async function adminListRequests(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await DonationRequest.find(filter)
      .populate('donation_id', 'title description image category status location')
      .populate('beneficiary_id', 'name email user_type status')
      .sort({ createdAt: -1 });

    const nationalIds = [...new Set(requests.map(r => r.national_id_number))];
    const profiles = await BeneficiaryProfile.find({ national_id_number: { $in: nationalIds } });
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

// ── PUT /api/donation-requests/:id/donor-review ──────────────────────
/**
 * The donor who owns the donation accepts or rejects the request.
 * On accept:
 *   - Sets donation → 'محجوز'
 *   - Auto-rejects all other pending requests for the same donation
 */
async function donorReviewRequest(req, res, next) {
  try {
    const { action, donor_notes } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      throw new AppError('الإجراء يجب أن يكون accept أو reject.', 400);
    }

    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new AppError('الطلب غير موجود.', 404);
    if (request.status !== 'pending_review') {
      throw new AppError('يمكن مراجعة الطلبات التي حالتها "قيد المراجعة" فقط.', 400);
    }

    // Verify the requester is the donation owner
    const donation = await Donation.findById(request.donation_id);
    if (!donation) throw new AppError('التبرع المرتبط بالطلب غير موجود.', 404);
    if (donation.donor.toString() !== req.user._id.toString()) {
      throw new AppError('يمكن للمتبرع صاحب التبرع فقط مراجعة الطلبات.', 403);
    }

    if (action === 'reject') {
      request.status     = 'rejected';
      request.donor_notes = donor_notes || null;
      await request.save();
      return sendSuccess(res, request, 'تم رفض الطلب.');
    }

    // Accept
    request.status      = 'accepted';
    request.accepted_at  = new Date();
    request.donor_notes  = donor_notes || null;
    await request.save();

    donation.status    = 'محجوز';
    donation.claimedBy = request.beneficiary_id;
    await donation.save();

    // Auto-reject all other pending requests for the same donation
    await DonationRequest.updateMany(
      {
        donation_id: request.donation_id,
        _id: { $ne: request._id },
        status: 'pending_review',
      },
      { $set: { status: 'rejected', donor_notes: 'تم قبول طلب مستفيد آخر لنفس التبرع.' } }
    );

    await request.populate('donation_id beneficiary_id');
    return sendSuccess(res, request, 'تم قبول الطلب وحجز التبرع.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/donation-requests/:id/received ──────────────────────────
/**
 * Marks a request as received and sets donation to 'تم التسليم'.
 * Can be done by the donation donor or the beneficiary who owns the request.
 */
async function markReceived(req, res, next) {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new AppError('الطلب غير موجود.', 404);

    const donation = await Donation.findById(request.donation_id);
    const isDonor = donation && donation.donor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isOwner = request.beneficiary_id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner && !isDonor) throw new AppError('غير مسموح.', 403);

    if (request.status !== 'accepted') {
      throw new AppError('يمكن تأكيد الاستلام للطلبات المقبولة فقط.', 400);
    }

    request.status      = 'received';
    request.received_at = new Date();
    await request.save();

    if (donation) {
      donation.status = 'تم التسليم';
      await donation.save();
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
  getRequestsForMyDonations,
  adminListRequests,
  donorReviewRequest,
  markReceived,
};
