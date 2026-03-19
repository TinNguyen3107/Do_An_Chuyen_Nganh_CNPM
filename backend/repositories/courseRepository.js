import Course from '../models/Course.js';

export const findPublished = async ({ category, search, level, minPrice, maxPrice, page = 1, limit = 12 } = {}) => {
  const query = { status: 'published' };
  
  if (category) query.category = category;
  if (level) query.level = level;
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }
  
  const skip = (page - 1) * limit;
  
  return await Course.find(query)
    .populate('category', 'name slug')
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countPublished = async () => {
  return await Course.countDocuments({ status: 'published' });
};

export const findById = async (id) => {
  return await Course.findById(id)
    .populate('category', 'name slug description')
    .populate('instructor', 'name email bio expertise');
};

export const findByIdAndInstructor = async (id, instructorId) => {
  return await Course.findOne({ _id: id, instructor: instructorId })
    .populate('category', 'name slug');
};

export const findByInstructor = async (instructorId) => {
  return await Course.find({ instructor: instructorId })
    .populate('category', 'name')
    .sort({ createdAt: -1 });
};

export const createCourse = async (courseData) => {
  const course = new Course(courseData);
  return await course.save();
};

export const updateCourse = async (id, updateData) => {
  return await Course.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  }).populate('category', 'name');
};

export const deleteCourse = async (id) => {
  return await Course.findByIdAndDelete(id);
};

export const findAllForAdmin = async ({ page = 1, limit = 20, status }) => {
  const query = {};
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  
  const courses = await Course.find(query)
    .populate('category', 'name')
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Course.countDocuments(query);
  
  return {
    courses,
    total,
    page: +page,
    limit: +limit,
    totalPages: Math.ceil(total / limit)
  };
};

export default {
  findPublished,
  countPublished,
  findById,
  findByIdAndInstructor,
  findByInstructor,
  createCourse,
  updateCourse,
  deleteCourse,
  findAllForAdmin
};