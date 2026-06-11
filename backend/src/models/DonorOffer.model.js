/**
 * src/models/DonorOffer.model.js
 *
 * Donor response to a specific DonationRequest.
 */
const mongoose = require('mongoose');

const donorOfferSchema = new mongoose.Schema(
  {
    donationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offeredItem: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    offeredQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    condition: {
      type: String,
      required: true,
      enum: ['جديد', 'جيد جداً', 'جيد', 'مستعمل'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['new', 'accepted', 'rejected', 'in_progress', 'received', 'cancelled'],
      default: 'new',
    },
    relatedDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      default: null,
    },
  },
  { timestamps: true }
);

donorOfferSchema.index({ donationRequestId: 1 });
donorOfferSchema.index({ donorId: 1 });
donorOfferSchema.index({ charityId: 1 });
donorOfferSchema.index({ status: 1 });
donorOfferSchema.index({ createdAt: -1 });

donorOfferSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('DonorOffer', donorOfferSchema);
