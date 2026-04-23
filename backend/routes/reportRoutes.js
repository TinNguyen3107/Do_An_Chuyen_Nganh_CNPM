/**
 * reportRoutes.js — Admin Report API routes
 * Base: /api/reports
 * Access: Private (admin only)
 */

import express from 'express';
import { protect }   from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import {
  getRevenueData,   exportRevenue,
  getUserData,       exportUsers,
  getCourseData,     exportCourses,
  getInstructorData, exportInstructors,
} from '../controllers/reportController.js';

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập + role admin
router.use(protect, authorize('admin'));

// ── Revenue ──────────────────────────────────────────────────────────────────
router.get('/revenue',        getRevenueData);
router.get('/revenue/export', exportRevenue);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',        getUserData);
router.get('/users/export', exportUsers);

// ── Courses ───────────────────────────────────────────────────────────────────
router.get('/courses',        getCourseData);
router.get('/courses/export', exportCourses);

// ── Instructors ───────────────────────────────────────────────────────────────
router.get('/instructors',        getInstructorData);
router.get('/instructors/export', exportInstructors);

export default router;
