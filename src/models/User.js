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

    role: { type: String, default: "user" },
    plan: { type: String, default: "free" },

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
