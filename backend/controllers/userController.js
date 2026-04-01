import asyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (admin)
 */
export const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const result = await userService.getAllUsers({ page: +page, limit: +limit, role, search });
    res.json({ success: true, ...result });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (admin)
 */
export const getUser = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
});

/**
 * @desc    Change user role
 * @route   PATCH /api/users/:id/role
 * @access  Private (admin)
 */
export const changeRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!role) {
        res.status(400);
        throw new Error('Vai trò mới là bắt buộc');
    }
    const user = await userService.changeUserRole(req.params.id, role);
    res.json({ success: true, data: user, message: `Đã đổi vai trò thành ${role}` });
});

/**
 * @desc    Toggle user active/banned status
 * @route   PATCH /api/users/:id/toggle-status
 * @access  Private (admin)
 */
export const toggleStatus = asyncHandler(async (req, res) => {
    const user = await userService.toggleUserStatus(req.params.id);
    res.json({
        success: true,
        data: user,
        message: user.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hoá tài khoản',
    });
});
