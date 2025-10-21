// File: backend/routes/paymentRoutes.js
/**
 * Payment routes
 *
 * Endpoints:
 * - POST /api/payments/razorpay/initiate
 * - POST /api/payments/stripe/create-payment-intent
 * - POST /api/payments/webhook
 *
 * Notes:
 * - Requires authentication
 * - Webhook handles both Stripe and Razorpay events
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Protect all routes
router.use(authMiddleware.protect);

// Razorpay initiate
router.post('/razorpay/initiate', paymentController.initiateRazorpay);

// Stripe payment intent
router.post('/stripe/create-payment-intent', paymentController.createStripePaymentIntent);

// Webhook (Stripe & Razorpay)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
