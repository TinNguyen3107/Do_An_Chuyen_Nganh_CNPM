import express from 'express';
import {
  getCourses,
  getCourse,
  getMyCourses,
  createCourse,
  updateCourse,
  publishCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect, optionalProtect } from '../middlewares/authMiddleware.js';
import { authorize, requireApprovedInstructor } from '../middlewares/roleMiddleware.js';
import { uploadImage } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCourseSchema, updateCourseSchema } from '../validators/course.validator.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────
// Browse all published courses
router.get('/', getCourses);

// ── Instructor (specific routes BEFORE /:id) ─────────────────────
// Get instructor's own courses (all statuses)
router.get('/my-courses', protect, authorize('instructor', 'admin'), getMyCourses);

// ── Course detail ─────────────────────────────────────────────────
// optionalProtect: if token present → attach req.user so owner/admin can see drafts
router.get('/:id', optionalProtect, getCourse);

// ── Create course ─────────────────────────────────────────────────
// uploadImage before validate so multer populates req.body from form-data
router.post('/',
  protect,
  authorize('instructor', 'admin'),
  requireApprovedInstructor,
  uploadImage.single('thumbnail'),
  validate(createCourseSchema),
  createCourse
);

// ── Update course ─────────────────────────────────────────────────
router.put('/:id',
  protect,
  authorize('instructor', 'admin'),
  uploadImage.single('thumbnail'),
  validate(updateCourseSchema),
  updateCourse
);

// ── Publish course ────────────────────────────────────────────────
router.patch('/:id/publish',
  protect,
  authorize('instructor', 'admin'),
  publishCourse
);

// ── Delete course (draft only) ────────────────────────────────────
router.delete('/:id',
  protect,
  authorize('instructor', 'admin'),
  deleteCourse
);

export default router;
