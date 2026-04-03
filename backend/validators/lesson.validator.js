/**
 * Lesson Validators
 *
 * Covers:
 *   POST /api/chapters/:chapterId/lessons  (createLesson)
 *   PUT  /api/lessons/:id                  (updateLesson)
 */
import Joi from 'joi';

// ── Sub-schema: Quiz question ──────────────────────────────────────
const questionSchema = Joi.object({
  question:     Joi.string().min(1).required().messages({ 'any.required': 'Câu hỏi là bắt buộc' }),
  options:      Joi.array().items(Joi.string()).min(2).max(6).required().messages({
    'array.min': 'Quiz phải có ít nhất 2 đáp án',
    'any.required': 'Danh sách đáp án là bắt buộc',
  }),
  correctIndex: Joi.number().integer().min(0).required().messages({
    'any.required': 'Đáp án đúng là bắt buộc',
  }),
});

// ── Create Lesson ──────────────────────────────────────────────────
export const createLessonSchema = Joi.object({
  title: Joi.string().min(2).max(200).required().messages({
    'string.min':   'Tiêu đề bài học phải có ít nhất 2 ký tự',
    'string.max':   'Tiêu đề không được vượt quá 200 ký tự',
    'any.required': 'Tiêu đề bài học là bắt buộc',
  }),

  type: Joi.string().valid('video', 'text', 'quiz').required().messages({
    'any.only':     'Loại bài học phải là video, text hoặc quiz',
    'any.required': 'Loại bài học là bắt buộc',
  }),

  order: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Thứ tự bài học phải lớn hơn 0',
  }),

  // Video fields
  video_url: Joi.when('type', {
    is: 'video',
    then: Joi.string().uri().optional().allow('').messages({
      'string.uri': 'URL video không hợp lệ',
    }),
    otherwise: Joi.any().strip(),
  }),
  duration: Joi.when('type', {
    is: 'video',
    then: Joi.number().min(0).optional().default(0),
    otherwise: Joi.any().strip(),
  }),

  // Text fields
  text_content: Joi.when('type', {
    is: 'text',
    then: Joi.string().optional().allow(''),
    otherwise: Joi.any().strip(),
  }),

  // Quiz fields
  questions: Joi.when('type', {
    is: 'quiz',
    then: Joi.array().items(questionSchema).optional().default([]).messages({
      'array.base': 'Danh sách câu hỏi không hợp lệ',
    }),
    otherwise: Joi.any().strip(),
  }),

  isPublished: Joi.boolean().optional().default(true),
});

// ── Update Lesson ──────────────────────────────────────────────────
export const updateLessonSchema = Joi.object({
  title:        Joi.string().min(2).max(200).optional(),
  type:         Joi.string().valid('video', 'text', 'quiz').optional(),
  order:        Joi.number().integer().min(1).optional(),
  video_url:    Joi.string().uri().optional().allow(''),
  duration:     Joi.number().min(0).optional(),
  text_content: Joi.string().optional().allow(''),
  questions:    Joi.array().items(questionSchema).min(1).optional(),
  isPublished:  Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật',
});
