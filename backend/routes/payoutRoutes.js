import express from 'express';
import {
  requestPayout,
  getMyPayouts,
  getPendingPayouts,
  getAllPayouts,
  processPayout,
  approvePayout,
  rejectPayout,
} from '../controllers/payoutController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ── Instructor ────────────────────────────────────────────────────────────
router.post('/request', protect, authorize('instructor'), requestPayout);
router.get('/my', protect, authorize('instructor', 'admin'), getMyPayouts);

// ── Admin ─────────────────────────────────────────────────────────────────
router.get('/pending', protect, authorize('admin'), getPendingPayouts);
router.get('/all', protect, authorize('admin'), getAllPayouts);
router.patch('/:id/process', protect, authorize('admin'), processPayout);
router.patch('/:id/approve', protect, authorize('admin'), approvePayout);
router.patch('/:id/reject', protect, authorize('admin'), rejectPayout);

export default router;
