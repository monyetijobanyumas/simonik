// ============================================================
// SIMONIK - Upload Middleware
// File: src/middlewares/upload.js
// Deskripsi: Konfigurasi multer untuk upload foto
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format nama: report-{reportId}-{timestamp}-{random}.{ext}
    const reportId = req.params.id || 'new';
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `report-${reportId}-${timestamp}-${random}${ext}`;
    cb(null, filename);
  },
});

// Filter tipe file — hanya gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file JPG, PNG, atau WEBP yang diizinkan'), false);
  }
};

// Batas ukuran: 5MB
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

// Export middleware
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;