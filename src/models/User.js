// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['admin', 'customer', 'user'],
      default: "user"
    },
    plan: { type: String, default: "free" },

    /* -----------------------------------
     * SUBSCRIPTION MANAGEMENT FOR CUSTOMERS
     * -----------------------------------
     * Only applicable for users with role: 'customer'
     */
    subscription: {
      type: {
        plan: {
          type: String,
          enum: ['monthly', 'yearly', 'none'],
          default: 'none'
        },
        status: {
          type: String,
          enum: ['active', 'expired', 'cancelled', 'pending'],
          default: 'pending'
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        autoRenew: { type: Boolean, default: false },
        // Payment details can be extended later
        paymentId: { type: String, default: null },
        amount: { type: Number, default: 0 }
      },
      default: () => ({
        plan: 'none',
        status: 'pending',
        startDate: null,
        endDate: null,
        autoRenew: false,
        paymentId: null,
        amount: 0
      })
    },

    /* -----------------------------------
     * OTP SYSTEM FOR MULTIPLE PURPOSES
     * -----------------------------------
     * otp: stores the 6-digit OTP
     * otpType: "reset-password" | "email-verify" etc.
     * otpExpires: expiry timestamp
     */
    otp: { type: String, default: null },
    otpType: { type: String, default: null },
    otpExpires: { type: Date, default: null },

    // Email verification status
    isEmailVerified: { type: Boolean, default: false },

    // Customer specific fields
    phone: { type: String, default: null },
    company: { type: String, default: null },
    address: {
      type: {
        street: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        zipCode: { type: String, default: null }
      },
      default: {}
    },

    // Catalogue limit for customers
    catalogueLimit: {
      type: Number,
      default: -1 // -1 means unlimited, 0 means no catalogues allowed, positive number is the limit
    },

    // Account status
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* -----------------------------------
 * HASH PASSWORD BEFORE SAVE
 * ----------------------------------- */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/* -----------------------------------
 * COMPARE PASSWORDS
 * ----------------------------------- */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
