import Enrollment from '../models/Enrollment.js';

/**
 * Enrollment Repository
 */

export const findByUserAndCourse = (userId, courseId) =>
  Enrollment.findOne({ user: userId, course: courseId });

export const createEnrollment = (data) => Enrollment.create(data);

export const findByUser = (userId) =>
  Enrollment.find({ user: userId })
    .populate({
      path: 'course',
      select: 'title thumbnail instructor price isFree status averageRating totalLectures category',
      populate: [
        { path: 'instructor', select: 'name avatar' },
        { path: 'category', select: 'name icon' },
      ],
    })
    .sort({ enrolledAt: -1 });

export const findByCourse = (courseId) =>
  Enrollment.find({ course: courseId })
    .populate('user', 'name email avatar')
    .sort({ enrolledAt: -1 });

export const countByCourse = (courseId) =>
  Enrollment.countDocuments({ course: courseId });

export const countByUser = (userId) =>
  Enrollment.countDocuments({ user: userId });
