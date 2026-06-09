/**
 * src/models/Message.model.js
 * Schema for messages inside conversations.
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [2000, 'Message too long'],
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for fast fetching of messages in a conversation
messageSchema.index({ conversation_id: 1, createdAt: 1 });

messageSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Message', messageSchema);
