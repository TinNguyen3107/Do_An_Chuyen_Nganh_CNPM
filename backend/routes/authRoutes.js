import express from 'express';

import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadCV, uploadImage } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

// POST /api/auth/register — supports CV upload for instructors
// Note: uploadCV runs BEFORE validate so req.body is populated by multer
router.post('/register', uploadCV.single('cvFile'), validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/profile — current user info
router.get('/profile', protect, authController.getProfile);

// PUT /api/auth/profile — update name and other info
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);

// PUT /api/auth/profile/avatar — upload avatar image
router.put('/profile/avatar', protect, uploadImage.single('avatar'), authController.uploadAvatarHandler);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/auth/reset-password/:resetToken
router.post('/reset-password/:resetToken', validate(resetPasswordSchema), authController.resetPassword);

export default router;
