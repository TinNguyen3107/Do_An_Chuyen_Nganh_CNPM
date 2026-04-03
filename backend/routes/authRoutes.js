import express from 'express';

import { register, login, logout, getProfile, updateProfile, uploadAvatarHandler } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadCV, uploadImage } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

// POST /api/auth/register — supports CV upload for instructors
// Note: uploadCV runs BEFORE validate so req.body is populated by multer
router.post('/register', uploadCV.single('cvFile'), validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/profile — current user info
router.get('/profile', protect, getProfile);

// PUT /api/auth/profile — update name and other info
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

// PUT /api/auth/profile/avatar — upload avatar image
router.put('/profile/avatar', protect, uploadImage.single('avatar'), uploadAvatarHandler);

export default router;
