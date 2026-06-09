/**
 * src/controllers/donationRequest.controller.js
 *
 * POST   /api/donation-requests                  — Charity creates a request
 * GET    /api/donation-requests/my               — Charity views their requests
 * GET    /api/donation-requests/for-donor        — Donor views requests on their donations (masked)
 * GET    /api/donation-requests/admin            — Admin oversight (read-only)
 * PUT    /api/donation-requests/:id/donor-review — Donor accepts or rejects
 * PUT    /api/donation-requests/:id/received     — Mark as received (donor or charity)
 */
const DonationRequest    = require('../models/DonationRequest.model');
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



// ── POST /api/donation-requests ──────────────────────────────────────
/**
 * Charity creates a donation request.
 * Requires: admin-verified charity status.
 */
async function createRequest(req, res, next) {
  try {
    if (req.user.user_type !== 'charity') {
      throw new AppError('هذه الميزة للجمعيات الخيرية فقط.', 403);
    }

    if (req.user.charityStatus !== 'verified') {
      throw new AppError(
        'يجب أن تكون الجمعية موثقة من الإدارة قبل طلب التبرعات.',
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
      charity_id: req.user._id,
    });
    if (duplicate) {
      throw new AppError('لقد قدّمت الجمعية طلباً لهذا التبرع مسبقاً.', 409);
    }

    const request = await DonationRequest.create({
      donation_id,
      charity_id: req.user._id,
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
    const requests = await DonationRequest.find({ charity_id: req.user._id })
      .populate('donation_id', 'title description image category status location createdAt donor')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Requests retrieved.');
  } catch (err) {
    next(err);
  }
}

// ── GET /api/donation-requests/for-donor ──────────────────────────────
/**
 * Donor sees incoming requests for all donations they own.
 * Charity identity is shown.
 */
async function getRequestsForMyDonations(req, res, next) {
  try {
    // Find all donations owned by this donor
    const myDonations = await Donation.find({ donor: req.user._id }).select('_id title');
    const donationIds = myDonations.map(d => d._id);

    if (donationIds.length === 0) return sendSuccess(res, [], 'No donations found.');

    const requests = await DonationRequest.find({ donation_id: { $in: donationIds } })
      .populate('donation_id', 'title category status')
      .populate('charity_id', 'name avatar charityName')
      .sort({ createdAt: -1 });

    const masked = requests.map(r => {
      return {
        id: r.id,
        donation_id: r.donation_id,
        status: r.status,
        donor_notes: r.donor_notes,
        createdAt: r.createdAt,
        charity: r.charity_id,
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
      .populate('charity_id', 'name email user_type status charityName')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Requests retrieved.');

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
    donation.claimedBy = request.charity_id;
    await donation.save();

    // Auto-reject all other pending requests for the same donation
    await DonationRequest.updateMany(
      {
        donation_id: request.donation_id,
        _id: { $ne: request._id },
        status: 'pending_review',
      },
      { $set: { status: 'rejected', donor_notes: 'تم قبول طلب جمعية أخرى لنفس التبرع.' } }
    );

    await request.populate('donation_id charity_id');
    return sendSuccess(res, request, 'تم قبول الطلب وحجز التبرع.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/donation-requests/:id/received ──────────────────────────
/**
 * Marks a request as received and sets donation to 'تم التسليم'.
 * Can be done by the donation donor or the charity who owns the request.
 */
async function markReceived(req, res, next) {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new AppError('الطلب غير موجود.', 404);

    const donation = await Donation.findById(request.donation_id);
    const isDonor = donation && donation.donor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isOwner = request.charity_id && request.charity_id.toString() === req.user._id.toString();

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
      const requestorId = request.charity_id;
      if (requestorId) {
        await User.findByIdAndUpdate(requestorId, { $inc: { completed_donations_count: 1 } });
      }
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
