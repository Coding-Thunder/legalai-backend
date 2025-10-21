// File: backend/config/db.js
/**
 * Mongoose connection helper with retry/backoff.
 * Export: connectDB(uri)
 *
 * Notes:
 * - Uses exponential backoff on initial connection attempts.
 * - Adjust retries/backoff via env or here.
 */

const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is not provided');

  // Connection options suited for production
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // keepAlive and poolSize can be tuned per deployment requirements
    serverSelectionTimeoutMS: 5000,
  };

  const maxRetries = Number(process.env.DB_MAX_RETRIES || 5);
  const baseDelay = Number(process.env.DB_BASE_DELAY_MS || 1000);

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(uri, opts);
      // Recommended: set mongoose debug only in development
      if (process.env.NODE_ENV === 'development') mongoose.set('debug', true);
      return mongoose.connection;
    } catch (err) {
      attempt += 1;
      if (attempt > maxRetries) {
        console.error(`MongoDB connection failed after ${attempt - 1} retries`);
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt); // exponential backoff
      console.warn(`MongoDB connection failed (attempt ${attempt}). Retrying in ${delay}ms...`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

module.exports = { connectDB };
