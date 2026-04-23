import express from 'express';
import {
  getMyWallet,
  updateBankInfo,
  getAllWallets,
  updateCommissionRate,
} from '../controllers/walletController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ── Instructor ────────────────────────────────────────────────────────────
router.get('/me', protect, authorize('instructor', 'admin'), getMyWallet);
router.put('/bank-info', protect, authorize('instructor'), updateBankInfo);

// ── Admin ─────────────────────────────────────────────────────────────────
router.get('/all', protect, authorize('admin'), getAllWallets);
router.patch('/:id/rate', protect, authorize('admin'), updateCommissionRate);

export default router;
