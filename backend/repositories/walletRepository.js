import InstructorWallet from '../models/InstructorWallet.js';

/**
 * Wallet Repository — thin data-access layer for InstructorWallet
 */

// Tìm wallet theo instructor ID
export const findByInstructor = (instructorId) =>
  InstructorWallet.findOne({ instructor: instructorId });

// Tìm wallet và populate thông tin instructor
export const findByInstructorPopulated = (instructorId) =>
  InstructorWallet.findOne({ instructor: instructorId }).populate(
    'instructor',
    'name email avatar'
  );

// Tìm hoặc tạo mới wallet cho instructor
export const findOrCreate = async (instructorId) => {
  let wallet = await InstructorWallet.findOne({ instructor: instructorId });
  if (!wallet) {
    wallet = await InstructorWallet.create({ instructor: instructorId });
  }
  return wallet;
};

// Atomic: cộng tiền vào balance và totalEarned (tránh race condition)
export const incrementBalance = (instructorId, amount) =>
  InstructorWallet.findOneAndUpdate(
    { instructor: instructorId },
    { $inc: { balance: amount, totalEarned: amount } },
    { new: true, upsert: true }
  );

// Cập nhật thông tin ngân hàng
export const updateBankInfo = (instructorId, bankInfo) =>
  InstructorWallet.findOneAndUpdate(
    { instructor: instructorId },
    { $set: { bankInfo } },
    { new: true, upsert: true }
  );

// Lấy tất cả ví (Admin)
export const findAll = () =>
  InstructorWallet.find()
    .populate('instructor', 'name email avatar instructorStatus')
    .sort({ totalEarned: -1 });

// Cập nhật tỷ lệ hoa hồng (Admin)
export const updateCommissionRate = (walletId, rate) =>
  InstructorWallet.findByIdAndUpdate(
    walletId,
    { $set: { commissionRate: rate } },
    { new: true }
  );
