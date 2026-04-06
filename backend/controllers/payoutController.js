/**
 * Payout Controller — thin layer for Payout management
 */
import asyncHandler from 'express-async-handler';
import * as payoutService from '../services/payoutService.js';

/**
 * @desc    Instructor: yêu cầu rút tiền
 * @route   POST /api/payouts/request
 * @access  Private (instructor)
 */
export const requestPayout = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const payout = await payoutService.requestPayout(req.user._id, amount);
  res.status(201).json({
    success: true,
    data: payout,
    message: 'Yêu cầu rút tiền đã được gửi. Vui lòng chờ Admin xét duyệt.',
  });
});

/**
 * @desc    Instructor: lịch sử rút tiền của mình
 * @route   GET /api/payouts/my
 * @access  Private (instructor)
 */
export const getMyPayouts = asyncHandler(async (req, res) => {
  const payouts = await payoutService.getMyPayouts(req.user._id);
  res.json({ success: true, data: payouts });
});

/**
 * @desc    Admin: danh sách payout đang pending
 * @route   GET /api/payouts/pending
 * @access  Private (admin)
 */
export const getPendingPayouts = asyncHandler(async (req, res) => {
  const payouts = await payoutService.getPendingPayouts();
  res.json({ success: true, data: payouts });
});

/**
 * @desc    Admin: tất cả lịch sử chi trả (có filter theo status)
 * @route   GET /api/payouts/all
 * @access  Private (admin)
 */
export const getAllPayouts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const [payouts, stats] = await Promise.all([
    payoutService.getAllPayouts(filter),
    payoutService.getPayoutStats(),
  ]);
  res.json({ success: true, data: payouts, stats });
});

/**
 * @desc    Admin: đánh dấu đang xử lý
 * @route   PATCH /api/payouts/:id/process
 * @access  Private (admin)
 */
export const processPayout = asyncHandler(async (req, res) => {
  const payout = await payoutService.processPayout(req.params.id, req.user._id);
  res.json({ success: true, data: payout, message: 'Đã chuyển sang trạng thái đang xử lý' });
});

/**
 * @desc    Admin: duyệt payout + nhập mã giao dịch
 * @route   PATCH /api/payouts/:id/approve
 * @access  Private (admin)
 */
export const approvePayout = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const payout = await payoutService.approvePayout(req.params.id, req.user._id, transactionId);
  res.json({ success: true, data: payout, message: 'Đã xác nhận chi trả thành công' });
});

/**
 * @desc    Admin: từ chối payout + lý do
 * @route   PATCH /api/payouts/:id/reject
 * @access  Private (admin)
 */
export const rejectPayout = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const payout = await payoutService.rejectPayout(req.params.id, req.user._id, reason);
  res.json({ success: true, data: payout, message: 'Đã từ chối yêu cầu rút tiền' });
});
