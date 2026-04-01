import InstructorProfile from '../models/InstructorProfile.js';

/**
 * InstructorProfile Repository
 */

export const findByUserId = (userId) =>
  InstructorProfile.findOne({ user: userId }).populate('user', 'name email avatar');

export const findById = (id) =>
  InstructorProfile.findById(id).populate('user', 'name email avatar');

export const createProfile = (data) => InstructorProfile.create(data);

export const updateProfile = (id, data) =>
  InstructorProfile.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const updateByUserId = (userId, data) =>
  InstructorProfile.findOneAndUpdate({ user: userId }, data, { new: true });

export const findAllApplications = ({ status, page = 1, limit = 20 } = {}) => {
  const query = {};
  if (status) query.status = status;
  return InstructorProfile.find(query)
    .populate('user', 'name email avatar createdAt')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

export const countApplications = (query = {}) =>
  InstructorProfile.countDocuments(query);
