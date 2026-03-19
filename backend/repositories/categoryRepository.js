import Category from '../models/Category.js';

export const findAll = async () => {
  return await Category.find({}).sort({ name: 1 });
};

export const findById = async (id) => {
  return await Category.findById(id);
};

export const findBySlug = async (slug) => {
  return await Category.findOne({ slug });
};

export const createCategory = async (data) => {
  const category = new Category(data);
  return await category.save();
};

export const updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { 
    new: true, 
    runValidators: true 
  });
};

export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

export const exists = async (filter) => {
  return await Category.exists(filter);
};

export default {
  findAll,
  findById,
  findBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  exists
};