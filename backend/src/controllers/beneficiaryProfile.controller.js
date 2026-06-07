/**
 * src/controllers/beneficiaryProfile.controller.js
 *
 * GET    /api/beneficiary/profile                     — Get my profile (auth)
 * POST   /api/beneficiary/profile                     — Submit/update verification (beneficiary)
 * GET    /api/beneficiary/admin/profiles              — List all profiles (admin)
 * PUT    /api/beneficiary/admin/profiles/:id/status   — Approve/reject/block (admin)
 * GET    /api/beneficiary/admin/profiles/:id/document — Serve ID document file (admin)
 */
const path = require('path');
const fs   = require('fs');

const BeneficiaryProfile = require('../models/BeneficiaryProfile.model');
const User               = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');
const { UPLOAD_DIR } = require('../utils/upload');

// ── GET /api/beneficiary/profile ────────────────────────────────────
/**
 * Returns the logged-in user's beneficiary profile.
 * If no profile exists, returns a clear not-found payload (not a 404 error)
 * so the frontend can differentiate "no profile" from auth failures.
 */
async function getMyProfile(req, res, next) {
  try {
    const profile = await BeneficiaryProfile.findOne({ user_id: req.user._id });
    if (!profile) {
      return sendSuccess(res, null, 'لا يوجد ملف تحقق. يرجى تقديم وثائق الهوية.', 200);
    }
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/beneficiary/profile ────────────────────────────────────
/**
 * Creates or updates the logged-in beneficiary's profile.
 * Accepts multipart/form-data with: national_id_number + national_id_document (file)
 * + extended verification fields + optional proof_documents (files).
 * Sets status to pending_review on every submission.
 */
async function submitVerification(req, res, next) {
  try {
    // Only beneficiaries can submit
    if (req.user.user_type !== 'beneficiary') {
      throw new AppError('هذه الميزة للمستفيدين فقط.', 403);
    }

    const { national_id_number } = req.body;
    if (!national_id_number || !national_id_number.trim()) {
      throw new AppError('رقم الهوية الوطنية مطلوب.', 400);
    }

    // Consent is required
    if (!req.body.consent_given || req.body.consent_given === 'false') {
      throw new AppError('يجب الموافقة على شروط استخدام البيانات.', 400);
    }

    // national_id_document is in req.file (single file from nationalIdUploadMiddleware)
    // proof_documents are in req.files (array from proofDocumentsUploadMiddleware)
    // Since we chain middlewares, we need to handle the case where the first middleware set req.file
    if (!req.file) {
      // If updating, the file may already exist — only require it on first submit
      const existing = await BeneficiaryProfile.findOne({ user_id: req.user._id });
      if (!existing) {
        throw new AppError('وثيقة الهوية الوطنية مطلوبة.', 400);
      }
    }

    // Check if another user already registered the same national ID
    const duplicateId = await BeneficiaryProfile.findOne({
      national_id_number: national_id_number.trim(),
      user_id: { $ne: req.user._id },
    });
    if (duplicateId) {
      // Remove the uploaded files to avoid orphans
      if (req.file) fs.unlink(req.file.path, () => {});
      if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
      throw new AppError(
        'رقم الهوية الوطنية هذا مسجل بالفعل. إذا اعتقدت أن هذا خطأ، يرجى التواصل مع الإدارة.',
        409
      );
    }

    const existing = await BeneficiaryProfile.findOne({ user_id: req.user._id });

    // Build the update object with extended fields
    const updateData = {
      national_id_number: national_id_number.trim(),
      verification_status: 'pending_review',
      verification_rejection_reason: null,
      consent_given: true,
    };

    // Extended fields — safely parse from body
    const textFields = [
      'phone', 'city', 'address', 'employment_status', 'housing_status',
      'monthly_income_range', 'monthly_rent_range', 'social_security_status',
      'naf_support_status', 'situation_explanation', 'delivery_ability',
    ];
    textFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field] || null;
    });

    if (req.body.family_members) {
      updateData.family_members = parseInt(req.body.family_members, 10) || null;
    }

    if (req.body.needs_categories) {
      try {
        updateData.needs_categories = typeof req.body.needs_categories === 'string'
          ? JSON.parse(req.body.needs_categories)
          : req.body.needs_categories;
      } catch { updateData.needs_categories = []; }
    }

    // Handle national ID document file
    if (req.file) {
      updateData.national_id_document               = req.file.path;
      updateData.national_id_document_original_name  = req.file.originalname;
      updateData.national_id_document_mime_type       = req.file.mimetype;
      updateData.national_id_document_size            = req.file.size;
    }

    // Handle proof documents (optional array)
    if (req.files && req.files.length > 0) {
      updateData.proof_documents = req.files.map(f => f.path);
    }

    if (existing) {
      // Delete old national ID document if a new one is uploaded
      if (req.file && existing.national_id_document && existing.national_id_document !== req.file.path) {
        fs.unlink(existing.national_id_document, () => {});
      }
      // Delete old proof documents if new ones are uploaded
      if (req.files && req.files.length > 0 && existing.proof_documents?.length > 0) {
        existing.proof_documents.forEach(p => fs.unlink(p, () => {}));
      }

      Object.assign(existing, updateData);
      await existing.save();

      // Sync status to User model
      await User.findByIdAndUpdate(req.user._id, {
        verification_status: 'pending_review',
        beneficiaryStatus: 'pending_admin',
      });

      return sendSuccess(res, existing, 'تم تحديث بيانات التحقق. سيتم مراجعة طلبك قريباً.');
    }

    const profile = await BeneficiaryProfile.create({
      user_id: req.user._id,
      ...updateData,
    });

    // Sync status to User model
    await User.findByIdAndUpdate(req.user._id, {
      verification_status: 'pending_review',
      beneficiaryStatus: 'pending_admin',
    });

    return sendSuccess(res, profile, 'تم إرسال طلب التحقق، انتظر مراجعة الإدارة.', 201);
  } catch (err) {
    // Clean up uploaded files on any error
    if (req.file) fs.unlink(req.file.path, () => {});
    if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
    next(err);
  }
}

