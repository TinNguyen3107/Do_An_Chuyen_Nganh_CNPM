import * as categoryRepo from '../repositories/categoryRepository.js';

/**
 * Category Service
 */

export const getAllCategories = async (onlyActive = false) => {
  return categoryRepo.findAll(onlyActive);
};

export const getCategoryById = async (id) => {
  const cat = await categoryRepo.findById(id);
  if (!cat) throw new Error('Không tìm thấy danh mục');
  return cat;
};

export const createCategory = async ({ name, description, icon }, createdBy) => {
  // Check duplicate name
  const existing = await categoryRepo.findByName(name);
  if (existing) throw new Error('Danh mục này đã tồn tại');
  return categoryRepo.createCategory({ name, description, icon, createdBy });
};

export const updateCategory = async (id, { name, description, icon, isActive }) => {
  const cat = await categoryRepo.findById(id);
  if (!cat) throw new Error('Không tìm thấy danh mục');

  // Check name conflict if name is changing
  if (name && name !== cat.name) {
    const conflict = await categoryRepo.findByName(name);
    if (conflict) throw new Error('Danh mục với tên này đã tồn tại');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;
  if (isActive !== undefined) updateData.isActive = isActive;

  return categoryRepo.updateCategory(id, updateData);
};

export const deleteCategory = async (id) => {
  const cat = await categoryRepo.findById(id);
  if (!cat) throw new Error('Không tìm thấy danh mục');
  await categoryRepo.deleteCategory(id);
  return { message: 'Xóa danh mục thành công' };
};
