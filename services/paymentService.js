// File: backend/services/paymentService.js
/**
 * Payment service
 *
 * Provides helper functions for:
 * - Razorpay order creation
 * - Stripe PaymentIntent creation
 * - Webhook handling
 *
 * TODO:
 * - Add proper signature verification for Razorpay and Stripe
 */

const Razorpay = require("razorpay");
const Stripe = require("stripe");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createRazorpayOrder = async ({ amount, currency, userId }) => {
  const options = {
    amount: amount * 100, // amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  // Save to DB
  const payment = await Payment.create({
    userId,
    provider: "RAZORPAY",
    amount,
    currency,
    providerOrderId: order.id,
    status: "PENDING",
  });

  return { order, paymentId: payment._id };
};

exports.createStripePaymentIntent = async ({ amount, currency, userId }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // in cents
    currency,
  });

  const payment = await Payment.create({
    userId,
    provider: "STRIPE",
    amount,
    currency,
    providerPaymentId: paymentIntent.id,
    status: "PENDING",
  });

  return { clientSecret: paymentIntent.client_secret, paymentId: payment._id };
};

exports.handleWebhook = async (req) => {
  // TODO: Verify signature for Stripe or Razorpay
  // Example return format:
  // { type: 'payment.success', data: { userId, paymentId } }
  return req.body; // placeholder
};
