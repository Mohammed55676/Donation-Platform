/**
 * src/models/CommunityRequest.model.js
 * Schema for community help/support requests.
 */
const mongoose = require('mongoose');

const communityRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000],
    },
    category: {
      type: String,
      required: true,
      enum: ['ملابس', 'طعام', 'أثاث', 'كتب', 'طبي', 'غذاء', 'أخرى'],
    },
    urgency: {
      type: String,
      enum: ['عالية', 'متوسطة', 'منخفضة'],
      default: 'متوسطة',
    },
    status: {
      type: String,
      enum: ['متاح', 'تم الاتفاق', 'تم التسليم', 'ملغي'],
      default: 'متاح',
    },
    location: { type: String, trim: true },
    image: { type: String, default: null },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Users who liked / offered help
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Comments
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    // Comment count (virtual or stored)
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
communityRequestSchema.index({ title: 'text', description: 'text' });
communityRequestSchema.index({ status: 1, urgency: 1, category: 1 });

communityRequestSchema.set('toJSON', { transform(_, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } });

module.exports = mongoose.model('CommunityRequest', communityRequestSchema);