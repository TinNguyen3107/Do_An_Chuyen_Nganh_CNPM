import express from 'express';

import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin-only routes
router.post('/', protect, authorize('admin'), validate(createCategorySchema), createCategory);
router.put('/:id', protect, authorize('admin'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;

