// File: backend/controllers/paymentController.js
/**
 * Payment controller
 *
 * Handles:
 * - initiateRazorpay
 * - createStripePaymentIntent
 * - handleWebhook
 *
 * Notes:
 * - Emits socket events to user on payment success
 * - Updates subscription after successful payment
 * - TODO: Add Razorpay signature verification and Stripe webhook signature verification
 */

const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');

exports.initiateRazorpay = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    const order = await paymentService.createRazorpayOrder({ amount, currency, userId: req.user._id });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    const paymentIntent = await paymentService.createStripePaymentIntent({ amount, currency, userId: req.user._id });

    res.json(paymentIntent);
  } catch (err) {
    next(err);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    // Pass raw body to service for signature verification
    const event = await paymentService.handleWebhook(req);

    // Example: On successful payment, update subscription
    if (event && event.type === 'payment.success') {
      const { userId, paymentId } = event.data;

      // Update subscription (simplified)
      // TODO: Update subscription plan, startDate, endDate
      const io = req.app.get('io');
      if (io) io.to(`user:${userId}`).emit('payment:success', { paymentId });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};
