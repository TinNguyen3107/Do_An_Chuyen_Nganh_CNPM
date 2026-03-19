/**
 * Enrollment Validators
 *
 * Covers:
 *   POST /api/enrollments   { courseId }
 */
import Joi from 'joi';

// ── Enroll in a course ────────────────────────────────────────────
export const enrollCourseSchema = Joi.object({
  courseId: Joi.string().length(24).required().messages({
    'string.length': 'courseId phải là một ObjectId hợp lệ (24 ký tự)',
    'any.required': 'courseId là bắt buộc',
  }),
});
