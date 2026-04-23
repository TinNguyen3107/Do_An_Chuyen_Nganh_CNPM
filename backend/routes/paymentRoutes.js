import express from 'express';
import {
  createMomoPayment,
  createATMPayment,
  createBankPayment,
  confirmBankPayment,
  momoIPN,
  getPaymentStatus,
  getMyPayments,
  getAllPayments,
  getPaymentStats,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPaymentSchema, confirmBankSchema } from '../validators/payment.validator.js';

const router = express.Router();

// ── Student payment routes ──────────────────────────────────────
router.post('/momo', protect, validate(createPaymentSchema), createMomoPayment);
router.post('/atm', protect, validate(createPaymentSchema), createATMPayment);
router.post('/bank', protect, validate(createPaymentSchema), createBankPayment);

// ── MoMo IPN (public — called by MoMo server) ──────────────────
router.post('/momo/ipn', momoIPN);

// ── Bank confirm (demo: any logged-in user; production: admin only) ──
router.post('/bank/confirm', protect, validate(confirmBankSchema), confirmBankPayment);

// ── Query routes ────────────────────────────────────────────────
router.get('/my', protect, getMyPayments);
router.get('/status/:orderId', protect, getPaymentStatus);
router.get('/list', protect, authorize('admin'), getAllPayments);
router.get('/stats', protect, authorize('admin'), getPaymentStats);

export default router;
