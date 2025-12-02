// src/routes/customerRoutes.js
import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateSubscription,
  toggleCustomerStatus
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Customer CRUD
router.get('/', getAllCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Subscription management
router.put('/:id/subscription', updateSubscription);

// Toggle active status
router.patch('/:id/toggle-status', toggleCustomerStatus);

export default router;
