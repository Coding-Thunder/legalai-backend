// File: backend/middleware/uploadMiddleware.js
/**
 * Multer middleware for handling file uploads
 *
 * Notes:
 * - For firm logos, case attachments, etc.
 * - Files will be processed by uploadService before storing on S3/Cloudinary
 */

const multer = require('multer');
const path = require('path');

// Use memory storage so file buffer can be sent to S3/Cloudinary
const storage = multer.memoryStorage();

// File filter to accept images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'));
  }
};

// Max file size: 5MB default
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
