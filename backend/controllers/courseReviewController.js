/**
 * Course Review Controller
 * Xử lý routes liên quan đến duyệt khoá học
 */
import asyncHandler from 'express-async-handler';
import * as courseReviewService from '../services/courseReviewService.js';

/**
 * @desc    Get all pending courses for review
 * @route   GET /api/admin/courses/pending
 * @access  Private (admin only)
 */
export const getPendingCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await courseReviewService.getPendingCourses({ page, limit });
  res.json({ success: true, ...result });
});

/**
 * @desc    Get course detail for review
 * @route   GET /api/admin-review/:id/review
 * @access  Private (admin only)
 */
export const getCourseForReview = asyncHandler(async (req, res) => {
  const data = await courseReviewService.getCourseDetailForReview(req.params.id);
  res.json({ success: true, data });
});

/**
 * @desc    Approve course
 * @route   PATCH /api/admin/courses/:id/approve
 * @access  Private (admin only)
 */
export const approveCourse = asyncHandler(async (req, res) => {
  const updatedCourse = await courseReviewService.approveCourse(
    req.params.id,
    req.user._id
  );

  res.json({
    success: true,
    message: 'Khoá học đã được duyệt thành công',
    data: updatedCourse,
  });
});

/**
 * @desc    Reject course
 * @route   PATCH /api/admin/courses/:id/reject
 * @access  Private (admin only)
 */
export const rejectCourse = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  const updatedCourse = await courseReviewService.rejectCourse(
    req.params.id,
    req.user._id,
    rejectionReason
  );

  res.json({
    success: true,
    message: 'Khoá học đã bị từ chối',
    data: updatedCourse,
  });
});

/**
 * @desc    Get approved courses
 * @route   GET /api/admin/courses/approved
 * @access  Private (admin only)
 */
export const getApprovedCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await courseReviewService.getApprovedCourses({ page, limit });
  res.json({ success: true, ...result });
});

/**
 * @desc    Get rejected courses
 * @route   GET /api/admin/courses/rejected
 * @access  Private (admin only)
 */
export const getRejectedCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await courseReviewService.getRejectedCourses({ page, limit });
  res.json({ success: true, ...result });
});

export const getPendingNewCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await courseReviewService.getPendingNewCourses({ page, limit });
  res.json({ success: true, ...result });
});

export const getPendingUpdateCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await courseReviewService.getPendingUpdateCourses({ page, limit });
  res.json({ success: true, ...result });
});

export default {
  getPendingCourses,
  getCourseForReview,
  approveCourse,
  rejectCourse,
  getApprovedCourses,
  getRejectedCourses,
  getPendingNewCourses,
  getPendingUpdateCourses,
};
