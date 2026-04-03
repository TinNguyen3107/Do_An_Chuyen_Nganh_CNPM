import express from 'express';
import {
  getCourseReviews,
  getMyReviewForCourse,
  createOrUpdateReview,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createOrUpdateReviewSchema } from '../validators/review.validator.js';

const router = express.Router();

router.get('/course/:courseId', getCourseReviews);

router.get(
  '/course/:courseId/my-review',
  protect,
  authorize('student'),
  getMyReviewForCourse
);

router.post(
  '/course/:courseId',
  protect,
  authorize('student'),
  validate(createOrUpdateReviewSchema),
  createOrUpdateReview
);

export default router;
