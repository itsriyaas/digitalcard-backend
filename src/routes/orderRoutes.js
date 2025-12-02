import express from 'express';
import {
  createOrder,
  getAllAdminOrders,
  getOrdersByCatalogue,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getUserOrders
} from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Optional auth routes
router.post('/', optionalAuth, createOrder);
router.get('/single/:id', getOrder);

// Protected routes (specific routes first, then parameterized)
router.get('/admin', protect, getAllAdminOrders);
router.get('/catalogue/:catalogueId', protect, getOrdersByCatalogue);
router.get('/user', protect, getUserOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/payment', protect, updatePaymentStatus);

export default router;
