import Category from '../models/Category.js';

/**
 * Category Repository
 */

export const findAll = (onlyActive = false) => {
  const query = onlyActive ? { isActive: true } : {};
  return Category.find(query).sort({ name: 1 });
};

export const findById = (id) => Category.findById(id);

export const findBySlug = (slug) => Category.findOne({ slug });

export const findByName = (name) =>
  Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

export const createCategory = (data) => Category.create(data);

export const updateCategory = (id, data) =>
  Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteCategory = (id) => Category.findByIdAndDelete(id);

export const count = () => Category.countDocuments();
