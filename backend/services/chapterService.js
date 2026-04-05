import * as chapterRepo from '../repositories/chapterRepository.js';
import * as courseRepo from '../repositories/courseRepository.js';
import * as lessonRepo from '../repositories/lessonRepository.js';

/**
 * Chapter Service — business logic
 */

/**
 * Lấy tất cả chương của một khoá học (kèm bài học)
 */
export const getChaptersByCourse = async (courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');
  const chapters = await chapterRepo.findByCourse(courseId);

  // Gắn danh sách bài học vào mỗi chương
  const chaptersWithLessons = await Promise.all(
    chapters.map(async (ch) => {
      const lessons = await lessonRepo.findByCourse(courseId).then(
        (all) => all.filter((l) => l.chapter?.toString() === ch._id.toString())
      );
      return { ...ch.toObject(), lessons };
    })
  );
  return chaptersWithLessons;
};

/**
 * Chi tiết một chương
 */
export const getChapterById = async (chapterId) => {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter) throw new Error('Không tìm thấy chương học');
  return chapter;
};

/**
 * Tạo chương mới
 * Business rule: chỉ instructor sở hữu course mới được tạo
 */
export const createChapter = async (courseId, instructorId, data) => {
  const course = await courseRepo.findByIdAndInstructor(courseId, instructorId);
  if (!course) throw new Error('Không tìm thấy khoá học hoặc bạn không có quyền');

  let { order } = data;
  if (!order) {
    const maxOrder = await chapterRepo.maxOrderByCourse(courseId);
    order = maxOrder + 1;
  }

  return chapterRepo.create({ ...data, course: courseId, order });
};

/**
 * Cập nhật chương
 */
export const updateChapter = async (chapterId, instructorId, data) => {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter) throw new Error('Không tìm thấy chương học');

  const course = await courseRepo.findByIdAndInstructor(chapter.course, instructorId);
  if (!course) throw new Error('Bạn không có quyền chỉnh sửa chương này');

  return chapterRepo.update(chapterId, data);
};

/**
 * Xoá chương (và toàn bộ bài học trong chương)
 */
export const deleteChapter = async (chapterId, instructorId) => {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter) throw new Error('Không tìm thấy chương học');

  const course = await courseRepo.findByIdAndInstructor(chapter.course, instructorId);
  if (!course) throw new Error('Bạn không có quyền xoá chương này');

  // Xoá tất cả bài học trong chương
  const { default: Lesson } = await import('../models/Lesson.js');
  await Lesson.deleteMany({ chapter: chapterId });

  await chapterRepo.remove(chapterId);

  // Cập nhật totalLectures trên course
  const totalLectures = await lessonRepo.countByCourse(chapter.course);
  await courseRepo.updateCourse(chapter.course, { totalLectures });

  return { message: 'Xoá chương và toàn bộ bài học trong chương thành công' };
};
