/**
 * Instructor Controller — thin layer, no manual validation
 * All input validation is handled by Joi middleware in routes/instructorRoutes.js
 */
import asyncHandler from 'express-async-handler';
import * as instructorService from '../services/instructorService.js';

/**
 * @desc    Get current user's instructor application
 * @route   GET /api/instructors/application
 * @access  Private (instructor)
 */
export const getMyApplication = asyncHandler(async (req, res) => {
  const profile = await instructorService.getMyApplication(req.user._id);
  res.json({ success: true, data: profile });
});

/**
 * @desc    Submit instructor application
 * @route   POST /api/instructors/apply
 * @access  Private (logged-in student/instructor)
 */
export const applyAsInstructor = asyncHandler(async (req, res) => {
  const { expertise, yearsOfExperience, education, biography, portfolio } = req.body;

  let cvUrl = '';
  if (req.file) {
    cvUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  const profile = await instructorService.submitApplication(req.user._id, {
    expertise, yearsOfExperience, education, biography, portfolio, cvUrl,
  });

  res.status(201).json({
    success: true,
    data: profile,
    message: 'Hồ sơ đăng ký giảng viên đã được gửi. Vui lòng chờ Admin xét duyệt.',
  });
});

/**
 * @desc    Admin: get all instructor applications
 * @route   GET /api/instructors/applications
 * @access  Private (admin)
 */
export const getAllApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const result = await instructorService.getAllApplications({
    status, page: +page, limit: +limit,
  });
  res.json({ success: true, ...result });
});

/**
 * @desc    Admin: approve instructor application
 * @route   PATCH /api/instructors/applications/:id/approve
 * @access  Private (admin)
 */
export const approveInstructor = asyncHandler(async (req, res) => {
  const profile = await instructorService.approveInstructor(req.params.id, req.user._id);
  res.json({
    success: true,
    data: profile,
    message: 'Đã phê duyệt giảng viên thành công',
  });
});

/**
 * @desc    Admin: reject instructor application
 * @route   PATCH /api/instructors/applications/:id/reject
 * @access  Private (admin)
 */
export const rejectInstructor = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const profile = await instructorService.rejectInstructor(req.params.id, req.user._id, adminNote);
  res.json({
    success: true,
    data: profile,
    message: 'Đã từ chối hồ sơ giảng viên',
  });
});
