// File: backend/utils/validators.js
/**
 * Joi validators for various endpoints
 */

const Joi = require('joi');

const registerValidator = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('LAWYER', 'CLIENT').required(),
  country: Joi.string().valid('US', 'INDIA').required(),
  barNumber: Joi.when('role', {
    is: 'LAWYER',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  isFirm: Joi.boolean(),
  firmName: Joi.when('isFirm', { is: true, then: Joi.string().required(), otherwise: Joi.optional() }),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
});

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const caseValidator = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  jurisdiction: Joi.string().optional(),
  courtName: Joi.string().optional(),
  lawyer: Joi.string().optional(),
  client: Joi.string().optional(),
});

const draftValidator = Joi.object({
  caseId: Joi.string().required(),
  petitionType: Joi.string().required(),
  content: Joi.any().required(),
});

const paymentValidator = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).required(),
});

module.exports = {
  registerValidator,
  loginValidator,
  caseValidator,
  draftValidator,
  paymentValidator,
};
