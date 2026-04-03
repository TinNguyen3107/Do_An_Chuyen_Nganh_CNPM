/**
 * Unit Tests — courseService.js
 * Kiểm thử service quản lý khoá học
 */

import { jest } from '@jest/globals';

// ── mock repositories ──────────────────────────────────────────────────────
const mockCourseRepo = {
  findPublished: jest.fn(),
  countPublished: jest.fn(),
  findById: jest.fn(),
  findByInstructor: jest.fn(),
  findByIdAndInstructor: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
  findAllForAdmin: jest.fn(),
};

const mockCategoryRepo = {
  findById: jest.fn(),
};

jest.unstable_mockModule('../repositories/courseRepository.js', () => mockCourseRepo);
jest.unstable_mockModule('../repositories/categoryRepository.js', () => mockCategoryRepo);

const courseService = await import('../services/courseService.js');

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════
// getCourseDetail
// ══════════════════════════════════════════════════════════════════════════
describe('getCourseDetail', () => {
  test('TC-COURSE-01: ném lỗi khi không tìm thấy khoá học', async () => {
    mockCourseRepo.findById.mockResolvedValue(null);

    await expect(courseService.getCourseDetail('bad-id')).rejects.toThrow(
      'Không tìm thấy khoá học'
    );
  });

  test('TC-COURSE-02: ném lỗi khi khoá học chưa được công khai (draft)', async () => {
    mockCourseRepo.findById.mockResolvedValue({ _id: 'c1', status: 'draft' });

    await expect(courseService.getCourseDetail('c1')).rejects.toThrow(
      'Khoá học chưa được công khai'
    );
  });

  test('TC-COURSE-03: trả về khoá học khi trạng thái là published', async () => {
    const fakeCourse = { _id: 'c1', status: 'published', title: 'ReactJS' };
    mockCourseRepo.findById.mockResolvedValue(fakeCourse);

    const result = await courseService.getCourseDetail('c1');
    expect(result).toEqual(fakeCourse);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// createCourse
// ══════════════════════════════════════════════════════════════════════════
describe('createCourse', () => {
  test('TC-COURSE-04: ném lỗi khi giảng viên chưa được phê duyệt', async () => {
    await expect(
      courseService.createCourse('instructor1', 'pending', { category: 'cat1' })
    ).rejects.toThrow('Chỉ giảng viên đã được phê duyệt');

    expect(mockCategoryRepo.findById).not.toHaveBeenCalled();
  });

  test('TC-COURSE-05: ném lỗi khi danh mục không tồn tại', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(
      courseService.createCourse('instructor1', 'approved', { category: 'invalid-cat' })
    ).rejects.toThrow('Danh mục không tồn tại');
  });

  test('TC-COURSE-06: tạo khoá học với trạng thái draft theo mặc định', async () => {
    const fakeCategory = { _id: 'cat1', name: 'Programming' };
    const fakeCourse = { _id: 'c2', status: 'draft' };
    mockCategoryRepo.findById.mockResolvedValue(fakeCategory);
    mockCourseRepo.createCourse.mockResolvedValue(fakeCourse);

    const result = await courseService.createCourse('instructor1', 'approved', {
      category: 'cat1',
      title: 'NodeJS Basics',
    });

    expect(result).toEqual(fakeCourse);
    expect(mockCourseRepo.createCourse).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft', instructor: 'instructor1' })
    );
  });

  test('TC-COURSE-07: tạo khoá học với trạng thái published khi được chỉ định', async () => {
    mockCategoryRepo.findById.mockResolvedValue({ _id: 'cat1' });
    mockCourseRepo.createCourse.mockResolvedValue({ _id: 'c3', status: 'published' });

    await courseService.createCourse('instructor1', 'approved', {
      category: 'cat1',
      status: 'published',
    });

    expect(mockCourseRepo.createCourse).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'published' })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// deleteCourse
// ══════════════════════════════════════════════════════════════════════════
describe('deleteCourse', () => {
  test('TC-COURSE-08: ném lỗi khi không tìm thấy khoá học hoặc không có quyền', async () => {
    mockCourseRepo.findByIdAndInstructor.mockResolvedValue(null);

    await expect(courseService.deleteCourse('c1', 'instructor1')).rejects.toThrow(
      'Không tìm thấy khoá học hoặc bạn không có quyền'
    );
  });

  test('TC-COURSE-09: ném lỗi khi cố xóa khoá học đã xuất bản', async () => {
    mockCourseRepo.findByIdAndInstructor.mockResolvedValue({ _id: 'c1', status: 'published' });

    await expect(courseService.deleteCourse('c1', 'instructor1')).rejects.toThrow(
      'Không thể xóa khoá học đã xuất bản'
    );
  });

  test('TC-COURSE-10: xóa thành công khoá học ở trạng thái draft', async () => {
    mockCourseRepo.findByIdAndInstructor.mockResolvedValue({ _id: 'c2', status: 'draft' });
    mockCourseRepo.deleteCourse.mockResolvedValue(undefined);

    const result = await courseService.deleteCourse('c2', 'instructor1');
    expect(result).toEqual({ message: 'Xóa khoá học thành công' });
    expect(mockCourseRepo.deleteCourse).toHaveBeenCalledWith('c2');
  });
});
