/**
 * Unit Tests — enrollmentService.js
 * Kiểm thử service đăng ký khoá học
 */

import { jest } from '@jest/globals';

// ── mock repositories ──────────────────────────────────────────────────────
const mockEnrollmentRepo = {
  findByUserAndCourse: jest.fn(),
  createEnrollment: jest.fn(),
  findByUser: jest.fn(),
  findByCourse: jest.fn(),
};

const mockCourseRepo = {
  findById: jest.fn(),
  incrementStudentCount: jest.fn(),
};

jest.unstable_mockModule('../repositories/enrollmentRepository.js', () => mockEnrollmentRepo);
jest.unstable_mockModule('../repositories/courseRepository.js', () => mockCourseRepo);

const enrollmentService = await import('../services/enrollmentService.js');

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════
// enrollCourse
// ══════════════════════════════════════════════════════════════════════════
describe('enrollCourse', () => {
  test('TC-ENROLL-01: ném lỗi khi không tìm thấy khoá học', async () => {
    mockCourseRepo.findById.mockResolvedValue(null);

    await expect(enrollmentService.enrollCourse('u1', 'bad-course')).rejects.toThrow(
      'Không tìm thấy khoá học'
    );
  });

  test('TC-ENROLL-02: ném lỗi khi khoá học chưa được công khai', async () => {
    mockCourseRepo.findById.mockResolvedValue({ _id: 'c1', status: 'draft', isFree: true });

    await expect(enrollmentService.enrollCourse('u1', 'c1')).rejects.toThrow(
      'Khoá học chưa được công khai'
    );
  });

  test('TC-ENROLL-03: ném lỗi khi đã đăng ký khoá học này rồi', async () => {
    mockCourseRepo.findById.mockResolvedValue({ _id: 'c1', status: 'published', isFree: true });
    mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue({ _id: 'e1' }); // đã có enrollment

    await expect(enrollmentService.enrollCourse('u1', 'c1')).rejects.toThrow(
      'Bạn đã đăng ký khoá học này rồi'
    );
  });

  test('TC-ENROLL-04: ném lỗi khi khoá học yêu cầu thanh toán (không miễn phí)', async () => {
    mockCourseRepo.findById.mockResolvedValue({ _id: 'c2', status: 'published', isFree: false });
    mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue(null);

    await expect(enrollmentService.enrollCourse('u1', 'c2')).rejects.toThrow(
      'Khoá học này yêu cầu thanh toán'
    );
  });

  test('TC-ENROLL-05: đăng ký thành công khoá học miễn phí', async () => {
    const freeCourse = { _id: 'c3', status: 'published', isFree: true };
    const fakeEnrollment = { _id: 'e2', user: 'u1', course: 'c3' };
    mockCourseRepo.findById.mockResolvedValue(freeCourse);
    mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue(null);
    mockEnrollmentRepo.createEnrollment.mockResolvedValue(fakeEnrollment);
    mockCourseRepo.incrementStudentCount.mockResolvedValue(undefined);

    const result = await enrollmentService.enrollCourse('u1', 'c3');

    expect(result).toEqual(fakeEnrollment);
    expect(mockEnrollmentRepo.createEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({ user: 'u1', course: 'c3', enrollmentType: 'free' })
    );
    expect(mockCourseRepo.incrementStudentCount).toHaveBeenCalledWith('c3');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// checkEnrollment
// ══════════════════════════════════════════════════════════════════════════
describe('checkEnrollment', () => {
  test('TC-ENROLL-06: trả về isEnrolled = false khi chưa đăng ký', async () => {
    mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue(null);

    const result = await enrollmentService.checkEnrollment('u1', 'c1');
    expect(result.isEnrolled).toBe(false);
    expect(result.enrollment).toBeNull();
  });

  test('TC-ENROLL-07: trả về isEnrolled = true khi đã đăng ký', async () => {
    const fakeEnrollment = { _id: 'e1' };
    mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue(fakeEnrollment);

    const result = await enrollmentService.checkEnrollment('u1', 'c1');
    expect(result.isEnrolled).toBe(true);
    expect(result.enrollment).toEqual(fakeEnrollment);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// getMyEnrollments
// ══════════════════════════════════════════════════════════════════════════
describe('getMyEnrollments', () => {
  test('TC-ENROLL-08: trả về danh sách khoá học đã đăng ký của sinh viên', async () => {
    const fakeList = [{ _id: 'e1' }, { _id: 'e2' }];
    mockEnrollmentRepo.findByUser.mockResolvedValue(fakeList);

    const result = await enrollmentService.getMyEnrollments('u1');
    expect(result).toEqual(fakeList);
    expect(mockEnrollmentRepo.findByUser).toHaveBeenCalledWith('u1');
  });
});
