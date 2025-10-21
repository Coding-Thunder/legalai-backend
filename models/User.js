// File: backend/models/User.js
/**
 * Mongoose User model
 *
 * Fields:
 * - name, email (unique), password (hashed)
 * - role: 'LAWYER' | 'CLIENT'
 * - country: 'INDIA' | 'US'
 * - barNumber (required for lawyers)
 * - isFirm, firmName, firmLogoUrl
 * - phone, address
 * - subscription: { plan, status, startDate, endDate }
 *
 * Includes:
 * - password hashing with bcryptjs
 * - comparePassword instance method
 * - toJSON transform to hide password & __v
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    plan: { type: String, default: null },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'CANCELLED'], default: 'INACTIVE' },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['LAWYER', 'CLIENT'], required: true },
    country: { type: String, enum: ['INDIA', 'US'], default: 'INDIA' },
    barNumber: { type: String }, // required validation enforced at controller level for lawyers
    isFirm: { type: Boolean, default: false },
    firmName: { type: String },
    firmLogoUrl: { type: String },
    phone: { type: String },
    address: { type: String },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    // Optionally store hashed refresh tokens or revocation list elsewhere
  },
  { timestamps: true }
);

// Hide sensitive fields when converting to JSON
UserSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// Pre-save: hash password if modified
UserSchema.pre('save', async function preSave(next) {
  try {
    if (!this.isModified('password')) return next();
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for common queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);
