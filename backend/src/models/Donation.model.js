/**
 * src/models/Donation.model.js
 * Mongoose schema for individual item donations.
 */
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['ملابس', 'طعام', 'أثاث', 'كتب', 'أخرى'],
    },
    condition: {
      type: String,
      required: true,
      enum: ['جديد', 'جيد جداً', 'جيد', 'مستعمل'],
    },
    location: { type: String, required: true, trim: true },
    urgency: {
      type: String,
      enum: ['عالية', 'متوسطة', 'منخفضة'],
      default: 'متوسطة',
    },
    image: { type: String, default: null },
    status: {
      type: String,
      enum: ['قيد المراجعة', 'متاح', 'محجوز', 'تم التسليم', 'مرفوض'],
      default: 'قيد المراجعة',
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Who claimed / reserved this donation
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Text index for full-text search
donationSchema.index({ title: 'text', description: 'text', location: 'text' });

// Compound index for common filter queries
donationSchema.index({ category: 1, status: 1, urgency: 1 });

donationSchema.set('toJSON', { transform(_, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } });

module.exports = mongoose.model('Donation', donationSchema);