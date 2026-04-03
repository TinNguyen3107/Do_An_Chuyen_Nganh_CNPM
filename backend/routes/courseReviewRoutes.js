/**
 * Course Review Routes
 * Routes for admin to review and approve/reject courses
 */
import express from 'express';
import {
  getPendingCourses,
  getCourseForReview,
  approveCourse,
  rejectCourse,
  getApprovedCourses,
  getRejectedCourses,
} from '../controllers/courseReviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { rejectCourseSchema } from '../validators/courseReview.validator.js';

const router = express.Router();

// ── Admin Only ────────────────────────────────────────────────────
// Protect: must be authenticated
// Authorize: must be admin

/**
 * GET /api/admin-review/courses/pending - Get all pending courses
 */
router.get(
  '/pending',
  protect,
  authorize('admin'),
  getPendingCourses
);

/**
 * GET /api/admin-review/courses/:id/review - Get course detail for review
 */
router.get(
  '/:id/review',
  protect,
  authorize('admin'),
  getCourseForReview
);

/**
 * PATCH /api/admin-review/courses/:id/approve - Approve course
 */
router.patch(
  '/:id/approve',
  protect,
  authorize('admin'),
  approveCourse
);

/**
 * PATCH /api/admin-review/courses/:id/reject - Reject course
 */
router.patch(
  '/:id/reject',
  protect,
  authorize('admin'),
  validate(rejectCourseSchema),
  rejectCourse
);

/**
 * GET /api/admin-review/courses/approved - Get all approved courses
 */
router.get(
  '/approved',
  protect,
  authorize('admin'),
  getApprovedCourses
);

/**
 * GET /api/admin-review/courses/rejected - Get all rejected courses
 */
router.get(
  '/rejected',
  protect,
  authorize('admin'),
  getRejectedCourses
);

export default router;
