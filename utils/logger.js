// File: backend/utils/logger.js
/**
 * Winston logger configuration
 *
 * Logs to console and optionally to files
 * Can be extended to integrate with Sentry
 */

const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "legal-platform-backend" },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // Uncomment to log to file
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // new transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = logger;
