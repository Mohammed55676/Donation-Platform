/**
 * src/controllers/auth.controller.js
 *
 * OTP-based authentication:
 * - register / login → returns requiresOTP, navigates to /verify-otp
 * - verifyOtp → validates OTP, returns JWT + user
 * - resendOtp → resends OTP to email
 * - forgotPassword → sends OTP for password reset
 * - resetPassword → verifies OTP, sets new password
 * - googleLogin → no OTP (trusted provider)
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

// Cached transporter — created once, reused for every request
let _transporter = null;
async function getTransporter() {
  if (_transporter) return _transporter;
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    _transporter = nodemailer.createTransport({
      service: 'Gmail',
      pool: true,
      auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
    });
    return _transporter;
  }
  console.log('[Email] No SMTP credentials — using Ethereal for testing.');
  const testAccount = await nodemailer.createTestAccount();
  _transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return _transporter;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(to, otp, subject = 'رمز التحقق') {
  const transporter = await getTransporter();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; direction: rtl;">
      <h2 style="color: #0f172a; margin-bottom: 8px;">${subject}</h2>
      <p style="color: #475569; font-size: 15px;">رمز التحقق الخاص بك هو:</p>
      <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #10B981; margin: 24px 0; background: #f0fdf4; padding: 16px; border-radius: 8px;">${otp}</div>
      <p style="color: #94a3b8; font-size: 13px;">صالح لمدة 10 دقائق فقط. لا تشاركه مع أي شخص.</p>
    </div>
  `;
  const info = await transporter.sendMail({
    from: `Donation Platform <${process.env.SMTP_EMAIL || 'noreply@example.com'}>`,
    to,
    subject: `${subject} - Donation Platform`,
    html,
  });
  return info;
}

// Fire-and-forget helper — responds immediately, sends email in background
function sendOtpBackground(email, otp, subject) {
  console.log(`\n=========================================\n[DEV] OTP for ${email}: ${otp}\n=========================================\n`);
  sendOtpEmail(email, otp, subject)
    .then(info => {
      if (!process.env.SMTP_EMAIL) {
        console.log('[Email] Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    })
    .catch(err => console.error('[Email] Failed to send OTP:', err.message));
}

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── POST /api/auth/register ──────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { 
      name, email, password, user_type, phone, 
      location, charityCategory, charityDescription, 
      charityRegistrationNumber, charityLicenseDocument 
    } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('البريد الإلكتروني مسجل مسبقاً.', 409);

    const user = await User.create({
      name,
      email,
      password,
      user_type: user_type || 'donor',
      phone,
      location,
      charityCategory,
      charityDescription,
      charityRegistrationNumber,
      charityLicenseDocument,
      charityStatus: user_type === 'charity' ? 'pending' : null,
      isVerified: user_type === 'charity', // Bypass OTP for charities for now
      status: 'active'
    });

    if (user.user_type === 'charity') {
      const token = signToken(user._id);
      return sendSuccess(res, { token, user, isPendingCharity: true, requiresOTP: false }, 'تم إنشاء الحساب بنجاح. بانتظار مراجعة الإدارة.', 201);
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Respond immediately — OTP is in DB, email goes out in background
    sendSuccess(res, { requiresOTP: true, email: user.email }, 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني.', 201);
    sendOtpBackground(user.email, otp, 'تحقق من بريدك الإلكتروني');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 401);

    const valid = await user.comparePassword(password);
    if (!valid) throw new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 401);

    if (user.status === 'banned') throw new AppError('لقد تم إيقاف حسابك.', 403);

    if (user.user_type === 'charity') {
      const token = signToken(user._id);
      return sendSuccess(res, { token, user }, 'تم تسجيل الدخول بنجاح.');
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Respond immediately — OTP is in DB, email goes out in background
    sendSuccess(res, { requiresOTP: true, email: user.email }, 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.');
    sendOtpBackground(user.email, otp, 'رمز تسجيل الدخول');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/verify-otp ────────────────────────────────────────
async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('المستخدم غير موجود.', 404);

    if (!user.otp || !user.otpExpires) throw new AppError('لم يتم طلب رمز OTP.', 400);
    if (user.otpExpires < new Date()) throw new AppError('انتهت صلاحية رمز التحقق.', 400);
    if (user.otp !== otp) throw new AppError('رمز التحقق غير صحيح.', 400);

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    return sendSuccess(res, { token, user }, 'تم التحقق بنجاح.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/resend-otp ────────────────────────────────────────
async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('المستخدم غير موجود.', 404);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    sendOtpBackground(user.email, otp, 'رمز التحقق الجديد');
    return sendSuccess(res, { message: 'تم إرسال رمز التحقق بنجاح.' });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/logout ────────────────────────────────────────────
async function logout(req, res) {
  return sendSuccess(res, null, 'تم تسجيل الخروج بنجاح.');
}

// ── GET /api/auth/me ─────────────────────────────────────────────────
async function getMe(req, res) {
  return sendSuccess(res, req.user);
}

// ── POST /api/auth/google ────────────────────────────────────────────
async function googleLogin(req, res, next) {
  try {
    const { email, name, avatar, user_type } = req.body;
    if (!email) throw new AppError('البريد الإلكتروني مطلوب.', 400);

    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      const randomPass = `Google_${crypto.randomBytes(12).toString('hex')}Aa1!`;
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        password: randomPass,
        avatar: avatar || null,
        provider: 'google',
        user_type: user_type || 'donor',
        isVerified: true,
      });
      isNewUser = true;
    }

    if (user.status === 'banned') throw new AppError('لقد تم إيقاف حسابك.', 403);

    const token = signToken(user._id);
    return sendSuccess(res, { user, token, isNewUser }, 'تم تسجيل الدخول بواسطة جوجل بنجاح.');
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
      return res.status(404).json({ success: false, message: 'البريد الإلكتروني غير مسجل في النظام' });
    }

    if (user.provider === 'google') {
      return res.status(400).json({ success: false, message: 'هذا الحساب مرتبط بجوجل. يرجى تسجيل الدخول باستخدام جوجل.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Respond immediately — OTP is in DB, email goes out in background
    sendSuccess(res, { email: user.email }, 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.');
    sendOtpBackground(user.email, otp, 'إعادة تعيين كلمة المرور');
  } catch (err) {
    next(err);
  }
}
// ── POST /api/auth/validate-reset-otp ───────────────────────────────
async function validateResetOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('المستخدم غير موجود.', 404);

    if (!user.otp || !user.otpExpires) throw new AppError('لم يتم طلب رمز إعادة التعيين.', 400);
    if (user.otpExpires < new Date()) throw new AppError('انتهت صلاحية رمز التحقق.', 400);
    if (user.otp !== otp) throw new AppError('رمز التحقق غير صحيح.', 400);

    // We don't clear the OTP here because we need it for the final reset step
    return sendSuccess(res, null, 'رمز التحقق صحيح.');
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/reset-password ────────────────────────────────────
async function resetPassword(req, res, next) {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('المستخدم غير موجود.', 404);

    if (!user.otp || !user.otpExpires) throw new AppError('لم يتم طلب رمز إعادة التعيين.', 400);
    if (user.otpExpires < new Date()) throw new AppError('انتهت صلاحية رمز التحقق.', 400);
    if (user.otp !== otp) throw new AppError('رمز التحقق غير صحيح.', 400);

    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return sendSuccess(res, null, 'تم إعادة تعيين كلمة المرور بنجاح.');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe, googleLogin, forgotPassword, validateResetOtp, resetPassword, verifyOtp, resendOtp };
