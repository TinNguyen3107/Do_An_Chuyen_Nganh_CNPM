/**
 * Category Validators — createCategory, updateCategory
 *
 * Covers:
 *   POST /api/categories
 *   PUT  /api/categories/:id
 */
import Joi from 'joi';

// ── Create Category ───────────────────────────────────────────────
export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Tên danh mục phải có ít nhất 2 ký tự',
    'string.max': 'Tên danh mục không được vượt quá 100 ký tự',
    'any.required': 'Tên danh mục là bắt buộc',
  }),

  description: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': 'Mô tả không được vượt quá 500 ký tự',
  }),

  icon: Joi.string().max(100).allow('', null).optional(),
});

// ── Update Category ───────────────────────────────────────────────
export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Tên danh mục phải có ít nhất 2 ký tự',
    'string.max': 'Tên danh mục không được vượt quá 100 ký tự',
  }),

  description: Joi.string().max(500).allow('', null).optional(),

  icon: Joi.string().max(100).allow('', null).optional(),

  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật',
});
