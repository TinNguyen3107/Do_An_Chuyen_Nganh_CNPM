import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * @desc    Get system overview stats (kèm doanh thu)
 * @route   GET /api/stats/overview
 * @access  Private (admin)
 */
router.get('/overview', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    pendingInstructors,
    totalCourses,
    publishedCourses,
    totalCategories,
    totalEnrollments,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor', instructorStatus: 'approved' }),
    User.countDocuments({ role: 'instructor', instructorStatus: 'pending' }),
    Course.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Category.countDocuments(),
    Enrollment.countDocuments(),

    // Tính doanh thu từ các payment thành công
    Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: null,
          totalRevenue:     { $sum: '$amount' },           // Tổng tiền thu được
          totalPlatformFee: { $sum: '$platformFee' },      // 30% — phần admin giữ lại
          totalCommission:  { $sum: '$commissionAmount' }, // 70% — đã trả instructor
        },
      },
    ]),
  ]);

  const rev = revenueAgg[0] || {};

  res.json({
    success: true,
    data: {
      // Người dùng
      totalUsers,
      totalStudents,
      totalInstructors,
      pendingInstructors,

      // Khoá học
      totalCourses,
      publishedCourses,
      totalCategories,
      totalEnrollments,

      // ── Doanh thu ─────────────────────────────────────────────
      totalRevenue:     rev.totalRevenue     || 0,  // Tổng thu từ học viên
      totalPlatformFee: rev.totalPlatformFee || 0,  // Lợi nhuận thực của platform (30%)
      totalCommission:  rev.totalCommission  || 0,  // Tổng đã trả cho instructor (70%)
    },
  });
}));

export default router;
