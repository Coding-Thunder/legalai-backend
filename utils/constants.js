// File: backend/utils/constants.js
/**
 * Application-wide constants
 */

module.exports = {
  ROLES: {
    LAWYER: "LAWYER",
    CLIENT: "CLIENT",
  },
  CASE_STATUS: {
    OPEN: "OPEN",
    IN_PROGRESS: "IN_PROGRESS",
    CLOSED: "CLOSED",
  },
  DRAFT_STATUS: {
    DRAFT: "DRAFT",
    SUBMITTED: "SUBMITTED",
    APPROVED: "APPROVED",
  },
  PAYMENT_PROVIDER: {
    RAZORPAY: "RAZORPAY",
    STRIPE: "STRIPE",
  },
  PAYMENT_STATUS: {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
  },
};
