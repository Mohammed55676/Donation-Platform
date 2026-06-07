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
    const isAdmin = req.user.role === 'admin';
    const isVerifiedCharity = req.user.user_type === 'charity' && req.user.charityStatus === 'verified';

    if (!isAdmin && !isVerifiedCharity) {
      throw new AppError('يمكن للأدمن أو الجمعيات الموثقة فقط إنشاء حملات.', 403);
    }

    const campaignData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Admin campaigns are active directly; charity campaigns need review
    if (isAdmin) {
      campaignData.status = 'active';
    } else {
      campaignData.status = 'pending_review';
      campaignData.charityId = req.user._id;
    }

    const campaign = await Campaign.create(campaignData);
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

// ── POST /api/campaigns/:id/donate ──────────────────────────────────
// Demo-only: records a fake transaction and increments current amount.
// Card data is NEVER received or stored here — it stays on the frontend.
async function donateToCampaign(req, res, next) {
  try {
    const { amount, paymentMethod, isDemoPayment } = req.body;

    if (!amount || Number(amount) <= 0) {
      throw new AppError('المبلغ يجب أن يكون أكبر من صفر.', 400);
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { current: Number(amount) },
        $push: {
          demoTransactions: {
            donorId:       req.user?._id ?? null,
            amount:        Number(amount),
            paymentMethod: paymentMethod || 'card',
            status:        'demo_success',
            isDemoPayment: isDemoPayment !== false,
            createdAt:     new Date(),
          },
        },
      },
      { new: true, runValidators: false }
    );

    if (!campaign) throw new AppError('Campaign not found.', 404);

    return sendSuccess(res, {
      campaignId:    campaign.id,
      amount:        Number(amount),
      newTotal:      campaign.current,
      status:        'demo_success',
      isDemoPayment: true,
    }, 'Demo donation recorded.', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, donateToCampaign };
