/**
 * reportService.js — Business logic / aggregation queries cho Admin Reports
 *
 * Mỗi hàm nhận { startDate, endDate, groupBy } và trả về { summary, rows }
 */

import Payment    from '../models/Payment.js';
import User       from '../models/User.js';
import Course     from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payout     from '../models/Payout.js';
import InstructorWallet from '../models/InstructorWallet.js';

// ─── Helper: parse date range ────────────────────────────────────────────────
function parseDateRange(startDate, endDate) {
  const from = startDate ? new Date(startDate) : new Date('2000-01-01');
  const to   = endDate   ? new Date(endDate)   : new Date();
  to.setHours(23, 59, 59, 999); // đến cuối ngày
  return { from, to };
}

// ─── 1. REVENUE REPORT ───────────────────────────────────────────────────────
/**
 * Báo cáo doanh thu theo ngày hoặc theo tháng
 * @param {{ startDate, endDate, groupBy }} opts
 * @returns {{ summary, rows }}
 */
export async function getRevenueReport({ startDate, endDate, groupBy = 'day' }) {
  const { from, to } = parseDateRange(startDate, endDate);

  // ── Group expression ────────────────────────────────────────────────────
  const groupExpr =
    groupBy === 'month'
      ? { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } }
      : { year: { $year: '$paidAt' }, month: { $month: '$paidAt' }, day: { $dayOfMonth: '$paidAt' } };

  const agg = await Payment.aggregate([
    {
      $match: {
        status:  'success',
        paidAt:  { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id:             groupExpr,
        totalAmount:     { $sum: '$amount' },
        platformFee:     { $sum: '$platformFee' },
        commissionAmount:{ $sum: '$commissionAmount' },
        count:           { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // ── Summary tổng ─────────────────────────────────────────────────────────
  const summary = agg.reduce(
    (acc, cur) => {
      acc.totalRevenue     += cur.totalAmount;
      acc.totalPlatformFee += cur.platformFee;
      acc.totalCommission  += cur.commissionAmount;
      acc.totalTransactions+= cur.count;
      return acc;
    },
    { totalRevenue: 0, totalPlatformFee: 0, totalCommission: 0, totalTransactions: 0 },
  );

  // ── Format rows ───────────────────────────────────────────────────────────
  const rows = agg.map((item) => {
    const { year, month, day } = item._id;
    const label =
      groupBy === 'month'
        ? `${String(month).padStart(2, '0')}/${year}`
        : `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

    return {
      period:          label,
      transactions:    item.count,
      totalAmount:     item.totalAmount,
      platformFee:     item.platformFee,
      commissionAmount:item.commissionAmount,
    };
  });

  return { summary, rows };
}

// ─── 2. USER REPORT ──────────────────────────────────────────────────────────
/**
 * Báo cáo danh sách người dùng + số khoá học đã đăng ký
 */
export async function getUserReport({ startDate, endDate }) {
  const { from, to } = parseDateRange(startDate, endDate);

  const users = await User.aggregate([
    {
      $match: {
        role:      { $ne: 'admin' },
        createdAt: { $gte: from, $lte: to },
      },
    },
    {
      $lookup: {
        from:         'enrollments',
        localField:   '_id',
        foreignField: 'user',
        as:           'enrollments',
      },
    },
    {
      $project: {
        name:            1,
        email:           1,
        role:            1,
        isActive:        1,
        createdAt:       1,
        enrollmentCount: { $size: '$enrollments' },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  const summary = {
    totalUsers:       users.length,
    totalStudents:    users.filter((u) => u.role === 'student').length,
    totalInstructors: users.filter((u) => u.role === 'instructor').length,
    activeUsers:      users.filter((u) => u.isActive).length,
  };

  const rows = users.map((u) => ({
    name:            u.name,
    email:           u.email,
    role:            u.role === 'student' ? 'Học viên' : 'Giảng viên',
    status:          u.isActive ? 'Hoạt động' : 'Bị khoá',
    enrollmentCount: u.enrollmentCount,
    createdAt:       new Date(u.createdAt).toLocaleDateString('vi-VN'),
  }));

  return { summary, rows };
}

// ─── 3. COURSE REPORT ────────────────────────────────────────────────────────
/**
 * Báo cáo khoá học: doanh thu, số học viên, rating
 */
export async function getCourseReport({ startDate, endDate }) {
  const { from, to } = parseDateRange(startDate, endDate);

  const courses = await Course.aggregate([
    {
      $lookup: {
        from:         'payments',
        localField:   '_id',
        foreignField: 'course',
        pipeline:     [
          { $match: { status: 'success', paidAt: { $gte: from, $lte: to } } },
        ],
        as: 'payments',
      },
    },
    {
      $lookup: {
        from:         'users',
        localField:   'instructor',
        foreignField: '_id',
        as:           'instructorInfo',
      },
    },
    {
      $lookup: {
        from:         'categories',
        localField:   'category',
        foreignField: '_id',
        as:           'categoryInfo',
      },
    },
    {
      $project: {
        title:          1,
        status:         1,
        price:          1,
        totalStudents:  1,
        averageRating:  1,
        totalReviews:   1,
        createdAt:      1,
        instructorName: { $arrayElemAt: ['$instructorInfo.name', 0] },
        categoryName:   { $arrayElemAt: ['$categoryInfo.name',   0] },
        revenue:        { $sum: '$payments.amount' },
        paymentCount:   { $size: '$payments' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const summary = {
    totalCourses:     courses.length,
    publishedCourses: courses.filter((c) => c.status === 'published').length,
    totalRevenue:     courses.reduce((s, c) => s + (c.revenue || 0), 0),
    avgRating:        courses.length
      ? (courses.reduce((s, c) => s + (c.averageRating || 0), 0) / courses.length).toFixed(2)
      : 0,
  };

  const rows = courses.map((c) => ({
    title:          c.title,
    instructor:     c.instructorName || 'N/A',
    category:       c.categoryName   || 'N/A',
    status:         c.status === 'published' ? 'Đã xuất bản' : c.status === 'draft' ? 'Nháp' : 'Lưu trữ',
    price:          c.price,
    totalStudents:  c.totalStudents,
    averageRating:  c.averageRating,
    totalReviews:   c.totalReviews,
    revenue:        c.revenue || 0,
    createdAt:      new Date(c.createdAt).toLocaleDateString('vi-VN'),
  }));

  return { summary, rows };
}

// ─── 4. INSTRUCTOR REPORT ────────────────────────────────────────────────────
/**
 * Báo cáo giảng viên: hoa hồng, số payout, số khoá học
 */
export async function getInstructorReport({ startDate, endDate }) {
  const { from, to } = parseDateRange(startDate, endDate);

  const instructors = await User.aggregate([
    { $match: { role: 'instructor', instructorStatus: 'approved' } },
    {
      $lookup: {
        from:         'courses',
        localField:   '_id',
        foreignField: 'instructor',
        as:           'courses',
      },
    },
    {
      $lookup: {
        from:         'payouts',
        localField:   '_id',
        foreignField: 'instructor',
        pipeline:     [
          { $match: { createdAt: { $gte: from, $lte: to } } },
        ],
        as: 'payouts',
      },
    },
    {
      $lookup: {
        from:         'instructorwallets',
        localField:   '_id',
        foreignField: 'instructor',
        as:           'wallet',
      },
    },
    {
      $project: {
        name:           1,
        email:          1,
        createdAt:      1,
        totalCourses:   { $size: '$courses' },
        totalPayouts:   { $size: '$payouts' },
        payoutAmount:   { $sum: '$payouts.amount' },
        walletBalance:  { $arrayElemAt: ['$wallet.balance', 0] },
        totalEarned:    { $arrayElemAt: ['$wallet.totalEarned', 0] },
      },
    },
    { $sort: { payoutAmount: -1 } },
  ]);

  const summary = {
    totalInstructors: instructors.length,
    totalPayoutAmount:instructors.reduce((s, i) => s + (i.payoutAmount || 0), 0),
    totalEarned:      instructors.reduce((s, i) => s + (i.totalEarned || 0), 0),
  };

  const rows = instructors.map((i) => ({
    name:          i.name,
    email:         i.email,
    totalCourses:  i.totalCourses,
    walletBalance: i.walletBalance || 0,
    totalEarned:   i.totalEarned   || 0,
    payoutAmount:  i.payoutAmount  || 0,
    totalPayouts:  i.totalPayouts,
    joinedAt:      new Date(i.createdAt).toLocaleDateString('vi-VN'),
  }));

  return { summary, rows };
}
