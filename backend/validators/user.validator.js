/**
 * User Validators — changeRole (admin)
 *
 * Covers:
 *   PATCH /api/users/:id/role
 */
import Joi from 'joi';

// ── Change User Role ──────────────────────────────────────────────
export const changeRoleSchema = Joi.object({
  role: Joi.string().valid('student', 'instructor', 'admin').required().messages({
    'any.only': 'Vai trò phải là "student", "instructor", hoặc "admin"',
    'any.required': 'Vai trò mới là bắt buộc',
  }),
});
