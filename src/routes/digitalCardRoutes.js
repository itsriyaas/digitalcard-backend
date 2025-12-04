import express from 'express';
import {
  createDigitalCard,
  getUserDigitalCards,
  getDigitalCard,
  getPublicDigitalCard,
  updateDigitalCard,
  deleteDigitalCard,
  togglePublishStatus,
  recordEnquiry
} from '../controllers/digitalCardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public/:slug', getPublicDigitalCard);
router.post('/:slug/enquiry', recordEnquiry);

// Protected routes (require authentication)
router.use(protect);

router.route('/')
  .get(getUserDigitalCards)
  .post(createDigitalCard);

router.route('/:id')
  .get(getDigitalCard)
  .put(updateDigitalCard)
  .delete(deleteDigitalCard);

router.patch('/:id/publish', togglePublishStatus);

export default router;
