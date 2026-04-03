/**
 * Unit Tests — categoryService.js
 * Kiểm thử service quản lý danh mục khoá học
 */

import { jest } from '@jest/globals';

// ── mock repository ────────────────────────────────────────────────────────
const mockCategoryRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
};

jest.unstable_mockModule('../repositories/categoryRepository.js', () => mockCategoryRepo);

const categoryService = await import('../services/categoryService.js');

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════
// getCategoryById
// ══════════════════════════════════════════════════════════════════════════
describe('getCategoryById', () => {
  test('TC-CAT-01: ném lỗi khi không tìm thấy danh mục', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(categoryService.getCategoryById('bad-id')).rejects.toThrow(
      'Không tìm thấy danh mục'
    );
  });

  test('TC-CAT-02: trả về danh mục khi tìm thấy', async () => {
    const fakeCat = { _id: 'cat1', name: 'Programming' };
    mockCategoryRepo.findById.mockResolvedValue(fakeCat);

    const result = await categoryService.getCategoryById('cat1');
    expect(result).toEqual(fakeCat);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// createCategory
// ══════════════════════════════════════════════════════════════════════════
describe('createCategory', () => {
  test('TC-CAT-03: ném lỗi khi tên danh mục đã tồn tại', async () => {
    mockCategoryRepo.findByName.mockResolvedValue({ name: 'Programming' });

    await expect(
      categoryService.createCategory({ name: 'Programming', description: '' }, 'admin1')
    ).rejects.toThrow('Danh mục này đã tồn tại');

    expect(mockCategoryRepo.createCategory).not.toHaveBeenCalled();
  });

  test('TC-CAT-04: tạo danh mục thành công khi tên chưa tồn tại', async () => {
    const newCat = { _id: 'cat2', name: 'Design' };
    mockCategoryRepo.findByName.mockResolvedValue(null);
    mockCategoryRepo.createCategory.mockResolvedValue(newCat);

    const result = await categoryService.createCategory(
      { name: 'Design', description: 'UI/UX', icon: '🎨' },
      'admin1'
    );

    expect(result).toEqual(newCat);
    expect(mockCategoryRepo.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Design', createdBy: 'admin1' })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// updateCategory
// ══════════════════════════════════════════════════════════════════════════
describe('updateCategory', () => {
  test('TC-CAT-05: ném lỗi khi không tìm thấy danh mục cần cập nhật', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(
      categoryService.updateCategory('bad-id', { name: 'New Name' })
    ).rejects.toThrow('Không tìm thấy danh mục');
  });

  test('TC-CAT-06: ném lỗi khi tên mới đã được dùng bởi danh mục khác', async () => {
    mockCategoryRepo.findById.mockResolvedValue({ _id: 'cat1', name: 'OldName' });
    mockCategoryRepo.findByName.mockResolvedValue({ _id: 'cat2', name: 'NewName' }); // conflict

    await expect(
      categoryService.updateCategory('cat1', { name: 'NewName' })
    ).rejects.toThrow('Danh mục với tên này đã tồn tại');
  });

  test('TC-CAT-07: cập nhật danh mục thành công', async () => {
    const existingCat = { _id: 'cat1', name: 'OldName' };
    const updatedCat = { _id: 'cat1', name: 'NewName' };
    mockCategoryRepo.findById.mockResolvedValue(existingCat);
    mockCategoryRepo.findByName.mockResolvedValue(null); // không conflict
    mockCategoryRepo.updateCategory.mockResolvedValue(updatedCat);

    const result = await categoryService.updateCategory('cat1', { name: 'NewName' });
    expect(result).toEqual(updatedCat);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// deleteCategory
// ══════════════════════════════════════════════════════════════════════════
describe('deleteCategory', () => {
  test('TC-CAT-08: ném lỗi khi không tìm thấy danh mục cần xóa', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(categoryService.deleteCategory('bad-id')).rejects.toThrow(
      'Không tìm thấy danh mục'
    );
  });

  test('TC-CAT-09: xóa thành công và trả về message xác nhận', async () => {
    mockCategoryRepo.findById.mockResolvedValue({ _id: 'cat1' });
    mockCategoryRepo.deleteCategory.mockResolvedValue(undefined);

    const result = await categoryService.deleteCategory('cat1');
    expect(result).toEqual({ message: 'Xóa danh mục thành công' });
    expect(mockCategoryRepo.deleteCategory).toHaveBeenCalledWith('cat1');
  });
});
