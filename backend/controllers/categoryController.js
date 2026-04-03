import asyncHandler from 'express-async-handler';
import * as categoryService from '../services/categoryService.js';

/**
 * @desc    Get all categories (public)
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const onlyActive = req.query.active === 'true';
  const categories = await categoryService.getAllCategories(onlyActive);
  res.json({ success: true, data: categories });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json({ success: true, data: category });
});

/**
 * @desc    Create category (admin only)
 * @route   POST /api/categories
 * @access  Private (admin)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Tên danh mục là bắt buộc');
  }
  const category = await categoryService.createCategory({ name, description, icon }, req.user._id);
  res.status(201).json({
    success: true,
    data: category,
    message: 'Tạo danh mục thành công',
  });
});

/**
 * @desc    Update category (admin only)
 * @route   PUT /api/categories/:id
 * @access  Private (admin)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.json({
    success: true,
    data: category,
    message: 'Cập nhật danh mục thành công',
  });
});

/**
 * @desc    Delete category (admin only)
 * @route   DELETE /api/categories/:id
 * @access  Private (admin)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, ...result });
});
