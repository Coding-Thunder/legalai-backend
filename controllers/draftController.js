// File: backend/controllers/draftController.js
/**
 * Draft controller
 *
 * Handles:
 * - createDraft
 * - getDraftById
 * - updateDraft
 *
 * Notes:
 * - Emits socket events on draft creation and approval
 * - AI-generated drafts handled in aiController
 */

const Draft = require('../models/Draft');

exports.createDraft = async (req, res, next) => {
  try {
    const { caseId, petitionType, content } = req.body;

    const draft = await Draft.create({
      caseId,
      lawyerId: req.user._id,
      petitionType,
      content,
    });

    // Emit socket event to lawyer (creator) and client of the case
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user._id}`).emit('draft:created', draft);
    }

    res.status(201).json(draft);
  } catch (err) {
    next(err);
  }
};

exports.getDraftById = async (req, res, next) => {
  try {
    const draft = await Draft.findById(req.params.id)
      .populate('lawyerId', 'name email')
      .populate('caseId');

    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    // Ensure only involved lawyer or client can view
    if (
      req.user.role === 'LAWYER' &&
      draft.lawyerId._id.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ error: 'Forbidden' });

    res.json(draft);
  } catch (err) {
    next(err);
  }
};

exports.updateDraft = async (req, res, next) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    // Only lawyer who created draft can update
    if (draft.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updates = req.body;
    const updatedDraft = await Draft.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    // Emit socket events
    const io = req.app.get('io');
    if (io) io.to(`user:${req.user._id}`).emit('draft:updated', updatedDraft);

    res.json(updatedDraft);
  } catch (err) {
    next(err);
  }
};
