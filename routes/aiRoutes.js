// File: backend/routes/aiRoutes.js
/**
 * AI routes
 *
 * Endpoint:
 * - POST /api/ai/draft  -> Generate AI draft via RAG pipeline
 *
 * Notes:
 * - Heavily rate-limited
 * - Requires authentication
 * - Calls aiService to generate draft
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// Protect all routes
router.use(authMiddleware.protect);

// Generate AI draft
router.post('/draft', aiController.generateAIDraft);

module.exports = router;
