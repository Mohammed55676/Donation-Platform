/**
 * src/models/DonationRequest.model.js
 *
 * A charity's request for a specific donation item.
 * The 14-day restriction is enforced using national_id_number,
 * not just user account ID, to prevent bypass via multiple accounts.
 */
const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    donation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    charity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    // Snapshot of the national_id at request time — used for 14-day cross-account checks (legacy)
    national_id_number: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending_review', 'accepted', 'rejected', 'cancelled', 'received'],
      default: 'pending_review',
    },
    // Admin can override 14-day restriction in emergencies
    emergency_exception: { type: Boolean, default: false },
    emergency_reason:    { type: String,  default: null },
    admin_notes:         { type: String,  default: null },
    donor_notes:         { type: String,  default: null },
    accepted_at:         { type: Date,    default: null },
    received_at:         { type: Date,    default: null },
  },
  { timestamps: true }
);

// Prevent the same user from submitting two requests
donationRequestSchema.index(
  { donation_id: 1, charity_id: 1 },
  { unique: true, partialFilterExpression: { charity_id: { $exists: true } } }
);

// Fast lookups
donationRequestSchema.index({ charity_id: 1 });
donationRequestSchema.index({ donation_id: 1 });
donationRequestSchema.index({ status: 1 });
donationRequestSchema.index({ national_id_number: 1 });
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
