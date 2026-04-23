import express from 'express';
import {
  getLessonsByCourse,
  getLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateLessonSchema } from '../validators/lesson.validator.js';

const router = express.Router({ mergeParams: true }); // mergeParams để lấy :courseId từ parent

// ── Nested under /api/courses/:courseId/lessons ────────────────────
// GET  /api/courses/:courseId/lessons → danh sách bài học (public)
router.get('/', getLessonsByCourse);

export default router;

// ── Standalone lesson router: /api/lessons/:id ────────────────────
export const lessonStandaloneRouter = express.Router();

// GET /api/lessons/:id → chi tiết bài học (instructor + admin duyệt khoá học)
lessonStandaloneRouter.get('/:id', protect, authorize('instructor', 'admin'), getLesson);

// PUT /api/lessons/:id → cập nhật bài học
lessonStandaloneRouter.put(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  validate(updateLessonSchema),
  updateLesson
);

// DELETE /api/lessons/:id → xoá bài học
lessonStandaloneRouter.delete(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  deleteLesson
);
