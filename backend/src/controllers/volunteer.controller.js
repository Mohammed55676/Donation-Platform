/**
 * src/controllers/volunteer.controller.js
 *
 * GET    /api/volunteer          — List opportunities (public)
 * GET    /api/volunteer/:id      — Get single opportunity (public)
 * POST   /api/volunteer          — Create opportunity (admin)
 * PUT    /api/volunteer/:id      — Update opportunity (admin)
 * DELETE /api/volunteer/:id      — Delete opportunity (admin)
 * POST   /api/volunteer/:id/apply — Apply for opportunity (auth)
 */
const VolunteerOpportunity = require('../models/VolunteerOpportunity.model');
const { sendSuccess } = require('../utils/apiResponse');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/volunteer ───────────────────────────────────────────────
async function listOpportunities(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive !== 'false';

    const [opportunities, total] = await Promise.all([
      VolunteerOpportunity.find(filter)
        .select('-applicants')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VolunteerOpportunity.countDocuments(filter),
    ]);

    return sendSuccess(res, opportunities, 'Opportunities retrieved.', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
}

// ── GET /api/volunteer/:id ───────────────────────────────────────────
async function getOpportunity(req, res, next) {
  try {
    const opp = await VolunteerOpportunity.findById(req.params.id).select('-applicants');
    if (!opp) throw new AppError('Opportunity not found.', 404);
    return sendSuccess(res, opp);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/volunteer ──────────────────────────────────────────────
async function createOpportunity(req, res, next) {
  try {
    const opp = await VolunteerOpportunity.create({ ...req.body, createdBy: req.user._id });
    return sendSuccess(res, opp, 'Volunteer opportunity created.', 201);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/volunteer/:id ───────────────────────────────────────────
async function updateOpportunity(req, res, next) {
  try {
    // Don't allow volunteers count to be manually set; it's managed by apply route
    delete req.body.volunteers;
    delete req.body.applicants;

    const opp = await VolunteerOpportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!opp) throw new AppError('Opportunity not found.', 404);
    return sendSuccess(res, opp, 'Opportunity updated.');
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/volunteer/:id ────────────────────────────────────────
async function deleteOpportunity(req, res, next) {
  try {
    const opp = await VolunteerOpportunity.findByIdAndDelete(req.params.id);
    if (!opp) throw new AppError('Opportunity not found.', 404);
    return sendSuccess(res, null, 'Opportunity deleted.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/volunteer/:id/apply ────────────────────────────────────
/**
 * @route  POST /api/volunteer/:id/apply
 * @access Auth
 * Idempotent: applying twice returns success without double-counting.
 */
async function applyForOpportunity(req, res, next) {
  try {
    const opp = await VolunteerOpportunity.findById(req.params.id);
    if (!opp) throw new AppError('Opportunity not found.', 404);
    if (!opp.isActive) throw new AppError('This opportunity is no longer active.', 400);

    const userId = req.user._id;
    const alreadyApplied = opp.applicants.some((id) => id.equals(userId));

    if (alreadyApplied) {
      return sendSuccess(res, opp, 'You have already applied for this opportunity.');
    }

    if (opp.volunteers >= opp.maxVolunteers) {
      throw new AppError('This opportunity is fully booked.', 400);
    }

    opp.applicants.push(userId);
    opp.volunteers += 1;
    await opp.save();

    return sendSuccess(res, opp, 'Application submitted successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listOpportunities, getOpportunity, createOpportunity,
  updateOpportunity, deleteOpportunity, applyForOpportunity,
};
