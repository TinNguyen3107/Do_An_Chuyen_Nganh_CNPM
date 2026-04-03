import { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '💻' });
  const [saving, setSaving] = useState(false);

  // Danh sách Icon mẫu cho danh mục
  const CATEGORY_ICONS = ['💻', '🌐', '🤖', '📊', '📱', '🎨', '🔐', '☁️', '🗄️', '🎮', '📝', '🔬'];

  // Lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      // res.data.data chứa mảng các danh mục từ backend
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Lỗi fetch categories:', err);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Mở form tạo mới
  const openCreate = () => {
    setEditId(null);
    setFormData({ name: '', description: '', icon: '💻' });
    setShowForm(true);
  };

  // Mở form chỉnh sửa
  const openEdit = (cat) => {
    setEditId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '💻'
    });
    setShowForm(true);
  };

  // Lưu danh mục (Tạo mới hoặc Cập nhật)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        // Gọi API update
        await categoryAPI.update(editId, formData);
        toast.success('✅ Cập nhật danh mục thành công');
      } else {
        // Gọi API create
        await categoryAPI.create(formData);
        toast.success('✅ Tạo danh mục thành công');
      }
      setShowForm(false);
      fetchCategories(); // Reload danh sách
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  // Xóa danh mục
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xoá danh mục "${name}"? Hành động này không thể hoàn tác.`)) return;

    try {
      await categoryAPI.delete(id);
      toast.success('Đã xoá danh mục');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xoá danh mục');
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Danh mục</h1>
          <p className="text-slate-400 mt-1">{categories.length} danh mục trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm danh mục mới
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
              <div className="h-3 bg-slate-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
          <div className="text-5xl mb-4">📁</div>
          <h2 className="text-xl font-bold text-white mb-2">Chưa có danh mục nào</h2>
          <p className="text-slate-400 mb-6">Tạo danh mục đầu tiên để phân loại khoá học</p>
          <button onClick={openCreate} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">
            Tạo danh mục
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                    {cat.icon || '📁'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                    {/* Sprint 1 mặc định 0 nếu courseCount chưa có */}
                    <p className="text-xs text-slate-500 mt-0.5">{cat.courseCount || 0} khoá học</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM (Create/Edit) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-5">{editId ? '✏️ Chỉnh sửa danh mục' : '➕ Tạo danh mục mới'}</h3>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">Tên danh mục *</label>
              <input
                type="text"
                placeholder="VD: Lập trình Web"
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-100/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả <span className="text-slate-500">(tùy chọn)</span></label>
              <textarea
                rows={2}
                placeholder="Mô tả ngắn về danh mục..."
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-100/50 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Biểu tượng (Icon)</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, icon }))}
                    className={`w-9 h-9 text-xl rounded-lg border transition-all ${formData.icon === icon ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Tạo danh mục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}