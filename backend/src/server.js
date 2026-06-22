/**
 * src/server.js
 * Express + Socket.IO application entry point.
 *
 * Responsibilities:
 *  1. Load environment variables
 *  2. Connect to MongoDB
 *  3. Configure middleware stack (security, logging, parsing)
 *  4. Mount API routes
 *  5. Attach Socket.IO for private real-time messaging
 *  6. Centralized error handling
 *  7. Start HTTP server
 */
require('dotenv').config();

const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const apiRouter = require('./routes/index');
const { errorHandler } = require('./middleware/error.middleware');
const { sendError } = require('./utils/apiResponse');
const User = require('./models/User.model');
const Message = require('./models/Message.model');
const Conversation = require('./models/Conversation.model');
const Block = require('./models/Block.model');

// ── App init ─────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ───────────────────────────────────────────────
connectDB();

// ── Security headers (helmet) ────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_ORIGIN
  : (origin, callback) => {
    // Allow any localhost port in development
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Request logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Body parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Serve static files ───────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Global rate limiter ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// ── Stricter limiter on auth endpoints ───────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many auth attempts. Please wait 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);


// ── API routes ───────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── 404 handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// ── Centralized error handler (MUST be last) ─────────────────────────
app.use(errorHandler);

// ── Socket.IO ────────────────────────────────────────────────────────
const socketCorsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_ORIGIN
  : (origin, callback) => {
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    };

const io = new Server(server, {
  cors: {
    origin: socketCorsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Authenticate socket using JWT from handshake
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.user = user; // attach user to socket
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  console.log(`[Socket] User connected: ${socket.user.name} (${userId})`);

  // Join the user to their personal room (userId)
  socket.join(userId);

  // ── sendMessage event ──────────────────────────────────────────────
  // Mirrors the authorization of the REST POST /conversations/:id/messages:
  // the sender must be a participant of an active conversation, and neither
  // party may have blocked the other.
  socket.on('sendMessage', async ({ conversationId, message }) => {
    try {
      if (!conversationId || !message || !message.trim()) return;

      const conv = await Conversation.findById(conversationId);
      if (!conv) return socket.emit('messageError', { error: 'Conversation not found.' });

      // Authorization: sender must be a participant of this conversation
      const senderId = socket.user._id.toString();
      const isParticipant =
        conv.requester_id.toString() === senderId ||
        conv.receiver_id.toString() === senderId;
      if (!isParticipant) return socket.emit('messageError', { error: 'Unauthorized.' });

      if (conv.status !== 'active') {
        return socket.emit('messageError', { error: 'Conversation is not active.' });
      }

      // Block check (either direction)
      const blocked = await Block.findOne({
        $or: [
          { blocker_id: conv.requester_id, blocked_id: conv.receiver_id },
          { blocker_id: conv.receiver_id, blocked_id: conv.requester_id },
        ],
      });
      if (blocked) return socket.emit('messageError', { error: 'Cannot communicate with this user.' });

      // Persist using the actual schema fields
      const msg = await Message.create({
        conversation_id: conv._id,
        sender_id: socket.user._id,
        message: message.trim(),
      });

      conv.last_message_at = new Date();
      await conv.save();

      const payload = msg.toJSON();

      // Deliver to the OTHER participant and back to the sender's own tabs
      const otherId = conv.requester_id.toString() === senderId
        ? conv.receiver_id.toString()
        : conv.requester_id.toString();
      io.to(otherId).emit('receiveMessage', payload);
      io.to(senderId).emit('receiveMessage', payload);
    } catch (err) {
      console.error('[Socket] sendMessage error:', err.message);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.user.name}`);
  });
});

// ── Start server ─────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Server] API base: http://localhost:${PORT}/api`);
  console.log(`[Server] Socket.IO enabled`);
});

module.exports = app; // for testing
