/**
 * src/models/Campaign.model.js
 * Mongoose schema for fundraising campaigns.
 */
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000],
    },
    image: { type: String, default: null },
    category: {
      type: String,
      trim: true,
      default: 'عام',
    },

    // Money targets
    target: {
      type: Number,
      required: true,
      min: [1, 'Target must be at least 1'],
    },
    current: {
      type: Number,
      default: 0,
      min: 0,
    },

    // In-kind item targets (optional)
    targetItems: { type: Number, default: null, min: 0 },
    currentItems: { type: Number, default: 0, min: 0 },

    // Donation type
    donationType: {
      type: String,
      enum: ['money', 'items', 'both'],
      default: 'money',
    },

    urgency: {
      type: String,
      enum: ['عالية', 'متوسطة'],
      default: 'متوسطة',
    },

    // Campaign status with review workflow
    status: {
      type: String,
      enum: ['pending_review', 'active', 'completed', 'cancelled'],
      default: 'active',
    },
    isActive: { type: Boolean, default: true },

    // Charity that created it (null if admin)
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Timeline
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },

    // Campaign updates/progress posts
    updates: [{
      text: { type: String, trim: true },
      date: { type: Date, default: Date.now },
    }],

    // Proof images
    proofImages: [{ type: String }],

    // Demo payment transactions — frontend-only simulation, no real payment
    demoTransactions: [{
      donorId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      amount:        { type: Number, required: true, min: 0 },
      paymentMethod: { type: String, enum: ['card', 'apple_google', 'bank'], default: 'card' },
      status:        { type: String, default: 'demo_success' },
      isDemoPayment: { type: Boolean, default: true },
      createdAt:     { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Virtual: progress percentage (money)
campaignSchema.virtual('progressPercent').get(function () {
  return this.target > 0 ? Math.min(100, Math.round((this.current / this.target) * 100)) : 0;
});

// Virtual: items progress percentage
campaignSchema.virtual('itemsProgressPercent').get(function () {
  if (!this.targetItems || this.targetItems <= 0) return 0;
  return Math.min(100, Math.round((this.currentItems / this.targetItems) * 100));
});

campaignSchema.set('toJSON', { virtuals: true, transform(_, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } });

module.exports = mongoose.model('Campaign', campaignSchema);
