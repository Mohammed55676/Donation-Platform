/**
 * src/controllers/organization.controller.js
 *
 * GET    /api/organizations        — List all organizations (public)
 * GET    /api/organizations/:id    — Get single organization (public)
 * POST   /api/organizations        — Create organization (admin)
 * PUT    /api/organizations/:id    — Update organization (admin)
 * DELETE /api/organizations/:id    — Delete organization (admin)
 * POST   /api/organizations/:id/register — Register as volunteer & donate (auth)
 */
const Organization = require('../models/Organization.model');
const { sendSuccess } = require('../utils/apiResponse');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { AppError } = require('../middleware/error.middleware');

// ── GET /api/organizations ──────────────────────────────────────────
async function listOrganizations(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, location } = req.query;

    const filter = {};
    if (location && location !== 'الكل') {
      filter.location = location;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [organizations, total] = await Promise.all([
      Organization.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Organization.countDocuments(filter),
    ]);

    return sendSuccess(res, organizations, 'Organizations retrieved.', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
}

// ── GET /api/organizations/:id ──────────────────────────────────────
async function getOrganization(req, res, next) {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('volunteers', 'name email avatar role');
    if (!organization) throw new AppError('Organization not found.', 404);
    return sendSuccess(res, organization);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/organizations ─────────────────────────────────────────
async function createOrganization(req, res, next) {
  try {
    const organization = await Organization.create({ ...req.body, createdBy: req.user._id });
    return sendSuccess(res, organization, 'Organization created.', 201);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/organizations/:id ──────────────────────────────────────
async function updateOrganization(req, res, next) {
  try {
    const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!organization) throw new AppError('Organization not found.', 404);
    return sendSuccess(res, organization, 'Organization updated.');
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/organizations/:id ───────────────────────────────────
async function deleteOrganization(req, res, next) {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) throw new AppError('Organization not found.', 404);
    return sendSuccess(res, null, 'Organization deleted.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/organizations/:id/register ────────────────────────────
async function registerAndDonate(req, res, next) {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) throw new AppError('Organization not found.', 404);

    const { amount, cardNumber, expiry, cvv, nameOnCard, phone, nationality, message } = req.body;

    // Simulate Credit Card Validation and Processing
    if (!cardNumber || cardNumber.length < 16) {
      throw new AppError('Invalid card number. Must be at least 16 digits.', 400);
    }
    if (!expiry || !expiry.includes('/')) {
      throw new AppError('Invalid expiry date. Must be in MM/YY format.', 400);
    }
    if (!cvv || cvv.length < 3) {
      throw new AppError('Invalid CVV. Must be at least 3 digits.', 400);
    }
    if (!nameOnCard || nameOnCard.trim().length === 0) {
      throw new AppError('Cardholder name is required.', 400);
    }

    // Success simulation!
    const donationAmount = Number(amount) || 0;
    if (donationAmount < 1) {
      throw new AppError('Donation amount must be at least 1.', 400);
    }

    const userId = req.user._id;
    const isAlreadyVolunteer = organization.volunteers.some(
      (v) => v.toString() === userId.toString()
    );

    if (!isAlreadyVolunteer) {
      organization.volunteers.push(userId);
      organization.volunteersCount = organization.volunteers.length;
    }

    organization.raisedFunds += donationAmount;
    await organization.save();

    const updatedOrg = await Organization.findById(organization._id)
      .populate('createdBy', 'name')
      .populate('volunteers', 'name email avatar role');

    return sendSuccess(res, updatedOrg, 'Registration and donation processed successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  registerAndDonate,
};
