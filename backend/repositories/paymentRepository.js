import Payment from '../models/Payment.js';

/**
 * Payment Repository
 */

export const create = (data) => Payment.create(data);

export const findByOrderId = (orderId) => Payment.findOne({ orderId });

export const findById = (id) =>
  Payment.findById(id)
    .populate('user', 'name email avatar')
    .populate('course', 'title thumbnail price');

export const findByUserAndCourse = (userId, courseId) =>
  Payment.findOne({ user: userId, course: courseId, status: 'success' });

export const findPendingByUserAndCourse = (userId, courseId) =>
  Payment.findOne({ user: userId, course: courseId, status: 'pending' });

export const updateByOrderId = (orderId, data) =>
  Payment.findOneAndUpdate({ orderId }, data, { new: true });

export const findByUser = (userId) =>
  Payment.find({ user: userId })
    .populate('course', 'title thumbnail price isFree')
    .sort({ createdAt: -1 });

export const findAll = (filter = {}) =>
  Payment.find(filter)
    .populate('user', 'name email')
    .populate('course', 'title price')
    .sort({ createdAt: -1 });

export const getStats = async () => {
  // Dùng aggregation để lấy đầy đủ số liệu revenue split
  const [agg] = await Payment.aggregate([
    {
      $facet: {
        // Tổng hợp theo status
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        // Tổng hợp theo method
        byMethod: [
          { $group: { _id: '$method', count: { $sum: 1 } } },
        ],
        // Doanh thu từ các payment thành công
        revenue: [
          { $match: { status: 'success' } },
          {
            $group: {
              _id: null,
              totalAmount:        { $sum: '$amount' },
              totalPlatformFee:   { $sum: '$platformFee' },
              totalCommission:    { $sum: '$commissionAmount' },
              processedCount:     { $sum: { $cond: ['$commissionProcessed', 1, 0] } },
            },
          },
        ],
      },
    },
  ]);

  // Chuyển byStatus array → object
  const statusMap = {};
  (agg?.byStatus || []).forEach(({ _id, count }) => { statusMap[_id] = count; });

  // Chuyển byMethod array → object
  const methodMap = {};
  (agg?.byMethod || []).forEach(({ _id, count }) => { methodMap[_id] = count; });

  const rev = agg?.revenue?.[0] || {};

  return {
    total:   Object.values(statusMap).reduce((s, c) => s + c, 0),
    success: statusMap.success  || 0,
    pending: statusMap.pending  || 0,
    failed:  statusMap.failed   || 0,
    cancelled: statusMap.cancelled || 0,

    // ── Doanh thu ──────────────────────────────────────────────
    totalAmount:      rev.totalAmount      || 0,  // Tổng tiền học viên đã trả
    totalPlatformFee: rev.totalPlatformFee || 0,  // 30% — thu nhập platform (Admin)
    totalCommission:  rev.totalCommission  || 0,  // 70% — hoa hồng instructor

    byMethod: {
      momo:      methodMap.momo      || 0,
      momo_mock: methodMap.momo_mock || 0,
      atm:       methodMap.atm       || 0,
      bank:      methodMap.bank      || 0,
    },
  };
};
