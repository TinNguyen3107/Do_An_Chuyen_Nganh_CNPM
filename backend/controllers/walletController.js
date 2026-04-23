/**
 * Wallet Controller — thin layer for InstructorWallet
 */
import asyncHandler from 'express-async-handler';
import * as walletService from '../services/walletService.js';

/**
 * @desc    Instructor: xem ví của mình
 * @route   GET /api/wallet/me
 * @access  Private (instructor)
 */
export const getMyWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getMyWallet(req.user._id);
  res.json({ success: true, data: wallet });
});

/**
 * @desc    Instructor: cập nhật thông tin ngân hàng
 * @route   PUT /api/wallet/bank-info
 * @access  Private (instructor)
 */
export const updateBankInfo = asyncHandler(async (req, res) => {
  const { bankName, accountNumber, accountName, branch } = req.body;
  const wallet = await walletService.updateBankInfo(req.user._id, {
    bankName, accountNumber, accountName, branch,
  });
  res.json({ success: true, data: wallet, message: 'Cập nhật thông tin ngân hàng thành công' });
});

/**
 * @desc    Admin: xem tất cả ví instructor
 * @route   GET /api/wallet/all
 * @access  Private (admin)
 */
export const getAllWallets = asyncHandler(async (req, res) => {
  const wallets = await walletService.getAllWallets();
  res.json({ success: true, data: wallets });
});

/**
 * @desc    Admin: thay đổi tỷ lệ hoa hồng cho instructor
 * @route   PATCH /api/wallet/:id/rate
 * @access  Private (admin)
 */
export const updateCommissionRate = asyncHandler(async (req, res) => {
  const { commissionRate } = req.body;
  const wallet = await walletService.updateCommissionRate(req.params.id, commissionRate);
  res.json({ success: true, data: wallet, message: `Đã cập nhật tỷ lệ hoa hồng: ${Math.round(commissionRate * 100)}%` });
});
