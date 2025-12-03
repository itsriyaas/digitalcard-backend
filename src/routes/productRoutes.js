import express from 'express';
import {
  createProduct,
  getAllUserProducts,
  getProductsByCatalogue,
  getProduct,
  updateProduct,
  deleteProduct,
  bulkImportProducts
} from '../controllers/productController.js';
import { protect, checkSubscription } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (must come before parameterized routes) - All require active subscription for customers
router.get('/', protect, checkSubscription, getAllUserProducts);
router.post('/', protect, checkSubscription, createProduct);
router.post('/bulk-import', protect, checkSubscription, bulkImportProducts);
router.put('/:id', protect, checkSubscription, updateProduct);
router.delete('/:id', protect, checkSubscription, deleteProduct);

// Public routes
router.get('/catalogue/:catalogueId', getProductsByCatalogue);
router.get('/:id', getProduct);

export default router;
