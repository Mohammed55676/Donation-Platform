/**
 * src/controllers/donationRequest.controller.js
 */
const DonationRequest = require('../models/DonationRequest.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

// Charity creates a request
async function createRequest(req, res, next) {
    try {
        const isVerifiedCharity = req.user.user_type === 'charity' && req.user.charityStatus === 'verified';
        if (!isVerifiedCharity) throw new AppError('فقط الجمعيات الموثقة يمكنها إنشاء طلب تبرع.', 403);

        const requestData = {
            ...req.body,
            charityId: req.user._id,
            createdBy: req.user._id,
            status: 'pending_review'
        };

        const request = await DonationRequest.create(requestData);
        return sendSuccess(res, request, 'Donation request created. Pending admin review.', 201);
    } catch (err) {
        next(err);
    }
}

// Public: GET active requests
async function getActiveRequests(req, res, next) {
    try {
        const requests = await DonationRequest.find({ status: 'active' })
            .populate('charityId', 'name avatar location')
            .sort({ createdAt: -1 });
        return sendSuccess(res, requests, 'Active donation requests retrieved.');
    } catch (err) {
        next(err);
    }
}

// Charity: GET own requests
async function getMyRequests(req, res, next) {
    try {
        const requests = await DonationRequest.find({ charityId: req.user._id })
            .sort({ createdAt: -1 });
        return sendSuccess(res, requests, 'My donation requests retrieved.');
    } catch (err) {
        next(err);
    }
}

// Charity: Update own request
async function updateRequest(req, res, next) {
    try {
        const request = await DonationRequest.findOneAndUpdate(
            { _id: req.params.id, charityId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!request) throw new AppError('Request not found or not authorized.', 404);
        return sendSuccess(res, request, 'Donation request updated.');
    } catch (err) {
        next(err);
    }
}

// Charity: Cancel own request
async function cancelRequest(req, res, next) {
    try {
        const request = await DonationRequest.findOneAndUpdate(
            { _id: req.params.id, charityId: req.user._id },
            { status: 'cancelled' },
            { new: true }
        );
        if (!request) throw new AppError('Request not found or not authorized.', 404);
        return sendSuccess(res, request, 'Donation request cancelled.');
    } catch (err) {
        next(err);
    }
}

// Admin: GET pending requests
async function listPendingRequests(req, res, next) {
    try {
        const requests = await DonationRequest.find({ status: 'pending_review' })
            .populate('charityId', 'name email location')
            .sort({ createdAt: -1 });
        return sendSuccess(res, requests, 'Pending donation requests retrieved.');
    } catch (err) {
        next(err);
    }
}

// Admin: Approve request
async function approveRequest(req, res, next) {
    try {
        const request = await DonationRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        );
        if (!request) throw new AppError('Request not found.', 404);
        return sendSuccess(res, request, 'Request approved.');
    } catch (err) {
        next(err);
    }
}

// Admin: Reject request
async function rejectRequest(req, res, next) {
    try {
        const { adminNote } = req.body;
        const request = await DonationRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', adminNote },
            { new: true }
        );
        if (!request) throw new AppError('Request not found.', 404);
        return sendSuccess(res, request, 'Request rejected.');
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createRequest,
    getActiveRequests,
    getMyRequests,
    updateRequest,
    cancelRequest,
    listPendingRequests,
    approveRequest,
    rejectRequest
};
