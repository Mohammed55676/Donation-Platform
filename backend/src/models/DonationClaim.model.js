/**
 * src/models/DonationClaim.model.js
 * Represents a Charity's claim/request for a specific Donation posted by a Donor.
 */
const mongoose = require('mongoose');

const donationClaimSchema = new mongoose.Schema(
  {
    donation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    charity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_review', 'accepted', 'rejected'],
      default: 'pending_review',
    },
  },
  { timestamps: true }
);

// A charity can claim a given donation only once. Enforced at the DB level so
// concurrent requests can't both pass the controller's read-then-write check.
donationClaimSchema.index({ donation_id: 1, charity: 1 }, { unique: true });

donationClaimSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('DonationClaim', donationClaimSchema);
