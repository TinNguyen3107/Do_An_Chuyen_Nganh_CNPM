/**
 * Chapter Validators
 *
 * Covers:
 *   POST /api/courses/:courseId/chapters  (createChapter)
 *   PUT  /api/chapters/:id                (updateChapter)
 */
import Joi from 'joi';

export const createChapterSchema = Joi.object({
  title: Joi.string().min(2).max(200).required().messages({
    'string.min':   'Tên chương phải có ít nhất 2 ký tự',
    'string.max':   'Tên chương không được vượt quá 200 ký tự',
    'any.required': 'Tên chương là bắt buộc',
  }),
  description: Joi.string().max(500).allow('').optional(),
  order: Joi.number().integer().min(1).optional(),
  isPublished: Joi.boolean().optional().default(true),
});

export const updateChapterSchema = Joi.object({
  title:       Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(500).allow('').optional(),
  order:       Joi.number().integer().min(1).optional(),
  isPublished: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật',
});
