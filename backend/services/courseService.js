import * as courseRepo from '../repositories/courseRepository.js';
import * as categoryRepo from '../repositories/categoryRepository.js';

/**
 * Course Service — business logic for course management
 */

/**
 * Browse published courses (public)
 */
export const getPublishedCourses = async ({ category, search, level, minPrice, maxPrice, page = 1, limit = 12 } = {}) => {
  const [courses, total] = await Promise.all([
    courseRepo.findPublished({ category, search, level, minPrice, maxPrice, page: +page, limit: +limit }),
    courseRepo.countPublished(),
  ]);
  return {
    courses,
    total,
    page: +page,
    limit: +limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get single published course detail (public)
 */
export const getCourseDetail = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw new Error('Không tìm thấy khoá học');
  if (course.status !== 'published') throw new Error('Khoá học chưa được công khai');
  return course;
};

/**
 * Get any course by ID (for instructor/admin)
 */
export const getCourseById = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw new Error('Không tìm thấy khoá học');
  return course;
};

/**
 * Get all courses by an instructor
 */
export const getInstructorCourses = async (instructorId) => {
  return courseRepo.findByInstructor(instructorId);
};

/**
 * Create a new course (instructor only)
 * Business rule: only approved instructors can create courses
 * @param {string} instructorId
 * @param {string} instructorStatus - must be 'approved'
 * @param {object} courseData - includes optional `status` ('draft'|'published')
 */
export const createCourse = async (instructorId, instructorStatus, courseData) => {
  if (instructorStatus !== 'approved') {
    throw new Error('Chỉ giảng viên đã được phê duyệt mới có thể tạo khoá học');
  }

  // Validate category exists
  const category = await categoryRepo.findById(courseData.category);
  if (!category) throw new Error('Danh mục không tồn tại');

  // Allow instructor to create directly as published, defaults to draft
  const status = courseData.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? new Date() : null;

  return courseRepo.createCourse({
    ...courseData,
    instructor: instructorId,
    status,
    publishedAt,
  });
};

/**
 * Update course (instructor must own it)
 */
export const updateCourse = async (courseId, instructorId, updateData) => {
  const course = await courseRepo.findByIdAndInstructor(courseId, instructorId);
  if (!course) throw new Error('Không tìm thấy khoá học hoặc bạn không có quyền chỉnh sửa');

  // Validate category if changing
  if (updateData.category) {
    const cat = await categoryRepo.findById(updateData.category);
    if (!cat) throw new Error('Danh mục không tồn tại');
  }

  return courseRepo.updateCourse(courseId, updateData);
};

/**
 * Publish course
 */
export const publishCourse = async (courseId, instructorId) => {
  const course = await courseRepo.findByIdAndInstructor(courseId, instructorId);
  if (!course) throw new Error('Không tìm thấy khoá học hoặc bạn không có quyền');

  return courseRepo.updateCourse(courseId, {
    status: 'published',
    publishedAt: new Date(),
  });
};

/**
 * Delete course (only drafts can be deleted)
 */
export const deleteCourse = async (courseId, instructorId) => {
  const course = await courseRepo.findByIdAndInstructor(courseId, instructorId);
  if (!course) throw new Error('Không tìm thấy khoá học hoặc bạn không có quyền');
  if (course.status === 'published') {
    throw new Error('Không thể xóa khoá học đã xuất bản. Vui lòng lưu trữ (archive) khoá học');
  }
  await courseRepo.deleteCourse(courseId);
  return { message: 'Xóa khoá học thành công' };
};

/**
 * Admin: get all courses
 */
export const getAllCoursesAdmin = async ({ page, limit, status }) => {
  return courseRepo.findAllForAdmin({ page, limit, status });
};

/**
 * Gửi khoá học để Admin duyệt
 * Route: POST /api/courses/:id/submit
 * Business rules:
 *   1. Chỉ instructor tạo khoá học mới được gửi
 *   2. Khoá học đang ở draft, hoặc đang published nhưng đã approved/rejected (gửi cập nhật)
 *   3. Phải có ít nhất 1 lesson
 */
export const submitCourse = async (courseId, instructorId) => {
  // 1. Kiểm tra khoá học tồn tại và thuộc instructor
  const course = await courseRepo.findByIdAndInstructor(courseId, instructorId);
  if (!course) throw new Error('Không tìm thấy khoá học hoặc bạn không có quyền');

  // 2. Kiểm tra trạng thái hợp lệ
  // Chỉ block nếu đã submit thật sự (submittedAt có giá trị)
  // Draft mới có default reviewStatus='pending' nhưng submittedAt=null → cho phép submit
  if (course.reviewStatus === 'pending' && course.submittedAt) {
    throw new Error('Khoá học đang được chờ duyệt, vui lòng chờ Admin xem xét');
  }

  // 3. Kiểm tra có ít nhất 1 lesson
  const { default: Lesson } = await import('../models/Lesson.js');
  const lessonCount = await Lesson.countDocuments({ course: courseId });
  if (lessonCount === 0) {
    throw new Error('Khoá học phải có ít nhất 1 bài học trước khi gửi duyệt');
  }

  // 4. Gửi duyệt -> đổi status sang published và reviewStatus sang pending
  const updated = await courseRepo.submitForReview(courseId);
  return updated;
};
