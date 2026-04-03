import * as userRepo from '../repositories/userRepository.js';
import * as instructorRepo from '../repositories/instructorRepository.js';

/**
 * Auth Service — all authentication business logic
 */

/**
 * Register a new user
 * - Student: status active immediately
 * - Instructor: creates InstructorProfile with status pending
 */
export const registerUser = async ({ name, email, password, role, expertise, biography, cvUrl }) => {
  // Check duplicate email
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new Error('Email này đã được sử dụng');
  }

  // Validate role
  if (!['student', 'instructor'].includes(role)) {
    throw new Error('Vai trò không hợp lệ');
  }

  // Create the user
  const instructorStatus = role === 'instructor' ? 'pending' : 'none';
  const user = await userRepo.createUser({ name, email, password, role, instructorStatus });

  // If instructor, create separate profile document
  if (role === 'instructor') {
    await instructorRepo.createProfile({
      user: user._id,
      expertise: expertise || '',
      biography: biography || '',
      cvUrl: cvUrl || '',
    });
  }

  return user;
};

/**
 * Login user — validates credentials
 */
export const loginUser = async (email, password) => {
  const user = await userRepo.findByEmailWithPassword(email);

  if (!user) {
    throw new Error('Email không tồn tại trong hệ thống');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Mật khẩu không chính xác');
  }

  if (!user.isActive) {
    throw new Error('Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ Admin');
  }

  return user;
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error('Không tìm thấy thông tin tài khoản');

  // If instructor, also return profile
  let instructorProfile = null;
  if (user.role === 'instructor') {
    instructorProfile = await instructorRepo.findByUserId(userId);
  }

  return { user, instructorProfile };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, { name, avatar, phone, dateOfBirth, gender, address, bio }) => {
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (phone !== undefined) updateData.phone = phone;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
  if (gender !== undefined) updateData.gender = gender;
  if (address !== undefined) updateData.address = address;
  if (bio !== undefined) updateData.bio = bio;

  const updated = await userRepo.updateUserById(userId, updateData);
  if (!updated) throw new Error('Không tìm thấy người dùng');
  return updated;
};
