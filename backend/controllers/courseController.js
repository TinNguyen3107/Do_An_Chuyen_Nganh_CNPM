/**
 * Course Controller — thin layer, no manual validation
 * All input validation is handled by Joi middleware in routes/courseRoutes.js
 */
import asyncHandler from 'express-async-handler';
import * as courseService from '../services/courseService.js';

/**
 * @desc    Get all published courses (browse)
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = asyncHandler(async (req, res) => {
  const { category, search, level, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
  const result = await courseService.getPublishedCourses({
    category, search, level, minPrice, maxPrice, page, limit,
  });
  res.json({ success: true, ...result });
});

/**
 * @desc    Get course detail
 * @route   GET /api/courses/:id
 * @access  Public (optionalProtect)
 */
export const getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  const userId  = req.user?._id?.toString();
  const ownerId = course.instructor?._id?.toString() || course.instructor?.toString();
  const isOwnerOrAdmin = userId && (req.user?.role === 'admin' || userId === ownerId);

  if (course.status !== 'published' && !isOwnerOrAdmin) {
    res.status(404);
    throw new Error('Khoá học không tồn tại hoặc chưa được công khai');
  }
  res.json({ success: true, data: course });
});

/**
 * @desc    Get instructor's own courses
 * @route   GET /api/courses/my-courses
 * @access  Private (instructor)
 */
export const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getInstructorCourses(req.user._id);
  res.json({ success: true, data: courses });
});

/**
 * @desc    Create a new course (draft)
 * @route   POST /api/courses
 * @access  Private (approved instructor)
 */
export const createCourse = asyncHandler(async (req, res) => {
  const {
    title, description, shortDescription, category,
    price, status, level, language,
    requirements, objectives, tags,
  } = req.body;

  // Thumbnail upload (handled by multer before this controller)
  let thumbnail = '';
  if (req.file) {
    thumbnail = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  // Parse JSON string arrays if sent as form-data strings
  const parseArr = (val) => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  const course = await courseService.createCourse(
    req.user._id,
    req.user.instructorStatus,
    {
      title, description, shortDescription, category,
      price: price !== undefined ? Number(price) : 0,
      status: status || 'draft',
      level, language, thumbnail,
      requirements: parseArr(requirements),
      objectives:   parseArr(objectives),
      tags:         parseArr(tags),
    }
  );

  const msg = course.status === 'published'
    ? 'Khoá học đã được xuất bản thành công!'
    : 'Khoá học được tạo dưới dạng bản nháp (draft)';

  res.status(201).json({ success: true, data: course, message: msg });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (course owner)
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.file) {
    updateData.thumbnail = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  // Parse JSON string arrays from form-data
  ['requirements', 'objectives', 'tags'].forEach((key) => {
    if (typeof updateData[key] === 'string') {
      try { updateData[key] = JSON.parse(updateData[key]); } catch { /* ignore malformed */ }
    }
  });

  const course = await courseService.updateCourse(req.params.id, req.user._id, updateData);
  res.json({ success: true, data: course, message: 'Cập nhật khoá học thành công' });
});

/**
 * @desc    Publish course
 * @route   PATCH /api/courses/:id/publish
 * @access  Private (course owner)
 */
export const publishCourse = asyncHandler(async (req, res) => {
  const course = await courseService.publishCourse(req.params.id, req.user._id);
  res.json({ success: true, data: course, message: 'Khoá học đã được công khai' });
});

/**
 * @desc    Delete course (draft only)
 * @route   DELETE /api/courses/:id
 * @access  Private (course owner)
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const result = await courseService.deleteCourse(req.params.id, req.user._id);
  res.json({ success: true, ...result });
});

/**
 * @desc    Admin: get all courses
 * @route   GET /api/admin/courses
 * @access  Private (admin)
 */
export const getAdminCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const courses = await courseService.getAllCoursesAdmin({ page: +page, limit: +limit, status });
  res.json({ success: true, data: courses });
});
