import Chapter from '../models/Chapter.js';

/**
 * Chapter Repository — raw DB access, no business logic
 */

export const findByCourse = (courseId) =>
  Chapter.find({ course: courseId }).sort({ order: 1 });

export const findById = (id) => Chapter.findById(id);

export const findByIdAndCourse = (id, courseId) =>
  Chapter.findOne({ _id: id, course: courseId });

export const create = (data) => Chapter.create(data);

export const update = (id, data) =>
  Chapter.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const remove = (id) => Chapter.findByIdAndDelete(id);

export const countByCourse = (courseId) =>
  Chapter.countDocuments({ course: courseId });

/** Lấy order lớn nhất hiện tại để tự động tăng */
export const maxOrderByCourse = async (courseId) => {
  const last = await Chapter.findOne({ course: courseId }).sort({ order: -1 }).select('order');
  return last ? last.order : 0;
};
