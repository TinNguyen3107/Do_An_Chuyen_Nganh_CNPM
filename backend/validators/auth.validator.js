/**
 * Auth Validators — register, login, updateProfile
 *
 * Covers:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   PUT  /api/auth/profile
 */
import Joi from 'joi';

// ── Register ──────────────────────────────────────────────────────
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Tên phải có ít nhất 2 ký tự',
    'string.max': 'Tên không được vượt quá 100 ký tự',
    'any.required': 'Vui lòng cung cấp tên',
  }),

  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng cung cấp email',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Vui lòng cung cấp mật khẩu',
  }),

  role: Joi.string().valid('student', 'instructor').default('student').messages({
    'any.only': 'Vai trò phải là "student" hoặc "instructor"',
  }),

  // Instructor-only fields (optional for students)
  expertise: Joi.when('role', {
    is: 'instructor',
    then: Joi.string().min(2).required().messages({
      'any.required': 'Giảng viên phải cung cấp chuyên môn',
    }),
    otherwise: Joi.string().allow('', null).optional(),
  }),

  biography: Joi.string().max(1000).allow('', null).optional().messages({
    'string.max': 'Tiểu sử không được vượt quá 1000 ký tự',
  }),
});

// ── Login ─────────────────────────────────────────────────────────
export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng cung cấp email',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Vui lòng cung cấp mật khẩu',
  }),
});

// ── Update Profile ────────────────────────────────────────────────
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Tên phải có ít nhất 2 ký tự',
    'string.max': 'Tên không được vượt quá 100 ký tự',
  }),

  phone: Joi.string()
    .pattern(/^[0-9+\-\s]{7,15}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
    }),

  dateOfBirth: Joi.date().max('now').allow(null).optional().messages({
    'date.max': 'Ngày sinh không được là ngày trong tương lai',
  }),

  gender: Joi.string().valid('male', 'female', 'other', '').allow('').optional(),

  address: Joi.string().max(255).allow('', null).optional(),

  bio: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': 'Giới thiệu bản thân không được vượt quá 500 ký tự',
  }),

  avatar: Joi.string().uri().allow('', null).optional().messages({
    'string.uri': 'URL ảnh không hợp lệ',
  }),
});

// ── Forgot Password ────────────────────────────────────────────────
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng cung cấp email',
  }),
});

// ── Reset Password ─────────────────────────────────────────────────
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token là bắt buộc',
  }),
  new_password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
    'any.required': 'Vui lòng cung cấp mật khẩu mới',
  }),
});
