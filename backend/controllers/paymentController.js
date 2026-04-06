/**
 * Payment Controller — thin layer
 */
import asyncHandler from 'express-async-handler';
import * as paymentService from '../services/paymentService.js';

/**
 * @desc    Create MoMo wallet payment
 * @route   POST /api/payments/momo
 * @access  Private (student)
 */
export const createMomoPayment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const result = await paymentService.createMomoPayment(req.user._id, courseId);
  res.json({ success: true, ...result });
});

/**
 * @desc    Create Mock MoMo payment (for testing without MoMo app)
 * @route   POST /api/payments/momo/mock
 * @access  Private (student)
 */
export const createMockPayment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const result = await paymentService.createMockPayment(req.user._id, courseId);
  res.json({
    success: true,
    message: 'Mock thanh toán thành công! Bạn đã được ghi danh vào khoá học.',
    ...result,
  });
});

/**
 * @desc    Create ATM / Bank card payment
 * @route   POST /api/payments/atm
 * @access  Private (student)
 */
export const createATMPayment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const result = await paymentService.createATMPayment(req.user._id, courseId);
  res.json({ success: true, ...result });
});

/**
 * @desc    Create Bank transfer payment
 * @route   POST /api/payments/bank
 * @access  Private (student)
 */
export const createBankPayment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const result = await paymentService.createBankPayment(req.user._id, courseId);
  res.json({ success: true, ...result });
});

/**
 * @desc    Confirm bank transfer (manual / admin)
 * @route   POST /api/payments/bank/confirm
 * @access  Private (admin)
 */
export const confirmBankPayment = asyncHandler(async (req, res) => {
  const { orderId, transId } = req.body;
  await paymentService.confirmBankPayment(orderId, transId);
  res.json({ success: true, message: 'Xác nhận thanh toán thành công', orderId });
});

/**
 * @desc    MoMo IPN callback
 * @route   POST /api/payments/momo/ipn
 * @access  Public (called by MoMo server)
 */
export const momoIPN = asyncHandler(async (req, res) => {
  console.log('\n=== MoMo IPN Callback ===', req.body);
  await paymentService.handleMomoIPN(req.body);
  res.sendStatus(204);
});

/**
 * @desc    Get payment status by orderId
 * @route   GET /api/payments/status/:orderId
 * @access  Private
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentStatus(req.params.orderId);
  res.json({ success: true, data: payment });
});

/**
 * @desc    Get my payment history
 * @route   GET /api/payments/my
 * @access  Private
 */
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getUserPayments(req.user._id);
  res.json({ success: true, data: payments });
});

/**
 * @desc    Get all payments (admin)
 * @route   GET /api/payments/list
 * @access  Private (admin)
 */
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getAllPayments();
  res.json({ success: true, data: payments });
});

/**
 * @desc    Get payment stats (admin)
 * @route   GET /api/payments/stats
 * @access  Private (admin)
 */
export const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await paymentService.getPaymentStats();
  res.json({ success: true, data: stats });
});
