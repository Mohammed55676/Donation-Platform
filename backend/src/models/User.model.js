/**
 * src/models/User.model.js
 * Mongoose schema for platform users.
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    location: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
  },
  { timestamps: true }
);

// ── Pre-save: hash password ──────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// ── Instance method: compare password ───────────────────────────────
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// ── Remove sensitive fields from JSON output ─────────────────────────
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
