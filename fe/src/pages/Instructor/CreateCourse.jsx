import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ĐƯA COMPONENT NÀY RA NGOÀI - TRƯỚC HÀM CreateCourse
const InputField = ({ label, id, required, value, onChange, disabled, placeholder, type = 'text' }) => {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
      />
    </div>
  );
};

export default function CreateCourse() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    price: 0,
    level: 'all',
    language: 'Tiếng Việt',
    requirements: [''],
    objectives: [''],
    tags: '',
  });

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setFetchingCategories(true);
        const res = await categoryAPI.getAll();
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Fetch categories error:', error);
        toast.error('Không thể tải danh mục. Vui lòng refresh lại trang.');
      } finally {
        setFetchingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleListChange = (key, idx, val) => {
    setForm(prev => {
      const arr = [...prev[key]];
      arr[idx] = val;
      return { ...prev, [key]: arr };
    });
  };

  const addListItem = (key) => {
    setForm(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  };
  
  const removeListItem = (key, idx) => {
    setForm(prev => {
      if (prev[key].length > 1) {
        return { ...prev, [key]: prev[key].filter((_, i) => i !== idx) };
      }
      return prev;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) { 
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)'); 
      return; 
    }
    
    if (file.size > 5 * 1024 * 1024) { 
      toast.error('Ảnh tối đa 5MB'); 
      return; 
    }
    
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.title.trim()) errors.push('Tiêu đề khóa học');
    if (!form.description.trim()) errors.push('Mô tả chi tiết');
    if (!form.category) errors.push('Danh mục');
    if (Number(form.price) < 0) {
      toast.error('Giá không được âm');
      return false;
    }
    
    if (errors.length > 0) {
      toast.error(`Vui lòng nhập: ${errors.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (status = 'draft') => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const fd = new FormData();
      
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('shortDescription', form.shortDescription.trim());
      fd.append('category', form.category);
      fd.append('price', Number(form.price));
      fd.append('status', status);
      fd.append('level', form.level);
      fd.append('language', form.language);
      
      const validRequirements = form.requirements.filter(r => r.trim());
      if (validRequirements.length > 0) {
        fd.append('requirements', JSON.stringify(validRequirements));
      }
      
      const validObjectives = form.objectives.filter(o => o.trim());
      if (validObjectives.length > 0) {
        fd.append('objectives', JSON.stringify(validObjectives));
      }
      
      if (form.tags.trim()) {
        const tags = form.tags.split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0);
        if (tags.length > 0) {
          fd.append('tags', JSON.stringify(tags));
        }
      }
      
      if (thumbnail) {
        fd.append('thumbnail', thumbnail);
      }

      await courseAPI.create(fd);

      toast.success(
        status === 'published' 
          ? '✅ Khóa học đã được xuất bản thành công!' 
          : '💾 Đã lưu vào bản nháp'
      );
      
      setTimeout(() => {
        navigate('/instructor/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Create course error:', err);
      
      const errorMsg = err.response?.data?.message;
      if (errorMsg?.includes('category')) {
        toast.error('Danh mục không hợp lệ. Vui lòng chọn lại.');
      } else if (errorMsg?.includes('price')) {
        toast.error('Giá khóa học không hợp lệ');
      } else if (errorMsg?.includes('title')) {
        toast.error('Tiêu đề khóa học đã tồn tại');
      } else {
        toast.error(errorMsg || 'Lỗi khi tạo khóa học. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          disabled={loading}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Tạo Khóa học Mới</h1>
          <p className="text-slate-400 text-sm">Điền thông tin để tạo khóa học của bạn</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* BASIC INFO */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span>📋</span> Thông tin cơ bản
          </h2>

          <InputField
            id="title"
            label="Tiêu đề khóa học"
            required
            placeholder="VD: Lập trình React từ A đến Z"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            disabled={loading}
          />

          <InputField
            id="shortDesc"
            label="Mô tả ngắn"
            placeholder="Mô tả một câu về khóa học..."
            value={form.shortDescription}
            onChange={e => setField('shortDescription', e.target.value)}
            disabled={loading}
          />

          <div className="mb-5">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-2">
              Mô tả chi tiết <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Mô tả đầy đủ về nội dung, lợi ích khóa học..."
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-300 mb-2">
                Danh mục <span className="text-red-400">*</span>
              </label>
              <select
                id="category"
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
                disabled={loading || categories.length === 0}
              >
                <option value="">— Chọn danh mục —</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {categories.length === 0 && !fetchingCategories && (
                <p className="text-xs text-red-400 mt-1">Không có danh mục nào. Vui lòng liên hệ Admin.</p>
              )}
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-semibold text-slate-300 mb-2">
                Cấp độ
              </label>
              <select
                id="level"
                value={form.level}
                onChange={e => setField('level', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
                disabled={loading}
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-300 mb-2">
                Giá (VNĐ)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="1000"
                value={form.price}
                onChange={e => setField('price', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
                placeholder="0 = Miễn phí"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-semibold text-slate-300 mb-2">
                Ngôn ngữ
              </label>
              <select
                id="language"
                value={form.language}
                onChange={e => setField('language', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
                disabled={loading}
              >
                <option>Tiếng Việt</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </section>

        {/* THUMBNAIL */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span>🖼️</span> Ảnh bìa khóa học
          </h2>
          <div
            onClick={() => !loading && document.getElementById('thumb-input')?.click()}
            className={`cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              id="thumb-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            {preview ? (
              <div className="relative aspect-video">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Nhấn để thay đổi ảnh</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-slate-400 transition-colors">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium">Nhấn để chọn ảnh bìa</p>
                  <p className="text-xs mt-1">PNG, JPG · Tối đa 5MB · Khuyến nghị 16:9</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* OBJECTIVES */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span>🎯</span> Mục tiêu học tập
          </h2>
          <div className="space-y-3">
            {form.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Mục tiêu ${i + 1}...`}
                  value={obj}
                  onChange={e => handleListChange('objectives', i, e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-60"
                  disabled={loading}
                />
                <button
                  onClick={() => removeListItem('objectives', i)}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                  disabled={form.objectives.length === 1 || loading}
                  aria-label="Xóa mục tiêu"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => addListItem('objectives')}
            className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm mục tiêu
          </button>
        </section>

        {/* REQUIREMENTS */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span>📋</span> Yêu cầu đầu vào
          </h2>
          <div className="space-y-3">
            {form.requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Yêu cầu ${i + 1}...`}
                  value={req}
                  onChange={e => handleListChange('requirements', i, e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-60"
                  disabled={loading}
                />
                <button
                  onClick={() => removeListItem('requirements', i)}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                  disabled={form.requirements.length === 1 || loading}
                  aria-label="Xóa yêu cầu"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => addListItem('requirements')}
            className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm yêu cầu
          </button>
        </section>

        {/* TAGS */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span>🏷️</span> Tags
          </h2>
          <input
            type="text"
            placeholder="react, javascript, web, frontend (ngăn cách bằng dấu phẩy)"
            value={form.tags}
            onChange={e => setField('tags', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-2">
            Nhập các tag cách nhau bằng dấu phẩy (,)
          </p>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              '💾 Lưu nháp'
            )}
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              '🚀 Xuất bản ngay'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}