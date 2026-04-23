/**
 * Progress Controller — thin layer, delegates to progressService
 */
import asyncHandler from 'express-async-handler';
import * as progressService from '../services/progressService.js';

/**
 * @desc    Ghi nhận thời gian đọc text
 * @route   POST /api/progress/course/:courseId/lesson/:lessonId/text
 * @access  Private
 */
export const updateTextProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { textReadSeconds } = req.body;

  const progress = await progressService.handleTextProgress(
    req.user._id,
    courseId,
    lessonId,
    textReadSeconds
  );

  res.json({ success: true, data: progress });
});

/**
 * @desc    Ghi nhận % video đã xem
 * @route   POST /api/progress/course/:courseId/lesson/:lessonId/video
 * @access  Private
 */
export const updateVideoProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { videoPercent } = req.body;

  const progress = await progressService.handleVideoProgress(
    req.user._id,
    courseId,
    lessonId,
    videoPercent
  );

  res.json({ success: true, data: progress });
});

/**
 * @desc    Đánh dấu bài quiz hoàn thành
 * @route   POST /api/progress/course/:courseId/lesson/:lessonId/quiz
 * @access  Private
 */
export const updateQuizProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  const progress = await progressService.handleQuizProgress(
    req.user._id,
    courseId,
    lessonId
  );

  res.json({ success: true, data: progress });
});

/**
 * @desc    Lấy tiến độ học viên trong một khoá học
 * @route   GET /api/progress/course/:courseId
 * @access  Private
 */
export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const progresses = await progressService.getCourseProgress(
    req.user._id,
    courseId
  );

  res.json({ success: true, data: progresses });
});
