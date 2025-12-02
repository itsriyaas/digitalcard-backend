import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripePaymentIntent,
  verifyStripePayment,
  createPayPalOrder,
  capturePayPalPayment,
  getPaymentByOrder
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Razorpay routes
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Stripe routes
router.post('/stripe/create', createStripePaymentIntent);
router.post('/stripe/verify', verifyStripePayment);

// PayPal routes
router.post('/paypal/create', createPayPalOrder);
router.post('/paypal/capture', capturePayPalPayment);

// Get payment
router.get('/order/:orderId', optionalAuth, getPaymentByOrder);

export default router;
