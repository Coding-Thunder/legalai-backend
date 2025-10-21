// File: backend/middleware/countryMiddleware.js
/**
 * Country middleware
 *
 * Sets country context based on user or request header
 * Can be used for payments, subscriptions, or AI behavior
 */

exports.setCountryContext = (req, res, next) => {
  if (req.user && req.user.country) {
    req.country = req.user.country;
  } else if (req.headers['x-country']) {
    req.country = req.headers['x-country'];
  } else {
    req.country = 'US'; // default
  }
  next();
};
