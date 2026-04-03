import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import * as authService from '../services/authService.js';

/**
 * @desc    Register new user (student or instructor)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, expertise, biography } = req.body;

  // CV file path if uploaded via multer
  let cvUrl = '';
  if (req.file) {
    cvUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  const user = await authService.registerUser({
    name, email, password, role: role || 'student',
    expertise, biography, cvUrl,
  });

  // Auto-login students; instructors wait for approval
  if (user.role === 'student') {
    generateToken(res, user._id);
  }

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      instructorStatus: user.instructorStatus,
      avatar: user.avatar,
    },
    message: user.role === 'instructor'
      ? 'Đăng ký thành công! Tài khoản giảng viên đang chờ Admin xét duyệt.'
      : 'Đăng ký thành công! Chào mừng đến với 26Tech.',
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Vui lòng cung cấp email và mật khẩu');
  }

  const user = await authService.loginUser(email, password);
  const token = generateToken(res, user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      instructorStatus: user.instructorStatus,
      avatar: user.avatar,
      token, // also include in body for non-cookie clients
    },
  });
});

/**
 * @desc    Logout user — clear JWT cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const { user, instructorProfile } = await authService.getUserProfile(req.user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      instructorStatus: user.instructorStatus,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      instructorProfile,
    },
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, phone, dateOfBirth, gender, address, bio } = req.body;
  const updated = await authService.updateUserProfile(req.user._id, {
    name, avatar, phone, dateOfBirth, gender, address, bio,
  });

  res.json({
    success: true,
    data: updated,
    message: 'Cập nhật thông tin thành công',
  });
});

/**
 * @desc    Upload avatar image
 * @route   PUT /api/auth/profile/avatar
 * @access  Private
 */
export const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Vui lòng tải lên file ảnh');
  }
  const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const updated = await authService.updateUserProfile(req.user._id, { avatar: avatarUrl });

  res.json({
    success: true,
    data: updated,
    message: 'Cập nhật ảnh đại diện thành công',
  });
});
