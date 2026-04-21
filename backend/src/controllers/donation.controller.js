/**
 * src/controllers/donation.controller.js
 *
 * GET    /api/donations         — List donations (public, paginated, filterable)
 * GET    /api/donations/:id     — Get single donation
 * POST   /api/donations         — Create donation (auth)
 * PUT    /api/donations/:id     — Update donation (owner or admin)
 * PUT    /api/donations/:id/status — Update status (admin)
 * DELETE /api/donations/:id     — Delete donation (owner or admin)
 */
const Donation = require('../models/Donation.model');
const { sendSuccess } = require('../utils/apiResponse');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/donations ───────────────────────────────────────────────
/**
 * @query page, limit, category, urgency, status, location, search, sort
 */
async function listDonations(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { category, urgency, status, location, search, sort } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (urgency)  filter.urgency  = urgency;
    if (status)   filter.status   = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search)   filter.$text    = { $search: search };

    // Sort: newest | oldest | urgency
    const sortMap = {
      newest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      urgency: { urgency: 1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donor', 'name avatar')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Donation.countDocuments(filter),
    ]);

    return sendSuccess(res, donations, 'Donations retrieved.', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
}

// ── GET /api/donations/:id ───────────────────────────────────────────
async function getDonation(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name avatar email')
      .populate('claimedBy', 'name avatar');
    if (!donation) throw new AppError('Donation not found.', 404);
    return sendSuccess(res, donation);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/donations ──────────────────────────────────────────────
async function createDonation(req, res, next) {
  try {
    const donation = await Donation.create({ ...req.body, donor: req.user._id });
    return sendSuccess(res, donation, 'Donation created. Pending admin review.', 201);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/donations/:id ───────────────────────────────────────────
async function updateDonation(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found.', 404);

    const isOwner = donation.donor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) throw new AppError('Forbidden.', 403);

    // Only admin can change status
    if (!isAdmin) delete req.body.status;

    Object.assign(donation, req.body);
    await donation.save();

    return sendSuccess(res, donation, 'Donation updated.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/donations/:id/status ────────────────────────────────────
async function updateDonationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['قيد المراجعة', 'متاح', 'محجوز', 'تم التسليم', 'مرفوض'];
    if (!allowed.includes(status)) throw new AppError('Invalid status value.', 400);

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!donation) throw new AppError('Donation not found.', 404);
    return sendSuccess(res, donation, 'Status updated.');
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/donations/:id ────────────────────────────────────────
async function deleteDonation(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found.', 404);

    const isOwner = donation.donor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) throw new AppError('Forbidden.', 403);

    await donation.deleteOne();
    return sendSuccess(res, null, 'Donation deleted.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDonations, getDonation, createDonation,
  updateDonation, updateDonationStatus, deleteDonation,
};
