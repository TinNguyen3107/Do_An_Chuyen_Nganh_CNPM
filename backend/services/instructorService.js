import * as instructorRepo from '../repositories/instructorRepository.js';
import * as userRepo from '../repositories/userRepository.js';

/**
 * Instructor Service — business logic for instructor management
 */

/**
 * Get the current user's instructor application status
 */
export const getMyApplication = async (userId) => {
  const profile = await instructorRepo.findByUserId(userId);
  if (!profile) throw new Error('Bạn chưa có hồ sơ giảng viên');
  return profile;
};

/**
 * Submit/update instructor application
 */
export const submitApplication = async (userId, { expertise, yearsOfExperience, education, biography, portfolio, cvUrl }) => {
  // Check if profile already exists
  let profile = await instructorRepo.findByUserId(userId);

  if (profile) {
    // Only allow resubmit if rejected
    if (profile.status === 'pending') {
      throw new Error('Hồ sơ của bạn đang chờ xét duyệt');
    }
    if (profile.status === 'approved') {
      throw new Error('Tài khoản của bạn đã được phê duyệt');
    }
    // Update rejected profile
    profile = await instructorRepo.updateByUserId(userId, {
      expertise, yearsOfExperience, education,
      biography, portfolio, cvUrl,
      status: 'pending',
      adminNote: '',
    });
  } else {
    profile = await instructorRepo.createProfile({
      user: userId,
      expertise, yearsOfExperience,
      education, biography, portfolio, cvUrl,
    });
  }

  return profile;
};

/**
 * Admin: get all instructor applications with optional status filter
 */
export const getAllApplications = async ({ status, page, limit } = {}) => {
  const [applications, total] = await Promise.all([
    instructorRepo.findAllApplications({ status, page, limit }),
    instructorRepo.countApplications(status ? { status } : {}),
  ]);
  return { applications, total, page, limit };
};

/**
 * Admin: approve instructor application
 */
export const approveInstructor = async (profileId, adminId) => {
  const profile = await instructorRepo.findById(profileId);
  if (!profile) throw new Error('Không tìm thấy hồ sơ giảng viên');
  if (profile.status === 'approved') throw new Error('Hồ sơ này đã được duyệt');

  // Update instructor profile status
  const updatedProfile = await instructorRepo.updateProfile(profileId, {
    status: 'approved',
    reviewedBy: adminId,
    reviewedAt: new Date(),
  });

  // Update user's instructorStatus
  await userRepo.updateUserById(profile.user._id, {
    instructorStatus: 'approved',
  });

  return updatedProfile;
};

/**
 * Admin: reject instructor application
 */
export const rejectInstructor = async (profileId, adminId, adminNote = '') => {
  const profile = await instructorRepo.findById(profileId);
  if (!profile) throw new Error('Không tìm thấy hồ sơ giảng viên');

  const updatedProfile = await instructorRepo.updateProfile(profileId, {
    status: 'rejected',
    adminNote,
    reviewedBy: adminId,
    reviewedAt: new Date(),
  });

  // Update user's instructorStatus
  await userRepo.updateUserById(profile.user._id, {
    instructorStatus: 'rejected',
  });

  return updatedProfile;
};
