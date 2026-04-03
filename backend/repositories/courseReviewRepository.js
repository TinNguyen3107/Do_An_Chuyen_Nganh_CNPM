/**
 * Course Review Repository
 * Xử lý queries liên quan đến review/duyệt khoá học
 */
import Course from '../models/Course.js';

/**
 * Lấy danh sách khoá học chờ duyệt (pending)
 */
export const findPendingCourses = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  return Course.find({ status: 'published', reviewStatus: 'pending' })
    .populate('instructor', 'name email')
    .populate('category', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Đếm số khoá học chờ duyệt
 */
export const countPendingCourses = async () => {
  return Course.countDocuments({ status: 'published', reviewStatus: 'pending' });
};

/**
 * Đếm số khoá học đã duyệt
 */
export const countApprovedCourses = async () => {
  return Course.countDocuments({ status: 'published', reviewStatus: 'approved' });
};

/**
 * Đếm số khoá học bị từ chối
 */
export const countRejectedCourses = async () => {
  return Course.countDocuments({ status: 'published', reviewStatus: 'rejected' });
};

/**
 * Lấy khoá học theo ID
 */
export const findById = async (courseId) => {
  return Course.findById(courseId)
    .populate('instructor', 'name email avatar')
    .populate('category', 'name slug');
};

/**
 * Duyệt khoá học (approved)
 */
export const approveCourse = async (courseId, adminId) => {
  return Course.findByIdAndUpdate(
    courseId,
    {
      reviewStatus: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    { new: true }
  ).populate('instructor', 'name email').populate('category', 'name');
};

/**
 * Từ chối khoá học (rejected)
 */
export const rejectCourse = async (courseId, adminId, rejectionReason) => {
  return Course.findByIdAndUpdate(
    courseId,
    {
      reviewStatus: 'rejected',
      rejectionReason: rejectionReason || '',
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    { new: true }
  ).populate('instructor', 'name email').populate('category', 'name');
};

/**
 * Lấy danh sách khoá học đã duyệt (approved)
 */
export const findApprovedCourses = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  return Course.find({ status: 'published', reviewStatus: 'approved' })
    .populate('instructor', 'name email')
    .populate('category', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ reviewedAt: -1 });
};

/**
 * Lấy danh sách khoá học bị từ chối (rejected)
 */
export const findRejectedCourses = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  return Course.find({ status: 'published', reviewStatus: 'rejected' })
    .populate('instructor', 'name email')
    .populate('category', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ reviewedAt: -1 });
};

export default {
  findPendingCourses,
  countPendingCourses,
  findById,
  approveCourse,
  rejectCourse,
  findApprovedCourses,
  findRejectedCourses,
  countApprovedCourses,
  countRejectedCourses,
};
