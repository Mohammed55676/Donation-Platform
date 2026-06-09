/**
 * src/controllers/conversation.controller.js
 */
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Block = require('../models/Block.model');
const CommunityRequest = require('../models/CommunityRequest.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

// Helper to check if blocked
async function isBlocked(user1, user2) {
  const block = await Block.findOne({
    $or: [
      { blocker_id: user1, blocked_id: user2 },
      { blocker_id: user2, blocked_id: user1 }
    ]
  });
  return !!block;
}

// GET /api/conversations
async function getConversations(req, res, next) {
  try {
    const myId = req.user._id;
    const convs = await Conversation.find({
      $or: [{ requester_id: myId }, { receiver_id: myId }],
      status: { $in: ['active', 'pending'] }
    })
      .populate('requester_id', 'id name avatar user_type phone')
      .populate('receiver_id', 'id name avatar user_type phone')
      .populate('post_id', 'id title status')
      .sort({ last_message_at: -1, createdAt: -1 });

    const formattedConvs = convs.map(c => c.toJSON());

    return sendSuccess(res, formattedConvs, 'Conversations retrieved.');
  } catch (err) {
    next(err);
  }
}

// GET /api/conversations/requests
async function getRequests(req, res, next) {
  try {
    const myId = req.user._id;
    const reqs = await Conversation.find({
      receiver_id: myId,
      status: 'pending'
    })
      .populate('requester_id', 'id name avatar user_type phone')
      .populate('post_id', 'id title')
      .sort({ createdAt: -1 });

    const formattedReqs = reqs.map(r => r.toJSON());

    return sendSuccess(res, formattedReqs, 'Conversation requests retrieved.');
  } catch (err) {
    next(err);
  }
}

// POST /api/conversations/request
async function createRequest(req, res, next) {
  try {
    const { receiver_id, post_id, message } = req.body;
    const myId = req.user._id;

    if (!receiver_id || !message) {
      throw new AppError('Receiver and message are required.', 400);
    }
    
    if (myId.toString() === receiver_id.toString()) {
      throw new AppError('Cannot send request to yourself.', 400);
    }

    if (await isBlocked(myId, receiver_id)) {
      throw new AppError('Cannot communicate with this user.', 403);
    }

    // Check if pending or active exists
    const existing = await Conversation.findOne({
      $or: [
        { requester_id: myId, receiver_id: receiver_id, post_id: post_id || null },
        { requester_id: receiver_id, receiver_id: myId, post_id: post_id || null }
      ],
      status: { $in: ['pending', 'active'] }
    });

    if (existing) {
      throw new AppError('A conversation already exists.', 400);
    }

    const conv = await Conversation.create({
      post_id: post_id || null,
      requester_id: myId,
      receiver_id,
      first_message: message,
      last_message_at: new Date()
    });

    return sendSuccess(res, conv, 'Conversation request sent.', 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/conversations/:id/accept
async function acceptConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conv = await Conversation.findOne({ _id: id, receiver_id: req.user._id, status: 'pending' });
    if (!conv) throw new AppError('Pending conversation not found.', 404);

    conv.status = 'active';
    conv.phone_visible = true;
    conv.accepted_at = new Date();
    await conv.save();

    return sendSuccess(res, conv, 'Conversation accepted.');
  } catch (err) {
    next(err);
  }
}

// PUT /api/conversations/:id/reject
async function rejectConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conv = await Conversation.findOne({ _id: id, receiver_id: req.user._id, status: 'pending' });
    if (!conv) throw new AppError('Pending conversation not found.', 404);

    conv.status = 'rejected';
    conv.rejected_at = new Date();
    await conv.save();

    return sendSuccess(res, conv, 'Conversation rejected.');
  } catch (err) {
    next(err);
  }
}

