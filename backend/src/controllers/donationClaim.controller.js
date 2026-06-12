/**
 * src/controllers/donationClaim.controller.js
 */
const DonationClaim = require('../models/DonationClaim.model');
const Donation = require('../models/Donation.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

exports.createClaim = async (req, res, next) => {
  try {
    const { donation_id } = req.body;
    const charity = req.user._id;

    if (req.user.user_type !== 'charity' || req.user.charityStatus !== 'verified') {
        throw new AppError('فقط الجمعيات الموثقة يمكنها طلب التبرعات', 403);
    }

    const donation = await Donation.findById(donation_id);
    if (!donation) throw new AppError('التبرع غير موجود', 404);
    if (donation.status !== 'متاح') throw new AppError('التبرع غير متاح حالياً', 400);

    const existing = await DonationClaim.findOne({ donation_id, charity });
    if (existing) throw new AppError('لقد قمت بطلب هذا التبرع مسبقاً', 400);

    const claim = await DonationClaim.create({ donation_id, charity });
    return sendSuccess(res, claim, 'تم تقديم الطلب بنجاح', 201);
  } catch (err) {
    next(err);
  }
};

exports.getClaimsForDonor = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id });
    const donationIds = donations.map(d => d._id);
    
    const claims = await DonationClaim.find({ donation_id: { $in: donationIds } })
      .populate('donation_id', 'title category status')
      .populate('charity', 'name charityName city email anonymousCode');
      
    return sendSuccess(res, claims, 'Claims retrieved');
  } catch (err) {
    next(err);
  }
};

exports.reviewClaim = async (req, res, next) => {
  try {
    const { action } = req.body; // accept or reject
    if (!['accept', 'reject'].includes(action)) throw new AppError('Invalid action', 400);

    const claim = await DonationClaim.findById(req.params.id).populate('donation_id');
    if (!claim) throw new AppError('الطلب غير موجود', 404);
    
    if (claim.donation_id.donor.toString() !== req.user._id.toString()) {
       throw new AppError('غير مصرح لك بمراجعة هذا الطلب', 403);
    }
    
    if (claim.status !== 'pending_review') {
        throw new AppError('تمت مراجعة هذا الطلب مسبقاً', 400);
    }

    if (action === 'reject') {
      claim.status = 'rejected';
      await claim.save();
      return sendSuccess(res, claim, 'Claim reviewed successfully');
    }

    // action === 'accept': atomically reserve the donation only if it is still available.
    // The conditional status guarantees a donation can be reserved at most once, even if
    // the donor accepts two pending claims for it in quick succession.
    const reserved = await Donation.findOneAndUpdate(
      { _id: claim.donation_id._id, status: 'متاح' },
      { status: 'محجوز', claimedBy: claim.charity },
      { new: true }
    );
    if (!reserved) throw new AppError('التبرع لم يعد متاحاً، تم حجزه مسبقاً', 409);

    // Reservation succeeded — accept this claim and reject the remaining pending claims.
    claim.status = 'accepted';
    await claim.save();

    await DonationClaim.updateMany(
      { donation_id: claim.donation_id._id, _id: { $ne: claim._id }, status: 'pending_review' },
      { status: 'rejected' }
    );
    
    return sendSuccess(res, claim, 'Claim reviewed successfully');
  } catch (err) {
    next(err);
  }
};
