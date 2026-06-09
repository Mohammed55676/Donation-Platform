/**
 * src/controllers/rating.controller.js
 *
 * POST   /api/ratings              — Submit a rating for a completed donation
 * GET    /api/ratings/user/:userId — Get public ratings for a user (visible ratings only)
 * PUT    /api/ratings/:id/hide     — Admin: hide/show an abusive review
 */
const Rating   = require('../models/Rating.model');
const Donation = require('../models/Donation.model');
const User     = require('../models/User.model');
const { sendSuccess }  = require('../utils/apiResponse');
const { AppError }     = require('../middleware/error.middleware');

// ── POST /api/ratings ────────────────────────────────────────────────
async function submitRating(req, res, next) {
  try {
    const { donation_id, ratee_id, stars, comment, tags } = req.body;

    if (!donation_id || !ratee_id) {
      throw new AppError('معرّف التبرع والمستخدم المراد تقييمه مطلوبان.', 400);
    }
    if (!stars || stars < 1 || stars > 5) {
      throw new AppError('التقييم يجب أن يكون بين 1 و 5 نجوم.', 400);
    }

    const raterId = req.user._id.toString();
    if (raterId === ratee_id) {
      throw new AppError('لا يمكنك تقييم نفسك.', 400);
    }

    // Verify donation is completed
    const donation = await Donation.findById(donation_id);
    if (!donation) throw new AppError('التبرع غير موجود.', 404);
    if (donation.status !== 'تم التسليم') {
      throw new AppError('لا يمكنك التقييم إلا بعد اكتمال التبرع.', 400);
    }

    // Verify the rater is either the donor or the claimed charity
    const donorId   = donation.donor.toString();
    const claimedBy = donation.claimedBy?.toString();
    if (raterId !== donorId && raterId !== claimedBy) {
      throw new AppError('ليس لديك صلاحية لتقييم هذا التبرع.', 403);
    }

    // Verify the ratee is the OTHER party
    if (ratee_id !== donorId && ratee_id !== claimedBy) {
      throw new AppError('المستخدم المراد تقييمه ليس طرفاً في هذا التبرع.', 400);
    }

    // Check for duplicate
    const existing = await Rating.findOne({ donation: donation_id, rater: raterId });
    if (existing) {
      throw new AppError('لقد قمت بتقييم هذا التبرع مسبقاً.', 409);
    }

    const rating = await Rating.create({
      donation: donation_id,
      rater: raterId,
      ratee: ratee_id,
      stars,
      comment: comment?.trim() || null,
      tags: tags || [],
    });

    // Update ratee's average rating
    await recalcUserRating(ratee_id);

    return sendSuccess(res, rating, 'تم إرسال التقييم بنجاح.', 201);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/ratings/user/:userId ────────────────────────────────────
async function getUserRatings(req, res, next) {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId, hidden: false })
      .populate('rater', 'name avatar')
      .populate('donation', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, ratings);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/ratings/:id/hide ────────────────────────────────────────
async function adminToggleHide(req, res, next) {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) throw new AppError('التقييم غير موجود.', 404);

    rating.hidden = !rating.hidden;
    await rating.save();

    // Recalculate ratee averages (hidden reviews excluded)
    await recalcUserRating(rating.ratee.toString());

    return sendSuccess(res, rating, rating.hidden ? 'تم إخفاء التقييم.' : 'تم إظهار التقييم.');
  } catch (err) {
    next(err);
  }
}

// ── Helper: recalculate user rating ──────────────────────────────────
async function recalcUserRating(userId) {
  const result = await Rating.aggregate([
    { $match: { ratee: require('mongoose').Types.ObjectId.createFromHexString(userId), hidden: false } },
    { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } },
  ]);

  const avg   = result[0]?.avg   || 0;
  const count = result[0]?.count || 0;

  await User.findByIdAndUpdate(userId, {
    average_rating: Math.round(avg * 10) / 10,
    rating_count: count,
  });
}

module.exports = { submitRating, getUserRatings, adminToggleHide };
