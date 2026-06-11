/**
 * src/models/DonationRequest.model.js
 *
 * A request created by a verified charity asking donors for specific needs.
 */
const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantityNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    quantityReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    urgency: {
      type: String,
      enum: ['عالية', 'متوسطة', 'منخفضة'],
      default: 'متوسطة',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending_review', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending_review',
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminNote: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

donationRequestSchema.index({ charityId: 1 });
donationRequestSchema.index({ status: 1 });
donationRequestSchema.index({ createdAt: -1 });

donationRequestSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
