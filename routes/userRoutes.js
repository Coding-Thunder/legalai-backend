// File: backend/routes/userRoutes.js
/**
 * User routes
 *
 * Routes:
 * - GET /api/users/me
 * - PATCH /api/users/me
 *
 * Notes:
 * - Requires authentication middleware
 * - PATCH allows updating profile fields and firm logo
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Get current user
router.get('/me', userController.getMe);

// Update current user
router.patch('/me', uploadMiddleware.single('firmLogo'), userController.updateMe);

module.exports = router;
