/**
 * Payment Model — stores payment transaction records
 */
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },
    orderInfo: {
      type: String,
      default: '',
    },
    // Payment method: momo, momo_mock, atm, bank
    method: {
      type: String,
      enum: ['momo', 'momo_mock', 'atm', 'bank'],
      required: true,
    },
    // Payment status
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },
    // Transaction ID from payment gateway
    transId: {
      type: String,
      default: null,
    },
    // MoMo pay URL (for redirect)
    payUrl: {
      type: String,
      default: null,
    },
    // Bank transfer details
    bankInfo: {
      bankName: String,
      accountNumber: String,
      accountName: String,
      transferContent: String,
      qrUrl: String,
    },
    // Gateway raw response
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },

    // ── Commission / Revenue split ──────────────────────────────────
    commissionAmount: {
      // Số tiền hoa hồng instructor nhận (70% mặc định)
      type: Number,
      default: 0,
    },
    platformFee: {
      // Số tiền platform giữ lại (30% mặc định)
      type: Number,
      default: 0,
    },
    commissionProcessed: {
      // Đã tính hoa hồng chưa — dùng để idempotent, tránh tính 2 lần
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
