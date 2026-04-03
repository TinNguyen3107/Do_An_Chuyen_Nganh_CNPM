/**
 * InstructorWallet Model — Ví giảng viên
 * Lưu trữ số dư, lịch sử tổng hoa hồng và thông tin ngân hàng cho mỗi instructor.
 */
import mongoose from 'mongoose';

const instructorWalletSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Mỗi instructor chỉ có 1 wallet
    },

    // ── Số dư ──────────────────────────────────────────────────────
    balance: {
      // Số tiền khả dụng, có thể rút ngay
      type: Number,
      default: 0,
      min: 0,
    },
    pendingPayout: {
      // Số tiền đang trong yêu cầu rút, chờ Admin chi trả
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Tổng luỹ kế ─────────────────────────────────────────────────
    totalEarned: {
      // Tổng tiền hoa hồng đã nhận từ trước tới nay
      type: Number,
      default: 0,
    },
    totalWithdrawn: {
      // Tổng tiền đã rút thành công
      type: Number,
      default: 0,
    },

    // ── Cấu hình hoa hồng ────────────────────────────────────────────
    commissionRate: {
      // Tỷ lệ hoa hồng (0.7 = 70%), Admin có thể thay đổi
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },

    // ── Thông tin ngân hàng (để Admin chuyển khoản) ──────────────────
    bankInfo: {
      bankName:      { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      accountName:   { type: String, default: '' },
      branch:        { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Indexes
instructorWalletSchema.index({ instructor: 1 }, { unique: true });

const InstructorWallet = mongoose.model('InstructorWallet', instructorWalletSchema);
export default InstructorWallet;
