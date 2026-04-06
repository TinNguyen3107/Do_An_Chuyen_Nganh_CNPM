import Payout from '../models/Payout.js';

/**
 * Payout Repository — thin data-access layer for Payout
 */

// Tạo payout request mới
export const create = (data) => Payout.create(data);

// Tìm payout theo ID (populate instructor)
export const findById = (id) =>
  Payout.findById(id)
    .populate('instructor', 'name email avatar')
    .populate('processedBy', 'name email');

// Lịch sử rút tiền của instructor
export const findByInstructor = (instructorId) =>
  Payout.find({ instructor: instructorId })
    .sort({ createdAt: -1 });

// Lấy payout đang pending của instructor (để check "không được có 2 pending cùng lúc")
export const findPendingByInstructor = (instructorId) =>
  Payout.findOne({ instructor: instructorId, status: 'pending' });

// Lấy danh sách theo status (Admin)
export const findByStatus = (status) =>
  Payout.find({ status })
    .populate('instructor', 'name email avatar')
    .sort({ createdAt: -1 });

// Lấy tất cả payout (Admin, có filter)
export const findAll = (filter = {}) =>
  Payout.find(filter)
    .populate('instructor', 'name email avatar')
    .populate('processedBy', 'name email')
    .sort({ createdAt: -1 });

// Cập nhật trạng thái payout
export const updateStatus = (id, data) =>
  Payout.findByIdAndUpdate(id, data, { new: true })
    .populate('instructor', 'name email avatar');

// Thống kê tổng hợp cho Admin
export const getStats = async () => {
  const [pending, processing, completed, rejected] = await Promise.all([
    Payout.countDocuments({ status: 'pending' }),
    Payout.countDocuments({ status: 'processing' }),
    Payout.countDocuments({ status: 'completed' }),
    Payout.countDocuments({ status: 'rejected' }),
  ]);
  const totalPaid = await Payout.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return {
    pending,
    processing,
    completed,
    rejected,
    totalPaid: totalPaid[0]?.total ?? 0,
  };
};
