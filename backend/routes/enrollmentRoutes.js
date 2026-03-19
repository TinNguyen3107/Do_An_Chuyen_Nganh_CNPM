import express from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  checkEnrollment,
  getCourseStudents,
} from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { enrollCourseSchema } from '../validators/enrollment.validator.js';

const router = express.Router();

// Student enrolls in a course
// POST /api/enrollments  { courseId }
router.post('/', protect, authorize('student'), validate(enrollCourseSchema), enrollCourse);

// Student sees their enrolled courses
// GET /api/enrollments/my        (legacy)
// GET /api/enrollments/my-courses (sprint 1 spec alias)
router.get('/my', protect, getMyEnrollments);
router.get('/my-courses', protect, getMyEnrollments);

// Check enrollment status for a specific course
// GET /api/enrollments/check/:courseId
router.get('/check/:courseId', protect, checkEnrollment);

// Instructor views students enrolled in their course
// GET /api/enrollments/course/:courseId
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), getCourseStudents);

export default router;