// PUT /api/conversations/:id/block
async function blockConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conv = await Conversation.findById(id);
    if (!conv) throw new AppError('Conversation not found.', 404);
    
    if (conv.receiver_id.toString() !== req.user._id.toString() && conv.requester_id.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized.', 403);
    }

    conv.status = 'blocked';
    conv.blocked_at = new Date();
    await conv.save();

    const otherUser = conv.receiver_id.toString() === req.user._id.toString() ? conv.requester_id : conv.receiver_id;

    // create block record if not exists
    await Block.updateOne(
      { blocker_id: req.user._id, blocked_id: otherUser },
      { $set: { reason: 'Blocked from conversation.' } },
      { upsert: true }
    );

    return sendSuccess(res, conv, 'User blocked.');
  } catch (err) {
    next(err);
  }
}

// GET /api/conversations/:id/messages
async function getMessages(req, res, next) {
  try {
    const { id } = req.params;
    const conv = await Conversation.findById(id)
      .populate('requester_id', 'id name avatar phone user_type')
      .populate('receiver_id', 'id name avatar phone user_type')
      .populate('post_id', 'id title status');

    if (!conv) throw new AppError('Conversation not found.', 404);

    if (conv.requester_id._id.toString() !== req.user._id.toString() && conv.receiver_id._id.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized.', 403);
    }

    const messages = await Message.find({ conversation_id: id }).sort({ createdAt: 1 });
    
    // Mark unread as read if it's sent to me
    const unreadIds = messages.filter(m => m.sender_id.toString() !== req.user._id.toString() && !m.is_read).map(m => m._id);
    if (unreadIds.length > 0) {
      await Message.updateMany({ _id: { $in: unreadIds } }, { is_read: true, read_at: new Date() });
    }

    let convObj = conv.toJSON();

    return sendSuccess(res, { conversation: convObj, messages }, 'Messages retrieved.');
  } catch (err) {
    next(err);
  }
}

// POST /api/conversations/:id/messages
async function sendMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) throw new AppError('Message is required.', 400);

    const conv = await Conversation.findById(id);
    if (!conv) throw new AppError('Conversation not found.', 404);

    if (conv.status !== 'active') {
      throw new AppError('Cannot send messages to inactive conversation.', 403);
    }

    if (await isBlocked(conv.requester_id, conv.receiver_id)) {
      throw new AppError('Cannot communicate with this user.', 403);
    }

    const msg = await Message.create({
      conversation_id: id,
      sender_id: req.user._id,
      message,
    });

    conv.last_message_at = new Date();
    await conv.save();

    return sendSuccess(res, msg, 'Message sent.', 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/conversations/:id/agreement
async function confirmAgreement(req, res, next) {
  try {
    const { id } = req.params;
    const conv = await Conversation.findById(id);
    if (!conv) throw new AppError('Conversation not found.', 404);

    const userId = req.user._id.toString();
    if (!conv.agreement_confirmed_by.includes(userId)) {
      conv.agreement_confirmed_by.push(userId);
    }

    if (conv.agreement_confirmed_by.length >= 2) {
      conv.agreed_at = new Date();
      if (conv.post_id) {
        await CommunityRequest.findByIdAndUpdate(conv.post_id, { status: 'تم الاتفاق' });
      }
    }
    
    await conv.save();
    return sendSuccess(res, conv, 'Agreement confirmed.');
  } catch (err) {
    next(err);
  }
}

// PUT /api/conversations/:id/delivery
async function confirmDelivery(req, res, next) {
  try {
    const { id } = req.params;
    const conv = await Conversation.findById(id);
    if (!conv) throw new AppError('Conversation not found.', 404);

    if (!conv.agreed_at) {
      throw new AppError('Agreement must be confirmed first.', 400);
    }

    const userId = req.user._id.toString();
    if (!conv.delivery_confirmed_by.includes(userId)) {
      conv.delivery_confirmed_by.push(userId);
    }

    if (conv.delivery_confirmed_by.length >= 2) {
      conv.delivered_at = new Date();
      if (conv.post_id) {
        await CommunityRequest.findByIdAndUpdate(conv.post_id, { status: 'تم التسليم' });
      }
    }
    
    await conv.save();
    return sendSuccess(res, conv, 'Delivery confirmed.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConversations,
  getRequests,
  createRequest,
  acceptConversation,
  rejectConversation,
  blockConversation,
  getMessages,
  sendMessage,
  confirmAgreement,
  confirmDelivery
};
