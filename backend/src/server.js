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

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'CHANGE_THIS_TO_A_LONG_RANDOM_STRING_AT_LEAST_64_CHARS') {
  console.error('[Server] JWT_SECRET is not configured or is using the placeholder value. Set JWT_SECRET in backend/.env.');
  process.exit(1);
}

const connectDB = require('./config/db');
const apiRouter = require('./routes/index');
const { errorHandler } = require('./middleware/error.middleware');
const { sendError } = require('./utils/apiResponse');
const User = require('./models/User.model');
const Message = require('./models/Message.model');

// ── App init ─────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ───────────────────────────────────────────────
connectDB();

const isDev = process.env.NODE_ENV !== 'production';

// ── Security headers (helmet) ────────────────────────────────────────
// Relax helmet in development mode to prevent local blockages / CORS / CSP issues
if (!isDev) {
  app.use(helmet());
}

// ── CORS ─────────────────────────────────────────────────────────────
// Allow all origins in development to make local requests seamless
const corsOrigin = isDev
  ? true
  : process.env.CLIENT_ORIGIN;

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Request logging ──────────────────────────────────────────────────
if (isDev) {
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
// Completely disabled in development to prevent rate-limiting local testers
if (!isDev) {
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
}

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

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return next(new Error('Server JWT secret not configured'));

    const decoded = jwt.verify(token, jwtSecret);
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
  socket.on('sendMessage', async ({ receiverId, text }) => {
    try {
      if (!receiverId || !text || !text.trim()) return;

      // Save to DB — sender is always taken from the authenticated socket.user
      const msg = await Message.create({
        sender: socket.user._id,
        receiver: receiverId,
        text: text.trim(),
      });

      const populated = await Message.findById(msg._id)
        .populate('sender', 'id name avatar')
        .populate('receiver', 'id name avatar');

      const payload = populated.toJSON();

      // Emit to receiver's room
      io.to(receiverId).emit('receiveMessage', payload);

      // Emit back to sender's room (so all sender tabs also update)
      io.to(userId).emit('receiveMessage', payload);
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
