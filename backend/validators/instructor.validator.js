/**
 * Instructor Validators — applyAsInstructor, rejectInstructor
 *
 * Covers:
 *   POST  /api/instructors/apply
 *   PATCH /api/instructors/applications/:id/reject
 */
import Joi from 'joi';

// ── Apply as Instructor ───────────────────────────────────────────
export const applyAsInstructorSchema = Joi.object({
  expertise: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Chuyên môn phải có ít nhất 2 ký tự',
    'string.max': 'Chuyên môn không được vượt quá 200 ký tự',
    'any.required': 'Chuyên môn là bắt buộc',
  }),

  yearsOfExperience: Joi.number().integer().min(0).max(50).default(0).messages({
    'number.min': 'Số năm kinh nghiệm không được âm',
    'number.max': 'Số năm kinh nghiệm không hợp lệ',
    'number.integer': 'Số năm kinh nghiệm phải là số nguyên',
  }),

  education: Joi.string().max(300).allow('', null).optional().messages({
    'string.max': 'Học vấn không được vượt quá 300 ký tự',
  }),

  biography: Joi.string().max(2000).allow('', null).optional().messages({
    'string.max': 'Tiểu sử không được vượt quá 2000 ký tự',
  }),

  portfolio: Joi.string().uri().allow('', null).optional().messages({
    'string.uri': 'Portfolio phải là một URL hợp lệ',
  }),
});

// ── Reject Instructor (admin provides a note) ─────────────────────
export const rejectInstructorSchema = Joi.object({
  adminNote: Joi.string().min(5).max(500).allow('', null).optional().messages({
    'string.min': 'Ghi chú từ chối phải có ít nhất 5 ký tự',
    'string.max': 'Ghi chú không được vượt quá 500 ký tự',
  }),
});
