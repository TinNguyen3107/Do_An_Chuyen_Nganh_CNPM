import * as reviewRepo from '../repositories/reviewRepository.js';
import * as enrollmentRepo from '../repositories/enrollmentRepository.js';
import * as courseRepo from '../repositories/courseRepository.js';

const refreshCourseReviewStats = async (courseId) => {
  const stats = await reviewRepo.getCourseRatingStats(courseId);

  await courseRepo.updateReviewStats(
    courseId,
    stats.averageRating || 0,
    stats.totalReviews || 0
  );
};

export const getCourseReviews = async (courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');

  return reviewRepo.findByCourse(courseId);
};

export const getMyReviewForCourse = async (userId, courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');

  return reviewRepo.findByUserAndCourse(userId, courseId);
};

export const createOrUpdateReview = async (userId, courseId, data) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');
  if (course.status !== 'published') throw new Error('Khoá học chưa được công khai');

  const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (!enrollment) {
    throw new Error('Bạn cần đăng ký khoá học trước khi đánh giá');
  }

  const existing = await reviewRepo.findByUserAndCourse(userId, courseId);
  if (existing) {
    throw new Error('Bạn đã đánh giá khoá học này rồi, không thể đánh giá lại');
  }

  await reviewRepo.createReview({
    user: userId,
    course: courseId,
    rating: data.rating,
    comment: data.comment || '',
  });

  const review = await reviewRepo.findByUserAndCourse(userId, courseId);

  await refreshCourseReviewStats(courseId);

  return review;
};