/**
 * src/controllers/campaign.controller.js
 *
 * GET    /api/campaigns        — List all campaigns (public)
 * GET    /api/campaigns/:id    — Get single campaign (public)
 * POST   /api/campaigns        — Create campaign (admin)
 * PUT    /api/campaigns/:id    — Update campaign (admin)
 * DELETE /api/campaigns/:id    — Delete campaign (admin)
 */
const Campaign = require('../models/Campaign.model');
const { sendSuccess } = require('../utils/apiResponse');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/campaigns ───────────────────────────────────────────────
async function listCampaigns(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { urgency, isActive } = req.query;

    const filter = {};
    if (urgency)  filter.urgency  = urgency;
    if (isActive !== undefined) filter.isActive = isActive !== 'false';

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Campaign.countDocuments(filter),
    ]);

    return sendSuccess(res, campaigns, 'Campaigns retrieved.', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
}

// ── GET /api/campaigns/:id ───────────────────────────────────────────
async function getCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name');
    if (!campaign) throw new AppError('Campaign not found.', 404);
    return sendSuccess(res, campaign);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/campaigns ──────────────────────────────────────────────
async function createCampaign(req, res, next) {
  try {
    const campaign = await Campaign.create({ ...req.body, createdBy: req.user._id });
    return sendSuccess(res, campaign, 'Campaign created.', 201);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/campaigns/:id ───────────────────────────────────────────
async function updateCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campaign) throw new AppError('Campaign not found.', 404);
    return sendSuccess(res, campaign, 'Campaign updated.');
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/campaigns/:id ────────────────────────────────────────
async function deleteCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) throw new AppError('Campaign not found.', 404);
    return sendSuccess(res, null, 'Campaign deleted.');
  } catch (err) {
    next(err);
  }
}

module.exports = { listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign };
