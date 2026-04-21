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
      .populate('requestedBy', 'name avatar');
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
    return sendSuccess(res, request, 'Community request created.', 201);
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

    Object.assign(request, req.body);
    await request.save();

    return sendSuccess(res, request, 'Request updated.');
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
    return sendSuccess(res, { likes: request.likes.length, liked: !liked }, liked ? 'Like removed.' : 'Liked.');
  } catch (err) {
    next(err);
  }
}

module.exports = { listRequests, getRequest, createRequest, updateRequest, deleteRequest, toggleLike };
