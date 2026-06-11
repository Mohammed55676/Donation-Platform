/**
 * src/controllers/donorOffer.controller.js
 */
const DonorOffer = require('../models/DonorOffer.model');
const DonationRequest = require('../models/DonationRequest.model');
const Conversation = require('../models/Conversation.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

// Donor submits an offer
async function submitOffer(req, res, next) {
    try {
        const { donationRequestId, offeredItem, offeredQuantity, condition, message, relatedDonationId } = req.body;
        
        const request = await DonationRequest.findById(donationRequestId);
        if (!request) throw new AppError('Donation request not found.', 404);
        if (request.status !== 'active') throw new AppError('Cannot submit offer to a non-active request.', 400);

        const offer = await DonorOffer.create({
            donationRequestId,
            donorId: req.user._id,
            charityId: request.charityId,
            offeredItem,
            offeredQuantity,
            condition,
            message,
            relatedDonationId,
            status: 'new'
        });

        return sendSuccess(res, offer, 'Offer submitted successfully.', 201);
    } catch (err) {
        next(err);
    }
}

// Donor views their own offers
async function getMyOffers(req, res, next) {
    try {
        const offers = await DonorOffer.find({ donorId: req.user._id })
            .populate('charityId', 'name avatar')
            .populate('donationRequestId', 'title category status')
            .sort({ createdAt: -1 });
        return sendSuccess(res, offers, 'My offers retrieved.');
    } catch (err) {
        next(err);
    }
}

// Donor cancels their offer (only if new)
async function cancelOffer(req, res, next) {
    try {
        const offer = await DonorOffer.findOneAndUpdate(
            { _id: req.params.id, donorId: req.user._id, status: 'new' },
            { status: 'cancelled' },
            { new: true }
        );
        if (!offer) throw new AppError('Offer not found or cannot be cancelled.', 404);
        return sendSuccess(res, offer, 'Offer cancelled.');
    } catch (err) {
        next(err);
    }
}

// Charity views offers for their requests
async function getCharityOffers(req, res, next) {
    try {
        const offers = await DonorOffer.find({ charityId: req.user._id })
            .populate('donorId', 'name avatar location')
            .populate('donationRequestId', 'title quantityNeeded quantityReceived')
            .sort({ createdAt: -1 });
        return sendSuccess(res, offers, 'Charity offers retrieved.');
    } catch (err) {
        next(err);
    }
}

// Charity accepts offer
async function acceptOffer(req, res, next) {
    try {
        const offer = await DonorOffer.findOneAndUpdate(
            { _id: req.params.id, charityId: req.user._id, status: 'new' },
            { status: 'accepted' },
            { new: true }
        ).populate('donationRequestId');

        if (!offer) throw new AppError('Offer not found or already processed.', 404);

        // Open chat conversation
        const existingConv = await Conversation.findOne({
            contextType: 'donor_offer',
            contextId: offer._id,
            requester_id: req.user._id,
            receiver_id: offer.donorId
        });

        if (!existingConv) {
            await Conversation.create({
                contextType: 'donor_offer',
                contextId: offer._id,
                requester_id: req.user._id, // charity initiates
                receiver_id: offer.donorId,
                status: 'active',
                first_message: `مرحباً، تم قبول عرض التبرع الخاص بك لطلب: ${offer.donationRequestId?.title || ''}. شكراً لك!`
            });
        }

        return sendSuccess(res, offer, 'Offer accepted.');
    } catch (err) {
        next(err);
    }
}

// Charity rejects offer
async function rejectOffer(req, res, next) {
    try {
        const offer = await DonorOffer.findOneAndUpdate(
            { _id: req.params.id, charityId: req.user._id, status: 'new' },
            { status: 'rejected' },
            { new: true }
        );
        if (!offer) throw new AppError('Offer not found or already processed.', 404);
        return sendSuccess(res, offer, 'Offer rejected.');
    } catch (err) {
        next(err);
    }
}

// Charity marks offer as received
async function markReceived(req, res, next) {
    try {
        const offer = await DonorOffer.findOne({ _id: req.params.id, charityId: req.user._id, status: 'accepted' });
        if (!offer) throw new AppError('Offer not found or not accepted.', 404);

        offer.status = 'received';
        await offer.save();

        // Increment quantity on the donation request
        const request = await DonationRequest.findById(offer.donationRequestId);
        if (request) {
            request.quantityReceived += offer.offeredQuantity;
            if (request.quantityReceived >= request.quantityNeeded) {
                request.status = 'completed';
            }
            await request.save();
        }

        return sendSuccess(res, offer, 'Offer marked as received.');
    } catch (err) {
        next(err);
    }
}

module.exports = {
    submitOffer,
    getMyOffers,
    cancelOffer,
    getCharityOffers,
    acceptOffer,
    rejectOffer,
    markReceived
};
