// File: backend/controllers/caseController.js
/**
 * Case controller
 *
 * Handles:
 * - createCase
 * - getCases (role-aware)
 * - getCaseById
 * - updateCase
 *
 * Notes:
 * - Emits socket events on case updates via req.app.get('io')
 * - File attachments are uploaded via uploadService
 */

const Case = require('../models/Case');
const uploadService = require('../services/uploadService');

exports.createCase = async (req, res, next) => {
  try {
    const { title, description, jurisdiction, courtName, lawyer, client } = req.body;

    const attachments = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const uploaded = await uploadService.uploadFile(file);
        attachments.push({ url: uploaded.url, name: file.originalname, provider: uploaded.provider });
      }
    }

    const newCase = await Case.create({
      title,
      description,
      jurisdiction,
      courtName,
      lawyer,
      client,
      attachments,
    });

    // Emit socket event to involved users
    const io = req.app.get('io');
    if (io) {
      if (lawyer) io.to(`user:${lawyer}`).emit('case:created', newCase);
      if (client) io.to(`user:${client}`).emit('case:created', newCase);
    }

    res.status(201).json(newCase);
  } catch (err) {
    next(err);
  }
};

exports.getCases = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'LAWYER') {
      filter.lawyer = req.user._id;
    } else if (req.user.role === 'CLIENT') {
      filter.client = req.user._id;
    }

    const cases = await Case.find(filter)
      .populate('lawyer', 'name email firmName')
      .populate('client', 'name email');

    res.json(cases);
  } catch (err) {
    next(err);
  }
};

exports.getCaseById = async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id)
      .populate('lawyer', 'name email firmName')
      .populate('client', 'name email');

    if (!c) return res.status(404).json({ error: 'Case not found' });

    // Ensure only involved users can access
    if (req.user.role === 'LAWYER' && c.lawyer._id.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'CLIENT' && c.client._id.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Forbidden' });

    res.json(c);
  } catch (err) {
    next(err);
  }
};

exports.updateCase = async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Case not found' });

    // Only involved lawyer or client can update
    if (
      req.user.role === 'LAWYER' &&
      c.lawyer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (
      req.user.role === 'CLIENT' &&
      c.client.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updates = { ...req.body };

    if (req.files && req.files.length) {
      updates.attachments = c.attachments || [];
      for (const file of req.files) {
        const uploaded = await uploadService.uploadFile(file);
        updates.attachments.push({ url: uploaded.url, name: file.originalname, provider: uploaded.provider });
      }
    }

    const updatedCase = await Case.findByIdAndUpdate(req.params.id, updates, { new: true });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      if (c.lawyer) io.to(`user:${c.lawyer}`).emit('case:updated', updatedCase);
      if (c.client) io.to(`user:${c.client}`).emit('case:updated', updatedCase);
    }

    res.json(updatedCase);
  } catch (err) {
    next(err);
  }
};
