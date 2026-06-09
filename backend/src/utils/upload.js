/**
 * src/utils/upload.js
 * Multer disk-storage configuration for National ID document uploads.
 *
 * Files are stored at: backend/uploads/national-ids/
 * Allowed types: image/jpeg, image/png, image/webp
 * Max size: 3 MB
 */
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');

// Ensure the upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/national-ids');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    // Safe unique filename: timestamp + random UUID + original extension
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مسموح به. يُرجى رفع صورة بصيغة JPEG أو PNG أو WebP.'), false);
  }
};

const uploadNationalId = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
}).single('national_id_document');

/**
 * Express middleware wrapper that converts Multer errors to app errors.
 * Usage: router.post('/', nationalIdUploadMiddleware, handler)
 */
function nationalIdUploadMiddleware(req, res, next) {
  uploadNationalId(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'حجم الملف يتجاوز الحد المسموح به (3 ميجابايت).',
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    // fileFilter rejection or other error
    return res.status(400).json({ success: false, error: err.message });
  });
}

module.exports = { nationalIdUploadMiddleware, UPLOAD_DIR };

// ── Proof documents upload (optional multi-file upload for verification) ──
// NOTE: For production hosting, migrate to Cloudinary/S3 or persistent storage.
const PROOF_UPLOAD_DIR = path.join(__dirname, '../../uploads/proof-documents');
if (!fs.existsSync(PROOF_UPLOAD_DIR)) {
  fs.mkdirSync(PROOF_UPLOAD_DIR, { recursive: true });
}

const PROOF_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const proofStorage = multer.diskStorage({
  destination(_req, _file, cb) { cb(null, PROOF_UPLOAD_DIR); },
  filename(_req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const proofUpload = multer({
  storage: proofStorage,
  fileFilter: (_req, file, cb) => {
    if (PROOF_ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('نوع الملف غير مسموح. يُرجى رفع صورة أو PDF.'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
}).array('proof_documents', 5); // max 5 files

function proofDocumentsUploadMiddleware(req, res, next) {
  proofUpload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'حجم الملف يتجاوز الحد المسموح (5 ميجابايت).' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, error: 'الحد الأقصى 5 ملفات مثبتة.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(400).json({ success: false, error: err.message });
  });
}

module.exports.proofDocumentsUploadMiddleware = proofDocumentsUploadMiddleware;
module.exports.PROOF_UPLOAD_DIR = PROOF_UPLOAD_DIR;
