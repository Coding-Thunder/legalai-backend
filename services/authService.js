// File: backend/services/authService.js
/**
 * Auth service
 *
 * Provides JWT token generation and helper methods.
 * Access tokens are short-lived; refresh tokens are long-lived and stored in httpOnly cookies.
 */

const jwt = require('jsonwebtoken');

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

function generateAccessToken(user) {
  // user: { _id, role }
  return jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
