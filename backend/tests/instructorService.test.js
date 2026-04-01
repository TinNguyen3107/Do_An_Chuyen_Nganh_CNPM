/**
 * Unit Tests — instructorService.js
 * Kiểm thử service quản lý hồ sơ giảng viên
 */

import { jest } from '@jest/globals';

// ── mock repositories ──────────────────────────────────────────────────────
const mockInstructorRepo = {
  findByUserId: jest.fn(),
  findById: jest.fn(),
  createProfile: jest.fn(),
  updateByUserId: jest.fn(),
  updateProfile: jest.fn(),
  findAllApplications: jest.fn(),
  countApplications: jest.fn(),
};

const mockUserRepo = {
  updateUserById: jest.fn(),
};

jest.unstable_mockModule('../repositories/instructorRepository.js', () => mockInstructorRepo);
jest.unstable_mockModule('../repositories/userRepository.js', () => mockUserRepo);

const instructorService = await import('../services/instructorService.js');

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════
// getMyApplication
// ══════════════════════════════════════════════════════════════════════════
describe('getMyApplication', () => {
  test('TC-INST-01: ném lỗi khi người dùng chưa có hồ sơ giảng viên', async () => {
    mockInstructorRepo.findByUserId.mockResolvedValue(null);

    await expect(instructorService.getMyApplication('u1')).rejects.toThrow(
      'Bạn chưa có hồ sơ giảng viên'
    );
  });

  test('TC-INST-02: trả về hồ sơ giảng viên khi tìm thấy', async () => {
    const fakeProfile = { _id: 'p1', status: 'pending' };
    mockInstructorRepo.findByUserId.mockResolvedValue(fakeProfile);

    const result = await instructorService.getMyApplication('u1');
    expect(result).toEqual(fakeProfile);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// submitApplication
// ══════════════════════════════════════════════════════════════════════════
describe('submitApplication', () => {
  const appData = {
    expertise: 'NodeJS',
    yearsOfExperience: 3,
    education: 'Đại học',
    biography: 'Lập trình viên',
    portfolio: 'https://portfolio.example.com',
    cvUrl: 'https://cv.example.com',
  };

  test('TC-INST-03: ném lỗi khi hồ sơ đang chờ xét duyệt (pending)', async () => {
    mockInstructorRepo.findByUserId.mockResolvedValue({ status: 'pending' });

    await expect(instructorService.submitApplication('u1', appData)).rejects.toThrow(
      'Hồ sơ của bạn đang chờ xét duyệt'
    );
  });

  test('TC-INST-04: ném lỗi khi tài khoản đã được phê duyệt (approved)', async () => {
    mockInstructorRepo.findByUserId.mockResolvedValue({ status: 'approved' });

    await expect(instructorService.submitApplication('u1', appData)).rejects.toThrow(
      'Tài khoản của bạn đã được phê duyệt'
    );
  });

  test('TC-INST-05: cập nhật hồ sơ khi đã bị từ chối (rejected)', async () => {
    const rejectedProfile = { status: 'rejected' };
    const updatedProfile = { status: 'pending', expertise: 'NodeJS' };
    mockInstructorRepo.findByUserId.mockResolvedValue(rejectedProfile);
    mockInstructorRepo.updateByUserId.mockResolvedValue(updatedProfile);

    const result = await instructorService.submitApplication('u1', appData);
    expect(result).toEqual(updatedProfile);
    expect(mockInstructorRepo.updateByUserId).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ status: 'pending' })
    );
  });

  test('TC-INST-06: tạo mới hồ sơ khi chưa có hồ sơ nào', async () => {
    const newProfile = { _id: 'p2', status: 'pending', expertise: 'NodeJS' };
    mockInstructorRepo.findByUserId.mockResolvedValue(null);
    mockInstructorRepo.createProfile.mockResolvedValue(newProfile);

    const result = await instructorService.submitApplication('u1', appData);
    expect(result).toEqual(newProfile);
    expect(mockInstructorRepo.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({ user: 'u1' })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// approveInstructor
// ══════════════════════════════════════════════════════════════════════════
describe('approveInstructor', () => {
  test('TC-INST-07: ném lỗi khi không tìm thấy hồ sơ giảng viên', async () => {
    mockInstructorRepo.findById.mockResolvedValue(null);

    await expect(instructorService.approveInstructor('p1', 'admin1')).rejects.toThrow(
      'Không tìm thấy hồ sơ giảng viên'
    );
  });

  test('TC-INST-08: ném lỗi khi hồ sơ đã được duyệt trước đó', async () => {
    mockInstructorRepo.findById.mockResolvedValue({ _id: 'p1', status: 'approved' });

    await expect(instructorService.approveInstructor('p1', 'admin1')).rejects.toThrow(
      'Hồ sơ này đã được duyệt'
    );
  });

  test('TC-INST-09: phê duyệt thành công và cập nhật instructorStatus của user', async () => {
    const profile = { _id: 'p1', status: 'pending', user: { _id: 'u1' } };
    const updatedProfile = { _id: 'p1', status: 'approved' };
    mockInstructorRepo.findById.mockResolvedValue(profile);
    mockInstructorRepo.updateProfile.mockResolvedValue(updatedProfile);
    mockUserRepo.updateUserById.mockResolvedValue({});

    const result = await instructorService.approveInstructor('p1', 'admin1');

    expect(result).toEqual(updatedProfile);
    expect(mockInstructorRepo.updateProfile).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ status: 'approved', reviewedBy: 'admin1' })
    );
    expect(mockUserRepo.updateUserById).toHaveBeenCalledWith('u1', {
      instructorStatus: 'approved',
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// rejectInstructor
// ══════════════════════════════════════════════════════════════════════════
describe('rejectInstructor', () => {
  test('TC-INST-10: ném lỗi khi không tìm thấy hồ sơ cần từ chối', async () => {
    mockInstructorRepo.findById.mockResolvedValue(null);

    await expect(instructorService.rejectInstructor('bad-id', 'admin1', 'ghi chú')).rejects.toThrow(
      'Không tìm thấy hồ sơ giảng viên'
    );
  });

  test('TC-INST-11: từ chối thành công kèm admin note và cập nhật user', async () => {
    const profile = { _id: 'p2', user: { _id: 'u2' } };
    const updatedProfile = { _id: 'p2', status: 'rejected', adminNote: 'Hồ sơ thiếu thông tin' };
    mockInstructorRepo.findById.mockResolvedValue(profile);
    mockInstructorRepo.updateProfile.mockResolvedValue(updatedProfile);
    mockUserRepo.updateUserById.mockResolvedValue({});

    const result = await instructorService.rejectInstructor('p2', 'admin1', 'Hồ sơ thiếu thông tin');

    expect(result).toEqual(updatedProfile);
    expect(mockInstructorRepo.updateProfile).toHaveBeenCalledWith(
      'p2',
      expect.objectContaining({ status: 'rejected', adminNote: 'Hồ sơ thiếu thông tin' })
    );
    expect(mockUserRepo.updateUserById).toHaveBeenCalledWith('u2', {
      instructorStatus: 'rejected',
    });
  });
});
