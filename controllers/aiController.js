// File: backend/controllers/aiController.js
/**
 * AI Controller
 *
 * Handles AI-generated drafts via RAG pipeline.
 * Inputs: caseId, petitionType, facts
 *
 * Notes:
 * - Calls pluggable aiService
 * - Emits socket event to lawyer after draft creation
 * - Rate-limiting should be applied at route level (not shown here)
 */

const aiService = require('../services/aiService');
const Draft = require('../models/Draft');

exports.generateAIDraft = async (req, res, next) => {
  try {
    const { caseId, petitionType, facts } = req.body;

    // Call AI service to generate draft content
    const aiResult = await aiService.generateDraft({
      caseId,
      lawyerId: req.user._id,
      petitionType,
      facts,
    });

    // Save draft in DB as DRAFT
    const draft = await Draft.create({
      caseId,
      lawyerId: req.user._id,
      petitionType,
      content: aiResult.content,
      status: 'DRAFT',
      aiMetadata: aiResult.aiMetadata,
    });

    // Emit socket event to lawyer
    const io = req.app.get('io');
    if (io) io.to(`user:${req.user._id}`).emit('draft:created', draft);

    res.status(201).json(draft);
  } catch (err) {
    next(err);
  }
};
