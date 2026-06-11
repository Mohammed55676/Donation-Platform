/**
 * src/controllers/campaign.controller.js
 */
const Campaign = require('../models/Campaign.model');
const { sendSuccess } = require('../utils/apiResponse');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/campaigns ───────────────────────────────────────────────
async function listCampaigns(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { urgency } = req.query;

    const filter = { status: 'active' };
    if (urgency) filter.urgency = urgency;

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

// ── GET /api/campaigns/my ────────────────────────────────────────────
async function getMyCampaigns(req, res, next) {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user._id })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    return sendSuccess(res, campaigns, 'My campaigns retrieved.', 200);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/campaigns/:id ───────────────────────────────────────────
async function getCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name');
    if (!campaign) throw new AppError('Campaign not found.', 404);
    // Don't leak pending/rejected campaigns to public unless it's admin or owner
    if (campaign.status !== 'active') {
        const isAdmin = req.user?.role === 'admin';
        const isOwner = req.user?._id?.toString() === campaign.createdBy.toString();
        if (!isAdmin && !isOwner) {
            throw new AppError('Campaign not found or not active.', 404);
        }
    }
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
async function donateToCampaign(req, res, next) {
  try {
    const { amount, paymentMethod, isDemoPayment } = req.body;

    if (!amount || Number(amount) <= 0) {
      throw new AppError('المبلغ يجب أن يكون أكبر من صفر.', 400);
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, status: 'active' },
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

    if (!campaign) throw new AppError('Campaign not found or not active.', 404);

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

// ── ADMIN: LIST PENDING CAMPAIGNS ────────────────────────────────────
async function listPendingCampaigns(req, res, next) {
    try {
        const campaigns = await Campaign.find({ status: 'pending_review' })
            .populate('createdBy', 'name')
            .populate('charityId', 'name email')
            .sort({ createdAt: -1 });
        return sendSuccess(res, campaigns, 'Pending campaigns retrieved.');
    } catch (err) {
        next(err);
    }
}

// ── ADMIN: APPROVE/REJECT CAMPAIGN ───────────────────────────────────
async function reviewCampaign(req, res, next) {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        if (!['approve', 'reject'].includes(action)) throw new AppError('Invalid action', 400);

        const status = action === 'approve' ? 'active' : 'rejected';
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!campaign) throw new AppError('Campaign not found', 404);
        return sendSuccess(res, campaign, `Campaign ${action}d successfully`);
    } catch (err) {
        next(err);
    }
}

module.exports = {
  listCampaigns, getMyCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, donateToCampaign,
  listPendingCampaigns, reviewCampaign
};
