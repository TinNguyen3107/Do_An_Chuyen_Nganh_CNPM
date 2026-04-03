/**
 * Lesson Controller — thin layer, delegates to lessonService
 */
import asyncHandler from 'express-async-handler';
import * as lessonService from '../services/lessonService.js';

/**
 * @desc    Lấy danh sách bài học của một khoá học
 * @route   GET /api/courses/:courseId/lessons
 * @access  Public
 */
export const getLessonsByCourse = asyncHandler(async (req, res) => {
  const lessons = await lessonService.getLessonsByCourse(req.params.courseId);
  res.json({ success: true, data: lessons });
});

/**
 * @desc    Chi tiết một bài học
 * @route   GET /api/lessons/:id
 * @access  Private (protect)
 */
export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getLessonById(req.params.id);
  res.json({ success: true, data: lesson });
});

/**
 * @desc    Tạo bài học mới trong chương
 * @route   POST /api/chapters/:chapterId/lessons
 * @access  Private (instructor of the course)
 */
export const createLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.createLesson(
    req.params.chapterId,
    req.user._id,
    req.body
  );
  res.status(201).json({
    success: true,
    data: lesson,
    message: 'Tạo bài học thành công!',
  });
});

/**
 * @desc    Cập nhật bài học
 * @route   PUT /api/lessons/:id
 * @access  Private (instructor of the course)
 */
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.updateLesson(
    req.params.id,
    req.user._id,
    req.body
  );
  res.json({
    success: true,
    data: lesson,
    message: 'Cập nhật bài học thành công!',
  });
});

/**
 * @desc    Xoá bài học
 * @route   DELETE /api/lessons/:id
 * @access  Private (instructor of the course)
 */
export const deleteLesson = asyncHandler(async (req, res) => {
  const result = await lessonService.deleteLesson(req.params.id, req.user._id);
  res.json({ success: true, ...result });
});
