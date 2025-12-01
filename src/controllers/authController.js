// src/controllers/authController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";

// =========================
// Register User
// =========================
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // Normalize incoming email — trims and lower-cases to avoid case/whitespace issues
    const normalizedEmail = email?.toLowerCase().trim();

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email: normalizedEmail, password });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Login User
// =========================
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Get Logged-In User
// =========================
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------
// Generate 6-digit OTP
// -----------------------------------
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// =========================
// Forgot Password - Send OTP
// =========================
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(404).json({ message: "No account found with this email" });

    const otp = generateOTP();

    user.otp = otp;
    user.otpType = "reset-password";
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const html = `
      <p>Hi ${user.name || ""},</p>
      <p>Your password reset OTP is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Reset Password OTP",
      html,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    next(err);
  }
};

// =========================
// Verify Reset OTP
// =========================
export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!email || !otp)
      return res
        .status(400)
        .json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email: normalizedEmail });
    if (
      !user ||
      user.otp !== otp ||
      user.otpType !== "reset-password" ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};

// =========================
// Reset Password
// =========================
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!email || !otp || !newPassword)
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });

    const user = await User.findOne({ email: normalizedEmail });

    if (
      !user ||
      user.otp !== otp ||
      user.otpType !== "reset-password" ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password — assign plain password and let the model pre-save hook hash it
    user.password = newPassword;

    // Clear OTP
    user.otp = null;
    user.otpType = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};
