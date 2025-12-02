import express from 'express';
import {
  createCatalogue,
  getUserCatalogues,
  getCatalogue,
  updateCatalogue,
  deleteCatalogue,
  getPublicCatalogue
} from '../controllers/catalogueController.js';
import { protect, checkSubscription } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public/:slug', getPublicCatalogue);

// Protected routes - All require active subscription for customers
router.post('/', protect, checkSubscription, createCatalogue);
router.get('/', protect, checkSubscription, getUserCatalogues);
router.get('/:id', protect, checkSubscription, getCatalogue);
router.put('/:id', protect, checkSubscription, updateCatalogue);
router.delete('/:id', protect, checkSubscription, deleteCatalogue);

export default router;
