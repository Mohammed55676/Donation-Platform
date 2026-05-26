/**
 * src/models/Rating.model.js
 *
 * Mutual rating after a completed donation.
 * Both the donor and the beneficiary can rate each other once per donation.
 * Unique constraint: one rating per (donation, rater) pair.
 */
const mongoose = require('mongoose');

const ALLOWED_TAGS = [
  'ملتزم',
  'محترم',
  'تواصل واضح',
  'تم التسليم بنجاح',
];

const ratingSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    tags: {
      type: [String],
      validate: {
        validator(arr) {
          return arr.every(t => ALLOWED_TAGS.includes(t));
        },
        message: 'تحتوي على وسم غير مسموح.',
      },
      default: [],
    },
    // Admin can hide abusive reviews
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Each user can rate the other party only once per donation
ratingSchema.index({ donation: 1, rater: 1 }, { unique: true });

// Quick lookups for "ratings received by a user"
ratingSchema.index({ ratee: 1 });

ratingSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Rating', ratingSchema);
