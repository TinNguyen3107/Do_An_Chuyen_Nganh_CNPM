import Course from '../models/Course.js';

/**
 * Course Repository
 */

export const findPublished = ({ category, search, level, minPrice, maxPrice, page = 1, limit = 12 } = {}) => {
  const query = { status: 'published' };

  if (category) query.category = category;
  if (level) query.level = level;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  return Course.find(query)
    .populate('instructor', 'name avatar')
    .populate('category', 'name slug')
    .sort({ totalStudents: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

export const countPublished = (query = {}) =>
  Course.countDocuments({ status: 'published', ...query });

export const findById = (id) =>
  Course.findById(id)
    .populate('instructor', 'name avatar')
    .populate('category', 'name slug');

export const findByIdAndInstructor = (courseId, instructorId) =>
  Course.findOne({ _id: courseId, instructor: instructorId });

export const findByInstructor = (instructorId) =>
  Course.find({ instructor: instructorId })
    .populate('category', 'name slug')
    .sort({ updatedAt: -1 });

export const createCourse = (data) => Course.create(data);

export const updateCourse = (id, data) =>
  Course.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('instructor', 'name avatar')
    .populate('category', 'name slug');

export const deleteCourse = (id) => Course.findByIdAndDelete(id);

export const findAllForAdmin = ({ page = 1, limit = 20, status } = {}) => {
  const query = {};
  if (status) query.status = status;
  return Course.find(query)
    .populate('instructor', 'name email')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

export const incrementStudentCount = (courseId) =>
  Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });
