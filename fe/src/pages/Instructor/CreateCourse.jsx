import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data || []));
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleList = (key, idx, val) => {
    const arr = [...form[key]];
    arr[idx] = val;
    set(key, arr);
  };

  const addItem = (key) => set(key, [...form[key], '']);
  const removeItem = (key, idx) => set(key, form[key].filter((_, i) => i !== idx));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Chỉ chấp nhận file ảnh'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh tối đa 5MB'); return; }
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (status = 'draft') => {
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      toast.error('Vui lòng điền đầy đủ Tiêu đề, Mô tả và Danh mục');
      return;
    }
    if (Number(form.price) < 0) {
      toast.error('Giá không được âm');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('shortDescription', form.shortDescription);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('status', status);
      fd.append('level', form.level);
      fd.append('language', form.language);
      fd.append('requirements', JSON.stringify(form.requirements.filter(r => r.trim())));
      fd.append('objectives', JSON.stringify(form.objectives.filter(o => o.trim())));
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      if (thumbnail) fd.append('thumbnail', thumbnail);

      await courseAPI.create(fd);

      if (status === 'published') {
        toast.success('✅ Khoá học đã được xuất bản!');
      } else {
        toast.success('💾 Lưu nháp thành công!');
      }
      navigate('/instructor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo khoá học');
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, id, ...props }) => (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
      <input id={id} {...props} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Tạo Khoá học Mới</h1>
          <p className="text-slate-400 text-sm">Điền thông tin để tạo khoá học của bạn</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* BASIC INFO */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">📋 Thông tin cơ bản</h2>

          <Input id="title" label="Tiêu đề khoá học *" placeholder="VD: Lập trình React từ A đến Z" value={form.title} onChange={e => set('title', e.target.value)} />

          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả ngắn</label>
            <input type="text" placeholder="Mô tả một câu về khoá học..." value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả chi tiết *</label>
            <textarea rows={5} placeholder="Mô tả đầy đủ về nội dung, lợi ích khoá học..." value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Danh mục *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all">
                <option value="">— Chọn danh mục —</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Cấp độ</label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all">
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Giá (VNĐ)</label>
              <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all" placeholder="0 = Miễn phí" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Ngôn ngữ</label>
              <select value={form.language} onChange={e => set('language', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all">
                <option>Tiếng Việt</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </section>

        {/* THUMBNAIL */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">🖼️ Ảnh bìa khoá học</h2>
          <div
            onClick={() => document.getElementById('thumb-input').click()}
            className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all"
          >
            <input id="thumb-input" type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {preview ? (
              <div className="relative aspect-video">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Nhấn để thay đổi ảnh</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-slate-400 transition-colors">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">🎯 Mục tiêu học tập</h2>
          <div className="space-y-3">
            {form.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder={`Mục tiêu ${i + 1}...`} value={obj} onChange={e => handleList('objectives', i, e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                {form.objectives.length > 1 && (
                  <button onClick={() => removeItem('objectives', i)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => addItem('objectives')} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Thêm mục tiêu
          </button>
        </section>

        {/* REQUIREMENTS */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">📋 Yêu cầu đầu vào</h2>
          <div className="space-y-3">
            {form.requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder={`Yêu cầu ${i + 1}...`} value={req} onChange={e => handleList('requirements', i, e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                {form.requirements.length > 1 && (
                  <button onClick={() => removeItem('requirements', i)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => addItem('requirements')} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Thêm yêu cầu
          </button>
        </section>

        {/* TAGS */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5">🏷️ Tags</h2>
          <input type="text" placeholder="react, javascript, web, frontend (ngăn cách bằng dấu phẩy)" value={form.tags} onChange={e => set('tags', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all" />
        </section>

        {/* ACTIONS */}
        <div className="flex gap-3 justify-end pb-8">
          <button onClick={() => navigate('/instructor/dashboard')} className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all">
            Huỷ
          </button>
          <button onClick={() => handleSubmit('draft')} disabled={loading} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60">
            💾 Lưu nháp
          </button>
          <button onClick={() => handleSubmit('published')} disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60">
            {loading ? 'Đang xử lý...' : '🚀 Xuất bản ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
