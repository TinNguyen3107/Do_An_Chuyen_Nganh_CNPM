import * as payoutRepo from '../repositories/payoutRepository.js';
import * as walletRepo from '../repositories/walletRepository.js';
import InstructorWallet from '../models/InstructorWallet.js';

const MIN_PAYOUT = 100_000; // 100,000đ tối thiểu

// ── Instructor: yêu cầu rút tiền ───────────────────────────────────────────
export const requestPayout = async (instructorId, amount) => {
  const amt = Number(amount);
  if (isNaN(amt) || amt < MIN_PAYOUT) {
    throw new Error(`Số tiền tối thiểu để rút là ${MIN_PAYOUT.toLocaleString('vi-VN')}đ`);
  }

  // Lấy wallet
  const wallet = await walletRepo.findOrCreate(instructorId);

  // Kiểm tra thông tin ngân hàng
  if (!wallet.bankInfo?.bankName || !wallet.bankInfo?.accountNumber || !wallet.bankInfo?.accountName) {
    throw new Error('Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền');
  }

  // Kiểm tra số dư
  if (amt > wallet.balance) {
    throw new Error(
      `Số dư khả dụng không đủ. Hiện tại: ${wallet.balance.toLocaleString('vi-VN')}đ`
    );
  }

  // Kiểm tra: không được có 2 payout pending cùng lúc
  const existingPending = await payoutRepo.findPendingByInstructor(instructorId);
  if (existingPending) {
    throw new Error('Bạn đang có một yêu cầu rút tiền chờ duyệt. Vui lòng chờ Admin xử lý trước.');
  }

  // Trừ balance ngay, cộng vào pendingPayout
  await InstructorWallet.findOneAndUpdate(
    { instructor: instructorId },
    { $inc: { balance: -amt, pendingPayout: amt } }
  );

  // Tạo payout record với snapshot bank info
  const payout = await payoutRepo.create({
    instructor: instructorId,
    amount: amt,
    status: 'pending',
    bankInfoSnapshot: { ...wallet.bankInfo.toObject ? wallet.bankInfo.toObject() : wallet.bankInfo },
  });

  console.log(`[Payout] Instructor ${instructorId} yêu cầu rút ${amt}đ — Payout ID: ${payout._id}`);
  return payout;
};

// ── Instructor: lịch sử rút tiền của mình ────────────────────────────────
export const getMyPayouts = async (instructorId) => {
  return payoutRepo.findByInstructor(instructorId);
};

// ── Admin: lấy danh sách payout đang pending ───────────────────────────────
export const getPendingPayouts = async () => {
  return payoutRepo.findByStatus('pending');
};

// ── Admin: lấy tất cả payouts (có filter) ────────────────────────────────
export const getAllPayouts = async (filter = {}) => {
  return payoutRepo.findAll(filter);
};

// ── Admin: thống kê tổng hợp ───────────────────────────────────────────────
export const getPayoutStats = async () => {
  return payoutRepo.getStats();
};

// ── Admin: đánh dấu đang xử lý (processing) ──────────────────────────────
export const processPayout = async (payoutId, adminId) => {
  const payout = await payoutRepo.findById(payoutId);
  if (!payout) throw new Error('Không tìm thấy yêu cầu rút tiền');
  if (payout.status !== 'pending') {
    throw new Error(`Không thể xử lý — trạng thái hiện tại: ${payout.status}`);
  }

  return payoutRepo.updateStatus(payoutId, {
    status: 'processing',
    processedBy: adminId,
    processedAt: new Date(),
  });
};

// ── Admin: duyệt payout (hoàn tất) ────────────────────────────────────────
export const approvePayout = async (payoutId, adminId, transactionId) => {
  if (!transactionId?.trim()) throw new Error('Vui lòng nhập mã giao dịch ngân hàng');

  const payout = await payoutRepo.findById(payoutId);
  if (!payout) throw new Error('Không tìm thấy yêu cầu rút tiền');
  if (!['pending', 'processing'].includes(payout.status)) {
    throw new Error(`Không thể duyệt — trạng thái hiện tại: ${payout.status}`);
  }

  // Cập nhật payout → completed
  const updated = await payoutRepo.updateStatus(payoutId, {
    status: 'completed',
    processedBy: adminId,
    processedAt: new Date(),
    transactionId: transactionId.trim(),
  });

  // Trừ pendingPayout, cộng totalWithdrawn vào wallet
  await InstructorWallet.findOneAndUpdate(
    { instructor: payout.instructor._id ?? payout.instructor },
    { $inc: { pendingPayout: -payout.amount, totalWithdrawn: payout.amount } }
  );

  console.log(`[Payout] Approved: ${payoutId} | ${payout.amount}đ | TxID: ${transactionId}`);
  return updated;
};

// ── Admin: từ chối payout ────────────────────────────────────────────────
export const rejectPayout = async (payoutId, adminId, reason) => {
  if (!reason?.trim()) throw new Error('Vui lòng nhập lý do từ chối');

  const payout = await payoutRepo.findById(payoutId);
  if (!payout) throw new Error('Không tìm thấy yêu cầu rút tiền');
  if (!['pending', 'processing'].includes(payout.status)) {
    throw new Error(`Không thể từ chối — trạng thái hiện tại: ${payout.status}`);
  }

  // Cập nhật payout → rejected
  const updated = await payoutRepo.updateStatus(payoutId, {
    status: 'rejected',
    processedBy: adminId,
    processedAt: new Date(),
    rejectedReason: reason.trim(),
  });

  // Hoàn tiền về balance, trừ pendingPayout
  await InstructorWallet.findOneAndUpdate(
    { instructor: payout.instructor._id ?? payout.instructor },
    { $inc: { balance: payout.amount, pendingPayout: -payout.amount } }
  );

  console.log(`[Payout] Rejected: ${payoutId} | ${payout.amount}đ | Reason: ${reason}`);
  return updated;
};
