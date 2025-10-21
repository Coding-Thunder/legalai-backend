// File: backend/models/Payment.js
/**
 * Mongoose Payment model
 *
 * Fields:
 * - userId
 * - provider: RAZORPAY | STRIPE
 * - amount, currency
 * - providerPaymentId, providerOrderId
 * - status: PENDING | SUCCESS | FAILED
 * - timestamps
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['RAZORPAY', 'STRIPE'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    providerPaymentId: { type: String },
    providerOrderId: { type: String },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
