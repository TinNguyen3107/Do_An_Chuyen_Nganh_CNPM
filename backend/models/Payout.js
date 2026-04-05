/**
 * Payout Model — Lịch sử rút tiền / chi trả giảng viên
 * Mỗi bản ghi đại diện cho 1 yêu cầu rút tiền của instructor.
 */
import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Số tiền yêu cầu rút
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },

    // Trạng thái xử lý
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
    },

    // Lý do từ chối (nếu có)
    rejectedReason: {
      type: String,
      default: null,
    },

    // Admin xử lý yêu cầu
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },

    // Mã giao dịch khi Admin đã chuyển khoản
    transactionId: {
      type: String,
      default: null,
    },

    // Snapshot thông tin bank tại thời điểm rút
    // (phòng TH instructor đổi bank info sau khi gửi yêu cầu)
    bankInfoSnapshot: {
      bankName:      { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      accountName:   { type: String, default: '' },
      branch:        { type: String, default: '' },
    },

    // Ghi chú thêm (tuỳ chọn)
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes
payoutSchema.index({ instructor: 1, status: 1 });
payoutSchema.index({ status: 1, createdAt: -1 });

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
