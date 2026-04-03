import User from '../models/User.js';

/**
 * User Repository — all raw DB queries for User collection
 */

export const findById = (id) => User.findById(id);

export const findByIdWithPassword = (id) =>
  User.findById(id).select('+password');

export const findByEmail = (email) => User.findOne({ email });

export const findByEmailWithPassword = (email) =>
  User.findOne({ email }).select('+password');

export const createUser = (data) => User.create(data);

export const findAllUsers = ({ page = 1, limit = 20, role, search } = {}) => {
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  return User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

export const countUsers = (query = {}) => User.countDocuments(query);

export const updateUserById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password');

export const findPendingInstructors = () =>
  User.find({ role: 'instructor', instructorStatus: 'pending' })
    .select('-password')
    .sort({ createdAt: -1 });
