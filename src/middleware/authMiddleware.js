// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (err) {
      // Continue without user
      req.user = null;
    }
  }
  next();
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if customer has active subscription
export const checkSubscription = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Admin users bypass subscription check
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user is a customer
  if (req.user.role === 'customer') {
    const { subscription } = req.user;

    // Check if subscription is active and not expired
    if (subscription.status !== 'active') {
      return res.status(403).json({
        message: "Your subscription is not active. Please contact admin to activate your subscription.",
        subscriptionStatus: subscription.status
      });
    }

    // Check if subscription has expired
    if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
      // Update status to expired
      req.user.subscription.status = 'expired';
      await req.user.save();

      return res.status(403).json({
        message: "Your subscription has expired. Please contact admin to renew your subscription.",
        subscriptionStatus: 'expired'
      });
    }
  }

  next();
};
