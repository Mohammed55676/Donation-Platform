/**
 * src/models/User.model.js
 * Mongoose schema for platform users.
 */
const mongoose = require('mongoose');


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
          // At least 8 characters, 1 uppercase, 1 number, 1 special character
          return /(?=.*[A-Z])/.test(v) && /(?=.*\d)/.test(v) && /(?=.*[!@#$%^&*(),.?":{}|<>_])/.test(v) && v.length >= 8;
        },
        message: 'Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.'
      },
      select: false, // never returned by default
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
    // Distinguishes public user types — separate from the role field (admin/user)
    user_type: {
      type: String,
      enum: ['donor', 'beneficiary'],
      default: 'donor',
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
    // ── Verification & rating summary (synced from BeneficiaryProfile / Rating) ──
    verification_status: {
      type: String,
      enum: ['not_verified', 'pending_review', 'trusted', 'rejected', 'blocked'],
      default: 'not_verified',
    },
    completed_donations_count: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// ── Instance method: compare password ───────────────────────────────
userSchema.methods.comparePassword = function (plain) {
  // Plain text comparison (NOT SECURE - Done based on user request)
  return Promise.resolve(plain === this.password);
};

// ── Remove sensitive fields from JSON output ─────────────────────────
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    ret.id = ret._id.toString();
    
    // Calculate profile completeness
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
