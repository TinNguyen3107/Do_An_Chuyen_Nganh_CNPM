import Lesson from '../models/Lesson.js';

/**
 * Lesson Repository — raw DB access, no business logic
 */

export const findByCourse = (courseId) =>
  Lesson.find({ course: courseId }).sort({ order: 1 });

export const findById = (id) => Lesson.findById(id);

export const findByIdAndCourse = (id, courseId) =>
  Lesson.findOne({ _id: id, course: courseId });

export const create = (data) => Lesson.create(data);

export const update = (id, data) =>
  Lesson.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const remove = (id) => Lesson.findByIdAndDelete(id);

export const countByCourse = (courseId) =>
  Lesson.countDocuments({ course: courseId });

/** Lấy order lớn nhất hiện tại trong course để tự động tăng */
export const maxOrderByCourse = async (courseId) => {
  const last = await Lesson.findOne({ course: courseId }).sort({ order: -1 }).select('order');
  return last ? last.order : 0;
};
