/**
 * src/controllers/community.controller.js
 *
 * GET    /api/community          — List community requests (auth, paginated)
 * GET    /api/community/:id      — Get single request
 * POST   /api/community          — Create request (auth)
 * PUT    /api/community/:id      — Update request (owner or admin)
 * DELETE /api/community/:id      — Delete request (owner or admin)
 * POST   /api/community/:id/like — Toggle like on a request (auth)
 */
const CommunityRequest = require('../models/CommunityRequest.model');
const { sendSuccess } = require('../utils/apiResponse');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/community ───────────────────────────────────────────────
/**
 * @query page, limit, category, urgency, status, search
 */
async function listRequests(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { category, urgency, status, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (urgency)  filter.urgency  = urgency;
    if (status)   filter.status   = status;
    if (search)   filter.$text    = { $search: search };

    const [requests, total] = await Promise.all([
      CommunityRequest.find(filter)
        .populate('requestedBy', 'name avatar')
        .populate('comments.user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CommunityRequest.countDocuments(filter),
    ]);

    return sendSuccess(res, requests, 'Requests retrieved.', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
}

// ── GET /api/community/:id ───────────────────────────────────────────
async function getRequest(req, res, next) {
  try {
    const request = await CommunityRequest.findById(req.params.id)
      .populate('requestedBy', 'name avatar')
      .populate('comments.user', 'name avatar');
    if (!request) throw new AppError('Request not found.', 404);
    return sendSuccess(res, request);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/community ──────────────────────────────────────────────
async function createRequest(req, res, next) {
  try {
    const request = await CommunityRequest.create({ ...req.body, requestedBy: req.user._id });
    const populatedRequest = await CommunityRequest.findById(request._id)
      .populate('requestedBy', 'name avatar')
      .populate('comments.user', 'name avatar');
    return sendSuccess(res, populatedRequest, 'Community request created.', 201);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/community/:id ───────────────────────────────────────────
async function updateRequest(req, res, next) {
  try {
    const request = await CommunityRequest.findById(req.params.id);
    if (!request) throw new AppError('Request not found.', 404);

    const isOwner = request.requestedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) throw new AppError('Forbidden.', 403);

    // Only allow specific fields to be updated (prevent overwriting requestedBy, likes, etc.)
    const allowed = ['title', 'description', 'category', 'urgency', 'location', 'image', 'status'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        request[key] = req.body[key];
      }
    }
    await request.save();

    const updatedRequest = await CommunityRequest.findById(request._id)
      .populate('requestedBy', 'name avatar')
      .populate('comments.user', 'name avatar');

    return sendSuccess(res, updatedRequest, 'Request updated.');
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/community/:id ────────────────────────────────────────
async function deleteRequest(req, res, next) {
  try {
    const request = await CommunityRequest.findById(req.params.id);
    if (!request) throw new AppError('Request not found.', 404);

    const isOwner = request.requestedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) throw new AppError('Forbidden.', 403);

    await request.deleteOne();
    return sendSuccess(res, null, 'Request deleted.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/community/:id/like ─────────────────────────────────────
async function toggleLike(req, res, next) {
  try {
    const request = await CommunityRequest.findById(req.params.id);
    if (!request) throw new AppError('Request not found.', 404);

    const userId = req.user._id;
    const liked  = request.likes.some((id) => id.equals(userId));

    if (liked) {
      request.likes = request.likes.filter((id) => !id.equals(userId));
    } else {
      request.likes.push(userId);
    }

    await request.save();
    
    // Return the full populated request to avoid crashing the frontend store
    const updatedRequest = await CommunityRequest.findById(request._id)
      .populate('requestedBy', 'name avatar')
      .populate('comments.user', 'name avatar');
    
    return sendSuccess(res, updatedRequest, liked ? 'Like removed.' : 'Liked.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/community/:id/comment ──────────────────────────────────
async function addComment(req, res, next) {
  try {
    const { text } = req.body;
    if (!text) throw new AppError('Comment text is required.', 400);

    const request = await CommunityRequest.findById(req.params.id);
    if (!request) throw new AppError('Request not found.', 404);

    request.comments.push({
      user: req.user._id,
      text: text
    });
    
    request.commentCount = request.comments.length;
    await request.save();

    const updatedRequest = await CommunityRequest.findById(request._id)
      .populate('requestedBy', 'name avatar')
      .populate('comments.user', 'name avatar');

    return sendSuccess(res, updatedRequest, 'Comment added.');
  } catch (err) {
    next(err);
  }
}

module.exports = { listRequests, getRequest, createRequest, updateRequest, deleteRequest, toggleLike, addComment };
