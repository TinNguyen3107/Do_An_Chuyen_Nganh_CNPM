import express from 'express';
import {
  getChaptersByCourse,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../controllers/chapterController.js';
import {
  getLessonsByCourse,
  createLesson,
} from '../controllers/lessonController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createChapterSchema, updateChapterSchema } from '../validators/chapter.validator.js';
import { createLessonSchema } from '../validators/lesson.validator.js';

// ── Nested under /api/courses/:courseId ───────────────────────────
const courseChapterRouter = express.Router({ mergeParams: true });

// GET  /api/courses/:courseId/chapters
courseChapterRouter.get('/', getChaptersByCourse);

// POST /api/courses/:courseId/chapters
courseChapterRouter.post(
  '/',
  protect,
  authorize('instructor', 'admin'),
  validate(createChapterSchema),
  createChapter
);

export default courseChapterRouter;

// ── Standalone /api/chapters/:id ──────────────────────────────────
export const chapterStandaloneRouter = express.Router();

// GET  /api/chapters/:id
chapterStandaloneRouter.get('/:id', protect, getChapter);

// PUT  /api/chapters/:id
chapterStandaloneRouter.put(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  validate(updateChapterSchema),
  updateChapter
);

// DELETE /api/chapters/:id
chapterStandaloneRouter.delete(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  deleteChapter
);

// ── Lessons WITHIN a chapter: /api/chapters/:chapterId/lessons ────
export const chapterLessonRouter = express.Router({ mergeParams: true });

// GET  /api/chapters/:chapterId/lessons
chapterLessonRouter.get('/', protect, getLessonsByCourse);

// POST /api/chapters/:chapterId/lessons
chapterLessonRouter.post(
  '/',
  protect,
  authorize('instructor', 'admin'),
  validate(createLessonSchema),
  createLesson
);
