/**
 * src/models/User.model.js
 * Mongoose schema for platform users.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


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
      validate: {
        validator: function(v) {
          return /(?=.*[A-Z])/.test(v) && /(?=.*\d)/.test(v) && /(?=.*[!@#$%^&*(),.?":{}|<>_])/.test(v) && v.length >= 8;
        },
        message: 'Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.'
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    location: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    user_type: {
      type: String,
      enum: ['donor', 'charity'],
      default: 'donor',
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],

    // ── OTP verification ────────────────────────────────────────────────
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },

    // ── Charity-specific fields ─────────────────────────────────────────
    charityStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', null],
      default: null,
    },
    charityCategory: { type: String, default: null },
    charityDescription: { type: String, default: null },
    charityRegistrationNumber: { type: String, default: null },
    charityLicenseDocument: { type: String, default: null },
    charityBadge: { type: Boolean, default: false },

    // ── Legacy verification & rating summary ────────────────────────────
    verification_status: {
      type: String,
      enum: ['not_verified', 'pending_review', 'trusted', 'rejected', 'blocked'],
      default: 'not_verified',
    },
    completed_donations_count: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Pre-save hook: Hash password ─────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance method: compare password ───────────────────────────────
userSchema.methods.comparePassword = async function (plain) {
  const isHashed = this.password && (this.password.startsWith('$2b$') || this.password.startsWith('$2a$'));

  if (isHashed) {
    return await bcrypt.compare(plain, this.password);
  } else {
    return plain === this.password;
  }
};

// ── Remove sensitive fields from JSON output ─────────────────────────
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpires;
    ret.id = ret._id.toString();

    let completeness = 40;
    if (ret.phone) completeness += 20;
    if (ret.location) completeness += 20;
    if (ret.avatar) completeness += 20;
    ret.profileComplete = completeness;

    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
