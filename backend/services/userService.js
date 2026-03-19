import * as userRepo from '../repositories/userRepository.js';

/**
 * User Service — admin user management
 */

export const getAllUsers = async ({ page = 1, limit = 20, role, search } = {}) => {
    const [users, total] = await Promise.all([
        userRepo.findAllUsers({ page, limit, role, search }),
        userRepo.countUsers(role ? { role } : {}),
    ]);
    return { users, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) };
};

export const getUserById = async (id) => {
    const user = await userRepo.findById(id);
    if (!user) throw new Error('Không tìm thấy người dùng');
    return user;
};

export const changeUserRole = async (userId, newRole) => {
    if (!['student', 'instructor', 'admin'].includes(newRole)) {
        throw new Error('Vai trò không hợp lệ');
    }
    const updated = await userRepo.updateUserById(userId, { role: newRole });
    if (!updated) throw new Error('Không tìm thấy người dùng');
    return updated;
};

export const toggleUserStatus = async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');
    const updated = await userRepo.updateUserById(userId, { isActive: !user.isActive });
    return updated;
};
