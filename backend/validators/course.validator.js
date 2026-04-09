/**
 * Course Validators — createCourse, updateCourse
 *
 * Covers:
 *   POST /api/courses
 *   PUT  /api/courses/:id
 */
import Joi from 'joi';

// ── Create Course ─────────────────────────────────────────────────
export const createCourseSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Tiêu đề khoá học phải có ít nhất 5 ký tự',
    'string.max': 'Tiêu đề khoá học không được vượt quá 200 ký tự',
    'any.required': 'Tiêu đề khoá học là bắt buộc',
  }),

  description: Joi.string().min(10).required().messages({
    'string.min': 'Mô tả khoá học phải có ít nhất 10 ký tự',
    'any.required': 'Mô tả khoá học là bắt buộc',
  }),

  shortDescription: Joi.string().max(300).allow('', null).optional().messages({
    'string.max': 'Mô tả ngắn không được vượt quá 300 ký tự',
  }),

  // Passed as a string (ObjectId) from form-data / JSON
  category: Joi.string().length(24).required().messages({
    'string.length': 'category phải là một ObjectId hợp lệ (24 ký tự)',
    'any.required': 'Danh mục khoá học là bắt buộc',
  }),

  price: Joi.number().min(0).default(0).messages({
    'number.min': 'Giá không được âm',
  }),

  status: Joi.string().valid('draft', 'published').default('draft').messages({
    'any.only': 'Trạng thái phải là "draft" hoặc "published"',
  }),

  level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all').default('all').messages({
    'any.only': 'Cấp độ không hợp lệ',
  }),

  language: Joi.string().max(50).default('Tiếng Việt').optional(),

  // These arrive as JSON-stringified arrays from multipart/form-data
  requirements: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),

  objectives: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),

  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
});

// ── Update Course ─────────────────────────────────────────────────
// All fields optional; at least one must be present (catch in service)
export const updateCourseSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'Tiêu đề khoá học phải có ít nhất 5 ký tự',
    'string.max': 'Tiêu đề khoá học không được vượt quá 200 ký tự',
  }),

  description: Joi.string().min(10).optional().messages({
    'string.min': 'Mô tả khoá học phải có ít nhất 10 ký tự',
  }),

  shortDescription: Joi.string().max(300).allow('', null).optional(),

  category: Joi.string().length(24).optional().messages({
    'string.length': 'category phải là một ObjectId hợp lệ (24 ký tự)',
  }),

  price: Joi.number().min(0).optional().messages({
    'number.min': 'Giá không được âm',
  }),

  status: Joi.string().valid('draft', 'published', 'archived').optional().messages({
    'any.only': 'Trạng thái phải là "draft", "published", hoặc "archived"',
  }),

  level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all').optional(),

  language: Joi.string().max(50).optional(),

  requirements: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),

  objectives: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),

  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật',
});
