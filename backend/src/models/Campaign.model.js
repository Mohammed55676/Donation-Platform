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
    urgency: {
      type: String,
      enum: ['عالية', 'متوسطة'],
      default: 'متوسطة',
    },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual: progress percentage
campaignSchema.virtual('progressPercent').get(function () {
  return this.target > 0 ? Math.min(100, Math.round((this.current / this.target) * 100)) : 0;
});

campaignSchema.set('toJSON', { virtuals: true, transform(_, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } });

module.exports = mongoose.model('Campaign', campaignSchema);
