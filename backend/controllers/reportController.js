/**
 * reportController.js — Controller xử lý Admin Report APIs
 *
 * Routes:
 *   GET /api/reports/revenue             → JSON data
 *   GET /api/reports/revenue/export      → file CSV / Excel
 *   GET /api/reports/users               → JSON data
 *   GET /api/reports/users/export        → file CSV / Excel
 *   GET /api/reports/courses             → JSON data
 *   GET /api/reports/courses/export      → file CSV / Excel
 *   GET /api/reports/instructors         → JSON data
 *   GET /api/reports/instructors/export  → file CSV / Excel
 */

import asyncHandler from 'express-async-handler';
import {
  getRevenueReport,
  getUserReport,
  getCourseReport,
  getInstructorReport,
} from '../services/reportService.js';
import {
  generateExcel,
  generateCSV,
  sendExportResponse,
} from '../utils/exportHelper.js';
import { dateRangeSchema } from '../validators/report.validator.js';

// ─── Helper: validate query và trả lỗi 400 nếu không hợp lệ ─────────────────
function validateDateRange(req, res) {
  const { error, value } = dateRangeSchema.validate(req.query, { abortEarly: false });
  if (error) {
    res.status(400);
    throw new Error(error.details.map((d) => d.message).join('; '));
  }
  return value; // trả về object đã được cast & default
}

// ─── Column definitions cho từng loại báo cáo ────────────────────────────────
const REVENUE_COLS = [
  { header: 'Kỳ',               key: 'period',          width: 18 },
  { header: 'Số giao dịch',     key: 'transactions',    width: 14 },
  { header: 'Doanh thu (đ)',     key: 'totalAmount',     width: 20 },
  { header: 'Platform (30%)',   key: 'platformFee',     width: 20 },
  { header: 'Hoa hồng GV (70%)',key: 'commissionAmount',width: 22 },
];

const USER_COLS = [
  { header: 'Họ tên',          key: 'name',            width: 24 },
  { header: 'Email',           key: 'email',           width: 28 },
  { header: 'Vai trò',         key: 'role',            width: 14 },
  { header: 'Trạng thái',      key: 'status',          width: 14 },
  { header: 'Số khoá đăng ký', key: 'enrollmentCount', width: 18 },
  { header: 'Ngày tham gia',   key: 'createdAt',       width: 16 },
];

const COURSE_COLS = [
  { header: 'Tên khoá học',    key: 'title',          width: 32 },
  { header: 'Giảng viên',      key: 'instructor',     width: 22 },
  { header: 'Danh mục',        key: 'category',       width: 18 },
  { header: 'Trạng thái',      key: 'status',         width: 16 },
  { header: 'Giá (đ)',         key: 'price',          width: 14 },
  { header: 'Học viên',        key: 'totalStudents',  width: 12 },
  { header: 'Rating',          key: 'averageRating',  width: 10 },
  { header: 'Đánh giá',        key: 'totalReviews',   width: 10 },
  { header: 'Doanh thu (đ)',   key: 'revenue',        width: 18 },
  { header: 'Ngày tạo',        key: 'createdAt',      width: 14 },
];

const INSTRUCTOR_COLS = [
  { header: 'Họ tên',          key: 'name',          width: 24 },
  { header: 'Email',           key: 'email',         width: 28 },
  { header: 'Số khoá học',     key: 'totalCourses',  width: 14 },
  { header: 'Số dư ví (đ)',    key: 'walletBalance', width: 18 },
  { header: 'Tổng thu nhập (đ)',key: 'totalEarned',  width: 20 },
  { header: 'Tổng đã rút (đ)', key: 'payoutAmount',  width: 18 },
  { header: 'Lần rút tiền',    key: 'totalPayouts',  width: 14 },
  { header: 'Ngày tham gia',   key: 'joinedAt',      width: 16 },
];

// ─── Helper chung: xuất file ──────────────────────────────────────────────────
async function exportReport(res, rows, cols, format, baseName, title) {
  if (format === 'csv') {
    const csv = generateCSV(rows, cols);
    return sendExportResponse(res, 'csv', baseName, csv);
  }
  const buffer = await generateExcel(rows, cols, title, title);
  return sendExportResponse(res, 'excel', baseName, buffer);
}

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/reports/revenue */
export const getRevenueData = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy } = validateDateRange(req, res);
  const result = await getRevenueReport({ startDate, endDate, groupBy });
  res.json({ success: true, data: result });
});

/** GET /api/reports/revenue/export?format=csv|excel */
export const exportRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy, format } = validateDateRange(req, res);
  const { rows } = await getRevenueReport({ startDate, endDate, groupBy });
  await exportReport(res, rows, REVENUE_COLS, format, 'revenue', 'Báo cáo Doanh thu');
});

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/reports/users */
export const getUserData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = validateDateRange(req, res);
  const result = await getUserReport({ startDate, endDate });
  res.json({ success: true, data: result });
});

/** GET /api/reports/users/export */
export const exportUsers = asyncHandler(async (req, res) => {
  const { startDate, endDate, format } = validateDateRange(req, res);
  const { rows } = await getUserReport({ startDate, endDate });
  await exportReport(res, rows, USER_COLS, format, 'users', 'Báo cáo Người dùng');
});

// ─────────────────────────────────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/reports/courses */
export const getCourseData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = validateDateRange(req, res);
  const result = await getCourseReport({ startDate, endDate });
  res.json({ success: true, data: result });
});

/** GET /api/reports/courses/export */
export const exportCourses = asyncHandler(async (req, res) => {
  const { startDate, endDate, format } = validateDateRange(req, res);
  const { rows } = await getCourseReport({ startDate, endDate });
  await exportReport(res, rows, COURSE_COLS, format, 'courses', 'Báo cáo Khoá học');
});

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTORS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/reports/instructors */
export const getInstructorData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = validateDateRange(req, res);
  const result = await getInstructorReport({ startDate, endDate });
  res.json({ success: true, data: result });
});

/** GET /api/reports/instructors/export */
export const exportInstructors = asyncHandler(async (req, res) => {
  const { startDate, endDate, format } = validateDateRange(req, res);
  const { rows } = await getInstructorReport({ startDate, endDate });
  await exportReport(res, rows, INSTRUCTOR_COLS, format, 'instructors', 'Báo cáo Giảng viên');
});
