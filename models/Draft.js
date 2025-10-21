// File: backend/models/Draft.js
/**
 * Mongoose Draft model
 *
 * Fields:
 * - caseId, lawyerId
 * - petitionType
 * - content
 * - status: DRAFT | SUBMITTED | APPROVED
 * - aiMetadata: { model, vectorSource, tokensUsed }
 * - timestamps
 */

const mongoose = require("mongoose");

const aiMetadataSchema = new mongoose.Schema({
  model: { type: String },
  vectorSource: { type: String },
  tokensUsed: { type: Number },
});

const draftSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petitionType: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED"],
      default: "DRAFT",
    },
    aiMetadata: aiMetadataSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Draft", draftSchema);
