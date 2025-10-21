// File: backend/routes/caseRoutes.js
/**
 * Case routes
 *
 * Endpoints:
 * - POST /api/cases
 * - GET /api/cases
 * - GET /api/cases/:id
 * - PATCH /api/cases/:id
 *
 * Notes:
 * - Role-aware: Lawyers see their cases, clients see their cases
 * - Requires authMiddleware.protect
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const caseController = require('../controllers/caseController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Create a case (lawyer or client)
router.post('/', uploadMiddleware.array('attachments', 5), caseController.createCase);

// Get list of cases (role-aware)
router.get('/', caseController.getCases);

// Get single case
router.get('/:id', caseController.getCaseById);

// Update case (PATCH)
router.patch('/:id', uploadMiddleware.array('attachments', 5), caseController.updateCase);

module.exports = router;
