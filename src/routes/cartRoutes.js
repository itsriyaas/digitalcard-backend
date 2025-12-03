import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes support both authenticated and guest users
router.get('/:catalogueId', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/update', optionalAuth, updateCartItem);
router.delete('/remove/:productId', optionalAuth, removeFromCart);
router.post('/apply-coupon', optionalAuth, applyCoupon);
router.post('/remove-coupon', optionalAuth, removeCoupon);
router.delete('/:catalogueId', optionalAuth, clearCart);

export default router;
