import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getCourseLessons } from '../controllers/learningController.js';

const router = express.Router();

router.get('/course/:courseId', protect, getCourseLessons);

export default router;