import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
// import Course from '../models/Course.js';
// import Category from '../models/Category.js';
// import Enrollment from '../models/Enrollment.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * @desc    Get system overview stats
 * @route   GET /api/stats/overview
 * @access  Private (admin)
 */
router.get('/overview', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalStudents,
        totalInstructors,
        pendingInstructors,
        totalCourses,
        publishedCourses,
        totalCategories,
        totalEnrollments,
    ] = await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'instructor', instructorStatus: 'approved' }),
        User.countDocuments({ role: 'instructor', instructorStatus: 'pending' }),
        Course.countDocuments(),
        Course.countDocuments({ status: 'published' }),
        Category.countDocuments(),
        Enrollment.countDocuments(),
    ]);

    res.json({
        success: true,
        data: {
            totalUsers,
            totalStudents,
            totalInstructors,
            pendingInstructors,
            totalCourses,
            publishedCourses,
            totalCategories,
            totalEnrollments,
        },
    });
}));

export default router;
