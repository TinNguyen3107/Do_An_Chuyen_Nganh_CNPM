/**
 * Chapter Controller — thin layer, delegates to chapterService
 */
import asyncHandler from 'express-async-handler';
import * as chapterService from '../services/chapterService.js';

/**
 * @desc    Lấy danh sách chương (kèm bài học) của khoá học
 * @route   GET /api/courses/:courseId/chapters
 * @access  Public
 */
export const getChaptersByCourse = asyncHandler(async (req, res) => {
  const chapters = await chapterService.getChaptersByCourse(req.params.courseId);
  res.json({ success: true, data: chapters });
});

/**
 * @desc    Chi tiết một chương
 * @route   GET /api/chapters/:id
 * @access  Private
 */
export const getChapter = asyncHandler(async (req, res) => {
  const chapter = await chapterService.getChapterById(req.params.id);
  res.json({ success: true, data: chapter });
});

/**
 * @desc    Tạo chương mới
 * @route   POST /api/courses/:courseId/chapters
 * @access  Private (instructor)
 */
export const createChapter = asyncHandler(async (req, res) => {
  const chapter = await chapterService.createChapter(
    req.params.courseId,
    req.user._id,
    req.body
  );
  res.status(201).json({
    success: true,
    data: chapter,
    message: 'Tạo chương học thành công!',
  });
});

/**
 * @desc    Cập nhật chương
 * @route   PUT /api/chapters/:id
 * @access  Private (instructor)
 */
export const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await chapterService.updateChapter(
    req.params.id,
    req.user._id,
    req.body
  );
  res.json({
    success: true,
    data: chapter,
    message: 'Cập nhật chương học thành công!',
  });
});

/**
 * @desc    Xoá chương (cascade xoá bài học trong chương)
 * @route   DELETE /api/chapters/:id
 * @access  Private (instructor)
 */
export const deleteChapter = asyncHandler(async (req, res) => {
  const result = await chapterService.deleteChapter(req.params.id, req.user._id);
  res.json({ success: true, ...result });
});