// ── GET /api/beneficiary/admin/profiles ──────────────────────────────
/**
 * Lists all beneficiary verification profiles for admin review.
 * Optional ?status= filter.
 */
async function adminListProfiles(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.verification_status = req.query.status;

    const profiles = await BeneficiaryProfile.find(filter)
      .populate('user_id', 'name email user_type status createdAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, profiles, 'Profiles retrieved.');
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/beneficiary/admin/profiles/:id/status ───────────────────
/**
 * Admin approves (trusted), rejects, or blocks a beneficiary profile.
 */
async function adminUpdateStatus(req, res, next) {
  try {
    const { verification_status, verification_rejection_reason } = req.body;

    const allowed = ['trusted', 'rejected', 'blocked'];
    if (!allowed.includes(verification_status)) {
      throw new AppError(`الحالة يجب أن تكون: ${allowed.join(' | ')}.`, 400);
    }
    if (verification_status === 'rejected' && !verification_rejection_reason?.trim()) {
      throw new AppError('سبب الرفض مطلوب عند رفض طلب التحقق.', 400);
    }

    const profile = await BeneficiaryProfile.findById(req.params.id);
    if (!profile) throw new AppError('الملف الشخصي غير موجود.', 404);

    profile.verification_status = verification_status;
    profile.verification_rejection_reason =
      verification_status === 'rejected' ? verification_rejection_reason.trim() : null;
    profile.verified_at = verification_status === 'trusted' ? new Date() : null;

    await profile.save();
    await profile.populate('user_id', 'name email');

    // Map profile status → User.beneficiaryStatus
    const beneficiaryStatusMap = {
      trusted:  'verified',
      rejected: 'rejected',
      blocked:  'rejected',
    };

    await User.findByIdAndUpdate(profile.user_id._id || profile.user_id, {
      verification_status,
      beneficiaryStatus: beneficiaryStatusMap[verification_status] || 'pending_admin',
      verifiedBy: verification_status === 'trusted' ? 'admin' : null,
    });

    return sendSuccess(res, profile, 'تم تحديث حالة التحقق.');
  } catch (err) {
    next(err);
  }
}

// ── GET /api/beneficiary/admin/profiles/:id/document ─────────────────
/**
 * Securely serves the National ID document file to admins only.
 * Files are NOT served as static public assets.
 */
async function adminGetDocument(req, res, next) {
  try {
    const profile = await BeneficiaryProfile.findById(req.params.id);
    if (!profile) throw new AppError('الملف الشخصي غير موجود.', 404);
    if (!profile.national_id_document) throw new AppError('لا توجد وثيقة مرفوعة.', 404);

    const filePath = path.resolve(profile.national_id_document);
    if (!fs.existsSync(filePath)) {
      throw new AppError('الملف غير موجود على الخادم.', 404);
    }

    const mime = profile.national_id_document_mime_type || 'application/octet-stream';
    const name = profile.national_id_document_original_name || 'national_id';
    res.set('Content-Type', mime);
    res.set('Content-Disposition', `inline; filename="${encodeURIComponent(name)}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyProfile,
  submitVerification,
  adminListProfiles,
  adminUpdateStatus,
  adminGetDocument,
  adminGetProofDocument,
};

// ── GET /api/beneficiary/admin/profiles/:id/proof/:index ─────────────
/**
 * Securely serves an optional proof document file to admins only.
 */
async function adminGetProofDocument(req, res, next) {
  try {
    const profile = await BeneficiaryProfile.findById(req.params.id);
    if (!profile) throw new AppError('الملف الشخصي غير موجود.', 404);

    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0 || idx >= (profile.proof_documents?.length || 0)) {
      throw new AppError('المستند غير موجود.', 404);
    }

    const filePath = path.resolve(profile.proof_documents[idx]);
    if (!fs.existsSync(filePath)) {
      throw new AppError('الملف غير موجود على الخادم.', 404);
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf' };
    res.set('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="proof_${idx}${ext}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}
