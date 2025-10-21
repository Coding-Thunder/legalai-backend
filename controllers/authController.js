// File: backend/controllers/authController.js
/**
 * Authentication controller
 *
 * Endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 *
 * Notes:
 * - Uses JWT access + refresh tokens.
 * - Refresh tokens are stored in httpOnly cookies.
 * - Password hashing handled in User model (pre-save).
 * - Validations will be added using Joi in routes.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../services/authService');

// Helper to set refresh token cookie
function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, country, barNumber, isFirm, firmName, firmLogoUrl } =
      req.body;

    // Validation: lawyers must provide barNumber
    if (role === 'LAWYER' && !barNumber) {
      return res.status(400).json({ error: 'barNumber is required for lawyers' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const user = new User({
      name,
      email,
      password,
      role,
      country,
      barNumber,
      isFirm,
      firmName,
      firmLogoUrl,
    });

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token provided' });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, payload) => {
      if (err) return res.status(403).json({ error: 'Invalid refresh token' });

      const accessToken = generateAccessToken({ _id: payload._id, role: payload.role });
      res.json({ accessToken });
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};
