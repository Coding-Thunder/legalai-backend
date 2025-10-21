// File: backend/models/Case.js
/**
 * Mongoose Case model
 *
 * Fields:
 * - title, description
 * - status: OPEN | IN_PROGRESS | CLOSED
 * - jurisdiction, courtName
 * - lawyer (User), client (User)
 * - attachments [{ url, name, provider }]
 * - timestamps
 */

const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String },
  provider: { type: String },
});

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
      default: 'OPEN',
    },
    jurisdiction: { type: String },
    courtName: { type: String },
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

// Indexes for performance
caseSchema.index({ lawyer: 1 });
caseSchema.index({ client: 1 });

module.exports = mongoose.model('Case', caseSchema);
