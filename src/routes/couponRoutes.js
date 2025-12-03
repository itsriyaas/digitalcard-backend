import express from 'express';
import {
  createCoupon,
  getCouponsByCatalogue,
  validateCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect, checkSubscription } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);

// Protected routes - Customers can manage their own coupons with active subscription
router.post('/', protect, checkSubscription, createCoupon);
router.get('/catalogue/:catalogueId', protect, checkSubscription, getCouponsByCatalogue);
router.put('/:id', protect, checkSubscription, updateCoupon);
router.delete('/:id', protect, checkSubscription, deleteCoupon);

export default router;
