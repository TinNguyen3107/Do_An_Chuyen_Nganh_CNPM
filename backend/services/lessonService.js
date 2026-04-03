import * as lessonRepo from '../repositories/lessonRepository.js';
import * as courseRepo from '../repositories/courseRepository.js';
import * as chapterRepo from '../repositories/chapterRepository.js';

/**
 * Lesson Service — business logic
 */

/**
 * Lấy tất cả bài học của một khoá học
 */
export const getLessonsByCourse = async (courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');
  return lessonRepo.findByCourse(courseId);
};

/**
 * Chi tiết một bài học
 */
export const getLessonById = async (lessonId) => {
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson) throw new Error('Không tìm thấy bài học');
  return lesson;
};

/**
 * Tạo bài học mới trong chương
 * Route: POST /api/chapters/:chapterId/lessons
 * Business rule: chỉ instructor sở hữu khoá học mới được tạo
 */
export const createLesson = async (chapterId, instructorId, data) => {
  // 1. Tìm chương
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter) throw new Error('Không tìm thấy chương học');

  // 2. Verify instructor sở hữu khoá học chứa chương này
  const course = await courseRepo.findByIdAndInstructor(chapter.course, instructorId);
  if (!course) throw new Error('Bạn không có quyền thêm bài học vào khoá học này');

  if (course.reviewStatus === 'pending' && course.submittedAt) {
    throw new Error('Khoá học đang chờ Admin duyệt, bạn không thể thêm bài học mới');
  }

  // 3. Tự động gán order nếu không truyền
  let { order } = data;
  if (!order) {
    const maxOrder = await lessonRepo.maxOrderByCourse(chapter.course);
    order = maxOrder + 1;
  }

  // 4. Tạo bài học
  const lesson = await lessonRepo.create({
    ...data,
    course: chapter.course,
    chapter: chapterId,
    order,
  });

  // 5. Cập nhật totalLectures, totalDuration và hasPendingChanges trên Course
  const totalLectures = await lessonRepo.countByCourse(chapter.course);
  const lessons = await lessonRepo.findByCourse(chapter.course);
  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
  const updatePayload = { totalLectures, totalDuration: Math.round(totalDuration / 60) };
  if (course.reviewStatus === 'approved') updatePayload.hasPendingChanges = true;
  await courseRepo.updateCourse(chapter.course, updatePayload);

  return lesson;
};

/**
 * Cập nhật bài học
 * Business rule: chỉ instructor sở hữu khoá học mới được sửa
 */
export const updateLesson = async (lessonId, instructorId, data) => {
  // 1. Tìm bài học
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson) throw new Error('Không tìm thấy bài học');

  // 2. Verify instructor owns the course
  const course = await courseRepo.findByIdAndInstructor(lesson.course, instructorId);
  if (!course) throw new Error('Bạn không có quyền chỉnh sửa bài học này');

  if (course.reviewStatus === 'pending' && course.submittedAt) {
    throw new Error('Khoá học đang chờ Admin duyệt, bạn không thể chỉnh sửa bài học');
  }

  // 3. Update
  const updated = await lessonRepo.update(lessonId, data);

  // 4. Cập nhật totalDuration và hasPendingChanges
  if (course.reviewStatus === 'approved') {
    await courseRepo.updateCourse(lesson.course, { hasPendingChanges: true });
  }
  if (data.duration !== undefined) {
    const lessons = await lessonRepo.findByCourse(lesson.course);
    const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    await courseRepo.updateCourse(lesson.course, { totalDuration: Math.round(totalDuration / 60) });
  }

  return updated;
};

/**
 * Xoá bài học
 * Business rule: chỉ instructor sở hữu khoá học mới được xoá
 */
export const deleteLesson = async (lessonId, instructorId) => {
  // 1. Tìm bài học
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson) throw new Error('Không tìm thấy bài học');

  // 2. Verify instructor owns the course
  const course = await courseRepo.findByIdAndInstructor(lesson.course, instructorId);
  if (!course) throw new Error('Bạn không có quyền xoá bài học này');

  if (course.reviewStatus === 'pending' && course.submittedAt) {
    throw new Error('Khoá học đang chờ Admin duyệt, bạn không thể xoá bài học');
  }

  const courseId = lesson.course;

  // 3. Xoá
  await lessonRepo.remove(lessonId);

  // 4. Cập nhật totalLectures và hasPendingChanges
  const totalLectures = await lessonRepo.countByCourse(courseId);
  const lessons = await lessonRepo.findByCourse(courseId);
  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
  const delPayload = { totalLectures, totalDuration: Math.round(totalDuration / 60) };
  if (course.reviewStatus === 'approved') delPayload.hasPendingChanges = true;
  await courseRepo.updateCourse(courseId, delPayload);

  return { message: 'Xoá bài học thành công' };
};
