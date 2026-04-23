import * as userRepo from '../repositories/userRepository.js';
import * as instructorRepo from '../repositories/instructorRepository.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';


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

/**
 * Mật khẩu quên: Tạo token, băm và lưu vào user, gửi email
 */
export const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new Error('Email không tồn tại trong hệ thống');
  }

  // Tạo token thô
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Băm token để lưu DB (tăng bảo mật)
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút

  await userRepo.updateUserById(user._id, {
    resetPasswordToken,
    resetPasswordExpire,
  });

  // URL gửi đi: dùng token THÔ
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.\n\nVui lòng truy cập đường dẫn sau để đặt mật khẩu mới:\n\n${resetUrl}\n\nĐường dẫn tự động hết hạn sau 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.`;

  try {
    await sendEmail({
      email: user.email,
      subject: '26Tech LMS - Yêu cầu Đặt lại mật khẩu',
      message,
    });
  } catch (err) {
    // Revert token fields
    await userRepo.updateUserById(user._id, {
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    });
    throw new Error('Không thể gửi email. Vui lòng thử lại sau');
  }
};

/**
 * Đặt lại mật khẩu: kiểm tra token hợp lệ và cập nhật mật khẩu mới
 */
export const resetPassword = async (resetToken, newPassword) => {
  // Băm token client gửi lên để khớp với DB
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await userRepo.findByResetToken(resetPasswordToken);

  if (!user) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }

  // Cập nhật lại mật khẩu và xoá token
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save(); // Kích hoạt pre('save') để băm mật khẩu

  // Return user if necessary
  return user;
};
