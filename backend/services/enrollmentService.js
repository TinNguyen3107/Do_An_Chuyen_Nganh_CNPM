import * as enrollmentRepo from '../repositories/enrollmentRepository.js';
import * as courseRepo from '../repositories/courseRepository.js';

/**
 * Enrollment Service
 */

/**
 * Enroll student in a course
 * Sprint 1: only free courses can be enrolled directly
 */
export const enrollCourse = async (userId, courseId) => {
  // 1. Verify course exists and is published
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');
  if (course.status !== 'published') throw new Error('Khoá học chưa được công khai');

  // 2. Check already enrolled
  const existing = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (existing) throw new Error('Bạn đã đăng ký khoá học này rồi');

  // 3. Business rule: Sprint 1 only allows free enrollment
  if (!course.isFree) {
    throw new Error('Khoá học này yêu cầu thanh toán. Tính năng thanh toán sẽ sớm ra mắt');
  }

  // 4. Create enrollment
  const enrollment = await enrollmentRepo.createEnrollment({
    user: userId,
    course: courseId,
    enrollmentType: 'free',
  });

  // 5. Increment course student count
  await courseRepo.incrementStudentCount(courseId);

  return enrollment;
};

/**
 * Check if user is enrolled in a course
 */
export const checkEnrollment = async (userId, courseId) => {
  const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  return { isEnrolled: !!enrollment, enrollment };
};

/**
 * Get all courses the student is enrolled in
 */
export const getMyEnrollments = async (userId) => {
  return enrollmentRepo.findByUser(userId);
};

/**
 * Get all students enrolled in a course (instructor view)
 */
export const getCourseStudents = async (courseId) => {
  return enrollmentRepo.findByCourse(courseId);
};
