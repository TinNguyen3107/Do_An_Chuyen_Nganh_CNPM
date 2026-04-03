import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  updateTextProgress,
  updateVideoProgress,
  getCourseProgress,
} from '../controllers/progressController.js';

const router = express.Router();

router.get('/course/:courseId', protect, getCourseProgress);
router.post('/course/:courseId/lesson/:lessonId/text', protect, updateTextProgress);
router.post('/course/:courseId/lesson/:lessonId/video', protect, updateVideoProgress);

export default router;