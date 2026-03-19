/**
 * Unit Tests — userService.js
 * Kiểm thử service quản lý người dùng (dành cho Admin)
 */

import { jest } from '@jest/globals';

// ── mock repository ────────────────────────────────────────────────────────
const mockUserRepo = {
  findAllUsers: jest.fn(),
  countUsers: jest.fn(),
  findById: jest.fn(),
  updateUserById: jest.fn(),
};

jest.unstable_mockModule('../repositories/userRepository.js', () => mockUserRepo);

const userService = await import('../services/userService.js');

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════
// getAllUsers
// ══════════════════════════════════════════════════════════════════════════
describe('getAllUsers', () => {
  test('TC-USER-01: trả về danh sách người dùng kèm thông tin phân trang', async () => {
    const fakeUsers = [{ _id: 'u1' }, { _id: 'u2' }];
    mockUserRepo.findAllUsers.mockResolvedValue(fakeUsers);
    mockUserRepo.countUsers.mockResolvedValue(12);

    const result = await userService.getAllUsers({ page: 1, limit: 5 });

    expect(result.users).toEqual(fakeUsers);
    expect(result.total).toBe(12);
    expect(result.totalPages).toBe(Math.ceil(12 / 5));
    expect(result.page).toBe(1);
  });

  test('TC-USER-02: sử dụng giá trị mặc định khi không truyền tham số', async () => {
    mockUserRepo.findAllUsers.mockResolvedValue([]);
    mockUserRepo.countUsers.mockResolvedValue(0);

    const result = await userService.getAllUsers();
    expect(result.limit).toBe(20);
    expect(result.page).toBe(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// getUserById
// ══════════════════════════════════════════════════════════════════════════
describe('getUserById', () => {
  test('TC-USER-03: ném lỗi khi không tìm thấy người dùng theo ID', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(userService.getUserById('bad-id')).rejects.toThrow('Không tìm thấy người dùng');
  });

  test('TC-USER-04: trả về người dùng khi tìm thấy', async () => {
    const fakeUser = { _id: 'u1', name: 'Test User' };
    mockUserRepo.findById.mockResolvedValue(fakeUser);

    const result = await userService.getUserById('u1');
    expect(result).toEqual(fakeUser);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// changeUserRole
// ══════════════════════════════════════════════════════════════════════════
describe('changeUserRole', () => {
  test('TC-USER-05: ném lỗi khi vai trò không hợp lệ', async () => {
    await expect(userService.changeUserRole('u1', 'superadmin')).rejects.toThrow(
      'Vai trò không hợp lệ'
    );
    expect(mockUserRepo.updateUserById).not.toHaveBeenCalled();
  });

  test('TC-USER-06: ném lỗi khi không tìm thấy người dùng cần đổi vai trò', async () => {
    mockUserRepo.updateUserById.mockResolvedValue(null);

    await expect(userService.changeUserRole('bad-id', 'admin')).rejects.toThrow(
      'Không tìm thấy người dùng'
    );
  });

  test('TC-USER-07: đổi vai trò thành công', async () => {
    const updated = { _id: 'u1', role: 'admin' };
    mockUserRepo.updateUserById.mockResolvedValue(updated);

    const result = await userService.changeUserRole('u1', 'admin');
    expect(result).toEqual(updated);
    expect(mockUserRepo.updateUserById).toHaveBeenCalledWith('u1', { role: 'admin' });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// toggleUserStatus
// ══════════════════════════════════════════════════════════════════════════
describe('toggleUserStatus', () => {
  test('TC-USER-08: ném lỗi khi không tìm thấy người dùng', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(userService.toggleUserStatus('bad-id')).rejects.toThrow(
      'Không tìm thấy người dùng'
    );
  });

  test('TC-USER-09: đảo trạng thái isActive từ true → false', async () => {
    const fakeUser = { _id: 'u1', isActive: true };
    const updated = { _id: 'u1', isActive: false };
    mockUserRepo.findById.mockResolvedValue(fakeUser);
    mockUserRepo.updateUserById.mockResolvedValue(updated);

    const result = await userService.toggleUserStatus('u1');
    expect(mockUserRepo.updateUserById).toHaveBeenCalledWith('u1', { isActive: false });
    expect(result).toEqual(updated);
  });

  test('TC-USER-10: đảo trạng thái isActive từ false → true', async () => {
    const fakeUser = { _id: 'u2', isActive: false };
    const updated = { _id: 'u2', isActive: true };
    mockUserRepo.findById.mockResolvedValue(fakeUser);
    mockUserRepo.updateUserById.mockResolvedValue(updated);

    const result = await userService.toggleUserStatus('u2');
    expect(mockUserRepo.updateUserById).toHaveBeenCalledWith('u2', { isActive: true });
    expect(result).toEqual(updated);
  });
});
