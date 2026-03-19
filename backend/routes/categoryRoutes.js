import express from 'express';

=======
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin-only routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;

