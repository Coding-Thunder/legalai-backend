// File: backend/middleware/rateLimit.js
/**
 * Rate limiting middleware
 *
 * Use to protect endpoints like /api/ai/draft
 */

const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});

const aiDraftLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 AI draft requests per user per hour
  message: { error: 'AI draft rate limit exceeded. Try again later.' },
  keyGenerator: (req) => req.user._id.toString(), // limit per user
});

module.exports = {
  generalLimiter,
  aiDraftLimiter,
};
