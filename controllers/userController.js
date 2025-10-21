// File: backend/controllers/userController.js
/**
 * User controller
 *
 * Endpoints:
 * - GET /api/users/me
 * - PATCH /api/users/me
 *
 * Notes:
 * - Requires authentication middleware.
 * - Allows profile updates including firmLogo upload.
 * - Firm logo upload handled via uploadService (S3/Cloudinary).
 */

const User = require('../models/User');
const uploadService = require('../services/uploadService');

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Handle firmLogo upload if file present
    if (req.file) {
      const uploadResult = await uploadService.uploadFile(req.file);
      updates.firmLogoUrl = uploadResult.url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
