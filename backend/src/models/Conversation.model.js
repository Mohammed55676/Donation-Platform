/**
 * src/models/Conversation.model.js
 * Schema for community conversations and agreements.
 */
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Legacy support
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityRequest',
      required: false,
    },
    // New generic context support
    contextType: {
      type: String,
      enum: ['donation_request', 'donor_offer', 'community_request'],
      required: false,
    },
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'blocked', 'closed'],
      default: 'pending',
    },
    first_message: {
      type: String,
      required: true,
      trim: true,
    },
    phone_visible: {
      type: Boolean,
      default: false,
    },
    accepted_at: { type: Date },
    rejected_at: { type: Date },
    blocked_at: { type: Date },
    closed_at: { type: Date },
    last_message_at: { type: Date },
    
    agreement_confirmed_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    delivery_confirmed_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    agreed_at: { type: Date },
    delivered_at: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate active/pending conversations for the same two users and post
conversationSchema.index({ requester_id: 1, receiver_id: 1, post_id: 1 });
conversationSchema.index({ status: 1, last_message_at: -1 });

conversationSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Conversation', conversationSchema);
