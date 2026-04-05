/**
 * Course Review Service
 * Business logic for course review/approval workflow
 */
import * as courseReviewRepo from '../repositories/courseReviewRepository.js';
import Chapter from '../models/Chapter.js';
import Lesson from '../models/Lesson.js';

/**
 * Lấy danh sách khoá học chờ duyệt
 */
export const getPendingCourses = async ({ page = 1, limit = 10 } = {}) => {
  const [courses, total] = await Promise.all([
    courseReviewRepo.findPendingCourses({ page: +page, limit: +limit }),
    courseReviewRepo.countPendingCourses(),
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
 * Lấy chi tiết khoá học (bao gồm tất cả chapters và lessons)
 */
export const getCourseDetailForReview = async (courseId) => {
  const course = await courseReviewRepo.findById(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khoá học');
  }

  const chapters = await Chapter.find({ course: courseId }).sort({ order: 1 });
  const chaptersWithLessons = await Promise.all(
    chapters.map(async (ch) => {
      const lessons = await Lesson.find({ chapter: ch._id }).sort({ order: 1 });
      return { ...ch.toObject(), lessons };
    })
  );
  return { ...course.toObject(), chapters: chaptersWithLessons };
};

/**
 * Duyệt khoá học
 * @param {string} courseId - ID khoá học
 * @param {string} adminId - ID admin duyệt
 */
export const approveCourse = async (courseId, adminId) => {
  const course = await courseReviewRepo.findById(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khoá học');
  }

  if (course.reviewStatus !== 'pending') {
    throw new Error(`Khoá học không ở trạng thái chờ duyệt. Trạng thái hiện tại: ${course.reviewStatus}`);
  }

  const updatedCourse = await courseReviewRepo.approveCourse(courseId, adminId);
  return updatedCourse;
};

/**
 * Từ chối khoá học
 * @param {string} courseId - ID khoá học
 * @param {string} adminId - ID admin từ chối
 * @param {string} rejectionReason - Lý do từ chối
 */
export const rejectCourse = async (courseId, adminId, rejectionReason = '') => {
  const course = await courseReviewRepo.findById(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khoá học');
  }

  if (course.reviewStatus !== 'pending') {
    throw new Error(`Khoá học không ở trạng thái chờ duyệt. Trạng thái hiện tại: ${course.reviewStatus}`);
  }

  if (!rejectionReason || rejectionReason.trim() === '') {
    throw new Error('Lý do từ chối không được để trống');
  }

  const updatedCourse = await courseReviewRepo.rejectCourse(courseId, adminId, rejectionReason);
  return updatedCourse;
};

/**
 * Lấy danh sách khoá học đã duyệt
 */
export const getApprovedCourses = async ({ page = 1, limit = 10 } = {}) => {
  const [courses, total] = await Promise.all([
    courseReviewRepo.findApprovedCourses({ page: +page, limit: +limit }),
    courseReviewRepo.countApprovedCourses(),
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
 * Lấy danh sách khoá học bị từ chối
 */
export const getRejectedCourses = async ({ page = 1, limit = 10 } = {}) => {
  const [courses, total] = await Promise.all([
    courseReviewRepo.findRejectedCourses({ page: +page, limit: +limit }),
    courseReviewRepo.countRejectedCourses(),
  ]);

  return {
    courses,
    total,
    page: +page,
    limit: +limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getPendingNewCourses = async ({ page = 1, limit = 10 } = {}) => {
  const [courses, total] = await Promise.all([
    courseReviewRepo.findPendingNewCourses({ page: +page, limit: +limit }),
    courseReviewRepo.countPendingNewCourses(),
  ]);
  return { courses, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) };
};

export const getPendingUpdateCourses = async ({ page = 1, limit = 10 } = {}) => {
  const [courses, total] = await Promise.all([
    courseReviewRepo.findPendingUpdateCourses({ page: +page, limit: +limit }),
    courseReviewRepo.countPendingUpdateCourses(),
  ]);
  return { courses, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) };
};

export default {
  getPendingCourses,
  getCourseDetailForReview,
  approveCourse,
  rejectCourse,
  getApprovedCourses,
  getRejectedCourses,
  getPendingNewCourses,
  getPendingUpdateCourses,
};
