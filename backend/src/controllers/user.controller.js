/**
 * src/controllers/user.controller.js
 *
 * GET    /api/users           — List users (admin only, paginated + search)
 * GET    /api/users/:id       — Get single user
 * PUT    /api/users/:id       — Update user (self or admin)
 * PUT    /api/users/:id/status — Ban / unban user (admin only)
 * DELETE /api/users/:id       — Delete user (admin only)
 */
const User = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/users ───────────────────────────────────────────────────
/**
 * @route   GET /api/users
 * @access  Admin
 * @query   page, limit, search, role, status
 */
async function listUsers(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, role, status } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role)   filter.role   = role;
    if (status) filter.status = status;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, users, 'Users retrieved.', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
}

// ── POST /api/users ──────────────────────────────────────────────────
/**
 * @route   POST /api/users
 * @access  Admin
 * @body    { name, email, password, role, ... }
 */
async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered.', 409);

    const user = await User.create({ name, email, password, role });
    // Remove password from response
    user.password = undefined;
    return sendSuccess(res, user, 'User created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/users/:id ───────────────────────────────────────────────
async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found.', 404);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/users/:id ───────────────────────────────────────────────
/**
 * @route   PUT /api/users/:id
 * @access  Self or Admin
 * @body    { name?, phone?, location?, avatar? }
 */
async function updateUser(req, res, next) {
  try {
    const isSelf  = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) throw new AppError('Forbidden.', 403);

    // Prevent non-admins from elevating role
    if (!isAdmin) {
      delete req.body.role;
      delete req.body.status;
    }
    // Never allow password change via this route
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new AppError('User not found.', 404);

    return sendSuccess(res, user, 'User updated.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/users/:id/status ────────────────────────────────────────
/**
 * @route   PUT /api/users/:id/status
 * @access  Admin
 * @body    { status: 'active' | 'banned' }
 */
async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'banned'].includes(status)) {
      throw new AppError('Status must be "active" or "banned".', 400);
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!user) throw new AppError('User not found.', 404);
    return sendSuccess(res, user, `User ${status === 'banned' ? 'banned' : 'unbanned'}.`);
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/users/:id ────────────────────────────────────────────
async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new AppError('User not found.', 404);
    return sendSuccess(res, null, 'User deleted.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/users/:id/wishlist ─────────────────────────────────────
async function toggleWishlist(req, res, next) {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    if (!isSelf) throw new AppError('Forbidden.', 403);

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found.', 404);

    const donationId = req.body.donationId;
    if (!donationId) throw new AppError('Donation ID is required.', 400);

    const index = user.wishlist.indexOf(donationId);
    if (index === -1) {
      user.wishlist.push(donationId);
    } else {
      user.wishlist.splice(index, 1);
    }
    
    await user.save({ validateBeforeSave: false });
    return sendSuccess(res, user, 'Wishlist updated.');
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser, getUser, updateUser, updateUserStatus, deleteUser, toggleWishlist };
