// src/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

// Forgot password + OTP
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;
