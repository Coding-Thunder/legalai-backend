// File: backend/routes/authRoutes.js
/**
 * Auth routes
 *
 * Routes:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 *
 * Notes:
 * - Uses multer for optional logo upload in registration
 * - Validations to be added using Joi (validators.js)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Register route with optional firm logo upload
router.post('/register', uploadMiddleware.single('firmLogo'), authController.register);

// Login
router.post('/login', authController.login);

// Refresh access token
router.post('/refresh', authController.refresh);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
