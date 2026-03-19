import express from 'express';
import {
  getMyApplication,
  applyAsInstructor,
  getAllApplications,
  approveInstructor,
  rejectInstructor,
} from '../controllers/instructorController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { uploadCV } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// For the logged-in user's own application
router.get('/application', protect, getMyApplication);
router.post('/apply', protect, uploadCV.single('cvFile'), applyAsInstructor);

// Admin routes — application management
router.get('/applications', protect, authorize('admin'), getAllApplications);
router.patch('/applications/:id/approve', protect, authorize('admin'), approveInstructor);
router.patch('/applications/:id/reject', protect, authorize('admin'), rejectInstructor);

export default router;

