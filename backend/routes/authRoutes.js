import express from 'express';

import { register, login, logout, getProfile, updateProfile, uploadAvatarHandler } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadCV, uploadImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// POST /api/auth/register — supports CV upload for instructors
router.post('/register', uploadCV.single('cvFile'), register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/profile — current user info
router.get('/profile', protect, getProfile);

// PUT /api/auth/profile — update name and other info
router.put('/profile', protect, updateProfile);

// PUT /api/auth/profile/avatar — upload avatar image
router.put('/profile/avatar', protect, uploadImage.single('avatar'), uploadAvatarHandler);

export default router;
