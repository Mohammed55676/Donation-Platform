/**
 * src/routes/donorOffer.routes.js
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
    submitOffer,
    getMyOffers,
    cancelOffer,
    getCharityOffers,
    acceptOffer,
    rejectOffer,
    markReceived
} = require('../controllers/donorOffer.controller');

const { protect }  = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const submitSchema = Joi.object({
    donationRequestId: Joi.string().hex().length(24).required(),
    offeredItem: Joi.string().max(120).required(),
    offeredQuantity: Joi.number().min(1).required(),
    condition: Joi.string().valid('جديد', 'جيد جداً', 'جيد', 'مستعمل').required(),
    message: Joi.string().max(1000).allow('', null),
    relatedDonationId: Joi.string().hex().length(24).allow(null)
});

// Donor
router.post('/', protect, validate(submitSchema), submitOffer);
router.get('/my', protect, getMyOffers);
router.patch('/:id/cancel', protect, cancelOffer);

// Charity
router.get('/charity', protect, getCharityOffers);
router.patch('/:id/accept', protect, acceptOffer);
router.patch('/:id/reject', protect, rejectOffer);
router.patch('/:id/received', protect, markReceived);

module.exports = router;
