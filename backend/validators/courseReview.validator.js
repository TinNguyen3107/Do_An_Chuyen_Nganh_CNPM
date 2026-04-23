/**
 * Course Review Validator
 * Joi schemas cho course review/approval
 */
import Joi from 'joi';

export const rejectCourseSchema = Joi.object({
  rejectionReason: Joi.string().min(3).max(500).trim().required().messages({
    'string.empty': 'Lý do từ chối không được để trống',
    'string.min': 'Lý do từ chối phải có ít nhất 3 ký tự',
    'string.max': 'Lý do từ chối không được vượt quá 500 ký tự',
  }),
});

export default {
  rejectCourseSchema,
};
