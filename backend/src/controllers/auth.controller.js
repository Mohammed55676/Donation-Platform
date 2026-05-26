/**
 * src/controllers/auth.controller.js
 *
 * POST /api/auth/register   — Register a new user
 * POST /api/auth/login      — Login, receive JWT
 * POST /api/auth/logout     — Logout hint (client clears token)
 * GET  /api/auth/me         — Get current authenticated user
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

/** Sign a JWT for the given user id */
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── POST /api/auth/register ──────────────────────────────────────────
/**
 * @route   POST /api/auth/register
 * @access  Public
 * @body    { name, email, password, user_type? }
 */
async function register(req, res, next) {
  try {
    const { name, email, password, user_type, phone } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered.', 409);

    const user = await User.create({ name, email, password, user_type: user_type || 'donor', phone });
    const token = signToken(user._id);

    return sendSuccess(res, { user, token }, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────────
/**
 * @route   POST /api/auth/login
 * @access  Public
 * @body    { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new AppError('Invalid email or password.', 401);

    const valid = await user.comparePassword(password);
    if (!valid) throw new AppError('Invalid email or password.', 401);

    if (user.status === 'banned') throw new AppError('Your account has been suspended.', 403);

    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    return sendSuccess(res, { user, token }, 'Login successful.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/logout ────────────────────────────────────────────
/**
 * @route   POST /api/auth/logout
 * @access  Private
 * Stateless JWT — client must discard the token.
 * For server-side invalidation, maintain a token blacklist (Redis recommended).
 */
async function logout(req, res) {
  return sendSuccess(res, null, 'Logged out successfully. Please discard your token.');
}

// ── GET /api/auth/me ─────────────────────────────────────────────────
/**
 * @route   GET /api/auth/me
 * @access  Private
 */
async function getMe(req, res) {
  return sendSuccess(res, req.user);
}

// ── POST /api/auth/google ────────────────────────────────────────────
/**
 * @route   POST /api/auth/google
 * @access  Public
 * @body    { email, name, avatar }
 * Simplified Google Login: In production, verify Firebase/Google ID token!
 */
async function googleLogin(req, res, next) {
  try {
    const { email, name, avatar } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user if they don't exist
      // Use a truly random password they'll never use for login
      const randomPass = Math.random().toString(36).slice(-10) + Date.now();
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        password: randomPass,
        avatar: avatar || null,
        provider: 'google'
      });
    }

    if (user.status === 'banned') throw new AppError('Your account has been suspended.', 403);

    const token = signToken(user._id);
    return sendSuccess(res, { user, token }, 'Google login successful.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/forgot-password ───────────────────────────────────
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'البريد الإلكتروني غير مسجل في النظام',
      });
    }

    if (user.provider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'هذا الحساب مرتبط بجوجل ولا يمكن تغيير كلمة المرور الخاصة به. يرجى تسجيل الدخول باستخدام جوجل.',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetToken}`;

    // Modern simple email template
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a;">Password Reset</h2>
        <p style="color: #475569; font-size: 16px;">We received a request to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    try {
      let transporter;

      if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          }
        });
      } else {
        // Fallback to Ethereal Email for development/testing
        console.log('No SMTP credentials found in .env, using Ethereal Email for testing...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: `Donation Platform <${process.env.SMTP_EMAIL || 'noreply@example.com'}>`,
        to: user.email,
        subject: 'Reset Your Password - Donation Platform',
        html: htmlMessage,
      });

      if (!process.env.SMTP_EMAIL) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Email Preview URL: %s", previewUrl);
        // During testing without real SMTP, we can just return the URL so the user can click it in the network tab or console
        return sendSuccess(res, { previewUrl }, 'تم إرسال الرابط! تفقد نافذة الأوامر (Console) لرؤية الرابط التجريبي.');
      }

      return sendSuccess(res, null, 'Password reset link sent to email.');
    } catch (err) {
      console.error('Email sending error:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('There was an error sending the email. Check server configuration.', 500));
    }
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/reset-password/:token ─────────────────────────────
async function resetPassword(req, res, next) {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    user.password = undefined; // Don't send back password

    return sendSuccess(res, { user, token }, 'Password reset successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe, googleLogin, forgotPassword, resetPassword };
