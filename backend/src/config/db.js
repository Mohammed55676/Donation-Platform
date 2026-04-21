/**
 * src/config/db.js
 * Establishes the Mongoose connection to MongoDB.
 * Retries are handled automatically by Mongoose's built-in reconnection logic.
 */
const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Call once at server startup — exits process on failure so the container restarts.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // Mongoose 8+ has these defaults built-in, kept here for clarity
      maxPoolSize: 10,
    });
    console.log(`[DB] MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    process.exit(1);
  }
}

// Log connection events
mongoose.connection.on('disconnected', () => console.warn('[DB] MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('[DB] MongoDB reconnected'));

module.exports = connectDB;
