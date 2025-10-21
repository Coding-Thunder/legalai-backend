// File: backend/routes/draftRoutes.js
/**
 * Draft routes
 *
 * Endpoints:
 * - POST /api/drafts           -> create local draft
 * - GET /api/drafts/:id        -> get draft
 * - PATCH /api/drafts/:id      -> update draft
 *
 * Notes:
 * - Requires authentication
 * - AI-generated drafts handled in /api/ai/draft (aiRoutes)
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const draftController = require('../controllers/draftController');

// Protect all routes
router.use(authMiddleware.protect);

// Create a draft
router.post('/', draftController.createDraft);

// Get a draft by ID
router.get('/:id', draftController.getDraftById);

// Update draft
router.patch('/:id', draftController.updateDraft);

module.exports = router;
