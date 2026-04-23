/**
 * Unit Tests — authService.js
 * Kiểm thử service xác thực người dùng (đăng ký, đăng nhập, hồ sơ)
 */

import { jest } from '@jest/globals';

// ── mock repositories ──────────────────────────────────────────────────────
const mockUserRepo = {
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findById: jest.fn(),
  createUser: jest.fn(),
  updateUserById: jest.fn(),
};

const mockInstructorRepo = {
  findByUserId: jest.fn(),
  createProfile: jest.fn(),
};

jest.unstable_mockModule('../repositories/userRepository.js', () => mockUserRepo);
jest.unstable_mockModule('../repositories/instructorRepository.js', () => mockInstructorRepo);

// ── import SUT after mocks are registered ──────────────────────────────────
const authService = await import('../services/authService.js');

// ── helpers ────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════
// registerUser
// ══════════════════════════════════════════════════════════════════════════
describe('registerUser', () => {
  test('TC-AUTH-01: ném lỗi khi email đã tồn tại trong hệ thống', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ email: 'test@example.com' });

    await expect(
      authService.registerUser({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: '123456',
        role: 'student',
      })
    ).rejects.toThrow('Email này đã được sử dụng');
  });

  test('TC-AUTH-02: ném lỗi khi vai trò không hợp lệ (không phải student / instructor)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null); // email chưa tồn tại

    await expect(
      authService.registerUser({
        name: 'Nguyen Van B',
        email: 'new@example.com',
        password: '123456',
        role: 'admin', // vai trò không được phép đăng ký
      })
    ).rejects.toThrow('Vai trò không hợp lệ');
  });

  test('TC-AUTH-03: đăng ký thành công cho sinh viên (không tạo instructor profile)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    const fakeUser = { _id: 'u1', name: 'Sinh Vien', role: 'student' };
    mockUserRepo.createUser.mockResolvedValue(fakeUser);

    const result = await authService.registerUser({
      name: 'Sinh Vien',
      email: 'sv@example.com',
      password: 'pass',
      role: 'student',
    });

    expect(result).toEqual(fakeUser);
    expect(mockUserRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'student', instructorStatus: 'none' })
    );
    // Không gọi tạo instructor profile
    expect(mockInstructorRepo.createProfile).not.toHaveBeenCalled();
  });

  test('TC-AUTH-04: đăng ký thành công cho giảng viên và tạo instructor profile', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    const fakeUser = { _id: 'u2', name: 'Giang Vien', role: 'instructor' };
    mockUserRepo.createUser.mockResolvedValue(fakeUser);
    mockInstructorRepo.createProfile.mockResolvedValue({});

    const result = await authService.registerUser({
      name: 'Giang Vien',
      email: 'gv@example.com',
      password: 'pass',
      role: 'instructor',
      expertise: 'JavaScript',
      biography: 'Lập trình viên',
      cvUrl: 'https://cv.example.com',
    });

    expect(result).toEqual(fakeUser);
    expect(mockInstructorRepo.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({ user: 'u2', expertise: 'JavaScript' })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// loginUser
// ══════════════════════════════════════════════════════════════════════════
describe('loginUser', () => {
  test('TC-AUTH-05: ném lỗi khi email không tồn tại', async () => {
    mockUserRepo.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      authService.loginUser('khong@ton.tai', '123456')
    ).rejects.toThrow('Email không tồn tại trong hệ thống');
  });

  test('TC-AUTH-06: ném lỗi khi mật khẩu không chính xác', async () => {
    const fakeUser = {
      email: 'user@example.com',
      matchPassword: jest.fn().mockResolvedValue(false),
      isActive: true,
    };
    mockUserRepo.findByEmailWithPassword.mockResolvedValue(fakeUser);

    await expect(
      authService.loginUser('user@example.com', 'wrongpass')
    ).rejects.toThrow('Mật khẩu không chính xác');
  });

  test('TC-AUTH-07: ném lỗi khi tài khoản bị vô hiệu hoá', async () => {
    const fakeUser = {
      email: 'user@example.com',
      matchPassword: jest.fn().mockResolvedValue(true),
      isActive: false,
    };
    mockUserRepo.findByEmailWithPassword.mockResolvedValue(fakeUser);

    await expect(
      authService.loginUser('user@example.com', 'correctpass')
    ).rejects.toThrow('Tài khoản đã bị vô hiệu hoá');
  });

  test('TC-AUTH-08: đăng nhập thành công trả về user', async () => {
    const fakeUser = {
      _id: 'u3',
      email: 'user@example.com',
      matchPassword: jest.fn().mockResolvedValue(true),
      isActive: true,
    };
    mockUserRepo.findByEmailWithPassword.mockResolvedValue(fakeUser);

    const result = await authService.loginUser('user@example.com', 'correctpass');
    expect(result).toEqual(fakeUser);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// getUserProfile
// ══════════════════════════════════════════════════════════════════════════
describe('getUserProfile', () => {
  test('TC-AUTH-09: ném lỗi khi không tìm thấy user', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(authService.getUserProfile('invalid-id')).rejects.toThrow(
      'Không tìm thấy thông tin tài khoản'
    );
  });

  test('TC-AUTH-10: trả về user và instructorProfile nếu là giảng viên', async () => {
    const fakeUser = { _id: 'u4', role: 'instructor' };
    const fakeProfile = { expertise: 'React' };
    mockUserRepo.findById.mockResolvedValue(fakeUser);
    mockInstructorRepo.findByUserId.mockResolvedValue(fakeProfile);

    const result = await authService.getUserProfile('u4');
    expect(result.user).toEqual(fakeUser);
    expect(result.instructorProfile).toEqual(fakeProfile);
  });

  test('TC-AUTH-11: trả về user với instructorProfile = null nếu là sinh viên', async () => {
    const fakeUser = { _id: 'u5', role: 'student' };
    mockUserRepo.findById.mockResolvedValue(fakeUser);

    const result = await authService.getUserProfile('u5');
    expect(result.user).toEqual(fakeUser);
    expect(result.instructorProfile).toBeNull();
    expect(mockInstructorRepo.findByUserId).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// updateUserProfile
// ══════════════════════════════════════════════════════════════════════════
describe('updateUserProfile', () => {
  test('TC-AUTH-12: ném lỗi khi không tìm thấy user để cập nhật', async () => {
    mockUserRepo.updateUserById.mockResolvedValue(null);

    await expect(
      authService.updateUserProfile('invalid-id', { name: 'NewName' })
    ).rejects.toThrow('Không tìm thấy người dùng');
  });

  test('TC-AUTH-13: cập nhật thành công và trả về dữ liệu mới', async () => {
    const updatedUser = { _id: 'u6', name: 'TenMoi', phone: '0909' };
    mockUserRepo.updateUserById.mockResolvedValue(updatedUser);

    const result = await authService.updateUserProfile('u6', { name: 'TenMoi', phone: '0909' });
    expect(result).toEqual(updatedUser);
    expect(mockUserRepo.updateUserById).toHaveBeenCalledWith(
      'u6',
      expect.objectContaining({ name: 'TenMoi', phone: '0909' })
    );
  });
});
