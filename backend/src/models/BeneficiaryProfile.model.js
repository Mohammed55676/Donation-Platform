/**
 * src/models/BeneficiaryProfile.model.js
 *
 * Stores National ID verification data for beneficiary users.
 * One profile per user (unique user_id).
 * Document is stored as a file path — NOT base64.
 */
const mongoose = require('mongoose');

const beneficiaryProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    national_id_number: {
      type: String,
      required: [true, 'رقم الهوية الوطنية مطلوب'],
      unique: true,
      trim: true,
    },
    // Filesystem path to the uploaded ID document
    national_id_document: {
      type: String,
      required: [true, 'وثيقة الهوية الوطنية مطلوبة'],
    },
    national_id_document_original_name: { type: String, default: null },
    national_id_document_mime_type:     { type: String, default: null },
    national_id_document_size:          { type: Number, default: null },

    // ── Extended verification profile ──────────────────────────────────
    phone:                  { type: String, default: null },
    city:                   { type: String, trim: true, default: null },
    address:                { type: String, trim: true, default: null },    // PRIVATE — admin only
    family_members:         { type: Number, min: 1, default: null },
    monthly_income_range: {
      type: String,
      enum: ['لا يوجد دخل', 'أقل من 200 دينار', '200 - 400 دينار', '400 - 600 دينار', 'أكثر من 600 دينار'],
      default: null,
    },
    employment_status: {
      type: String,
      enum: ['موظف', 'عاطل عن العمل', 'متقاعد', 'عمل حر', 'طالب', 'أخرى'],
      default: null,
    },
    housing_status: {
      type: String,
      enum: ['ملك', 'إيجار', 'مع العائلة', 'أخرى'],
      default: null,
    },
    monthly_rent_range: {
      type: String,
      enum: ['لا يوجد إيجار', 'أقل من 100 دينار', '100 - 200 دينار', '200 - 300 دينار', 'أكثر من 300 دينار'],
      default: null,
    },
    social_security_status: {
      type: String,
      enum: ['مشترك', 'غير مشترك', 'غير متأكد'],
      default: null,
    },
    naf_support_status: {
      type: String,
      enum: ['يتلقى دعم', 'لا يتلقى دعم', 'غير متأكد'],
      default: null,
    },
    situation_explanation: { type: String, trim: true, maxlength: 1000, default: null },
    needs_categories: {
      type: [String],
      default: [],
    },
    delivery_ability: {
      type: String,
      enum: ['يمكنني الاستلام', 'أحتاج توصيل', 'حسب المسافة'],
      default: null,
    },
    consent_given:  { type: Boolean, default: false },

    /**
     * Optional proof documents — file paths stored on disk.
     * NOTE: For production, migrate to Cloudinary/S3 or another persistent storage provider.
     */
    proof_documents: { type: [String], default: [] },

    verification_status: {
      type: String,
      enum: ['not_verified', 'pending_review', 'trusted', 'rejected', 'blocked'],
      default: 'not_verified',
    },
    verification_rejection_reason: { type: String, default: null },
    verified_at: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for quick admin queries by status
beneficiaryProfileSchema.index({ verification_status: 1 });

beneficiaryProfileSchema.set('toJSON', {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('BeneficiaryProfile', beneficiaryProfileSchema);
