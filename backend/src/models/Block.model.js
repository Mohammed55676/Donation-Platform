/**
 * src/models/Block.model.js
 * Schema for users blocking other users.
 */
const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
    blocker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blocked_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

blockSchema.index({ blocker_id: 1, blocked_id: 1 }, { unique: true });

blockSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Block', blockSchema);
