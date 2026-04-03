import * as walletRepo from '../repositories/walletRepository.js';

// ── Instructor: xem ví của mình ──────────────────────────────────────────
export const getMyWallet = async (instructorId) => {
  let wallet = await walletRepo.findByInstructor(instructorId);
  if (!wallet) {
    // Tự động tạo wallet rỗng nếu chưa có
    wallet = await walletRepo.findOrCreate(instructorId);
  }
  return wallet;
};

// ── Instructor: cập nhật thông tin ngân hàng ──────────────────────────────
export const updateBankInfo = async (instructorId, bankInfo) => {
  const { bankName, accountNumber, accountName, branch } = bankInfo;

  if (!bankName?.trim()) throw new Error('Vui lòng nhập tên ngân hàng');
  if (!accountNumber?.trim()) throw new Error('Vui lòng nhập số tài khoản');
  if (!accountName?.trim()) throw new Error('Vui lòng nhập tên chủ tài khoản');

  const wallet = await walletRepo.updateBankInfo(instructorId, {
    bankName: bankName.trim(),
    accountNumber: accountNumber.trim(),
    accountName: accountName.trim().toUpperCase(),
    branch: branch?.trim() || '',
  });

  return wallet;
};

// ── Admin: xem tất cả ví instructor ────────────────────────────────────────
export const getAllWallets = async () => {
  return walletRepo.findAll();
};

// ── Admin: thay đổi tỷ lệ hoa hồng cho instructor ───────────────────────────
export const updateCommissionRate = async (walletId, rate) => {
  const rateNum = Number(rate);
  if (isNaN(rateNum) || rateNum <= 0 || rateNum > 1) {
    throw new Error('Tỷ lệ hoa hồng phải là số từ 0.01 đến 1.00');
  }

  const wallet = await walletRepo.updateCommissionRate(walletId, rateNum);
  if (!wallet) throw new Error('Không tìm thấy ví');
  return wallet;
};
