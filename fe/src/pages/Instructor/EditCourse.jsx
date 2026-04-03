import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    status: 'draft',
  });

  useEffect(() => {
    Promise.all([
      courseAPI.getById(id),
      categoryAPI.getAll(),
    ]).then(([cRes, catRes]) => {
      const c = cRes.data.data;
      setForm({
        title: c.title || '',
        description: c.description || '',
        shortDescription: c.shortDescription || '',
        category: c.category?._id || c.category || '',
        price: c.price || 0,
        level: c.level || 'all',
        language: c.language || 'Tiếng Việt',
        requirements: c.requirements?.length ? c.requirements : [''],
        objectives: c.objectives?.length ? c.objectives : [''],
        tags: c.tags?.join(', ') || '',
        status: c.status,
      });
      setPreview(c.thumbnail || '');
      setCategories(catRes.data.data || []);
    }).catch(() => {
      toast.error('Không thể tải thông tin khoá học');
      navigate('/instructor/dashboard');
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const handleList = (key, idx, val) => { const arr = [...form[key]]; arr[idx] = val; set(key, arr); };
  const addItem = (key) => set(key, [...form[key], '']);
  const removeItem = (key, idx) => set(key, form[key].filter((_, i) => i !== idx));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (publish = false) => {
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      toast.error('Vui lòng điền đầy đủ Tiêu đề, Mô tả và Danh mục');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('shortDescription', form.shortDescription);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('level', form.level);
      fd.append('language', form.language);
      fd.append('requirements', JSON.stringify(form.requirements.filter(r => r.trim())));
      fd.append('objectives', JSON.stringify(form.objectives.filter(o => o.trim())));
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      if (thumbnail) fd.append('thumbnail', thumbnail);

      await courseAPI.update(id, fd);

      if (publish && form.status === 'draft') {
        await courseAPI.publish(id);
        toast.success('✅ Khoá học đã được xuất bản!');
      } else {
        toast.success('💾 Cập nhật thành công!');
      }
      navigate('/instructor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu khoá học');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-slate-800 rounded w-1/3" />
      <div className="h-64 bg-slate-800 rounded-2xl" />
      <div className="h-48 bg-slate-800 rounded-2xl" />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Chỉnh sửa Khoá học</h1>
          <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded text-xs font-bold border ${form.status === 'published' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {form.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* BASIC INFO */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5">📋 Thông tin cơ bản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tiêu đề *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả ngắn</label>
              <input type="text" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả chi tiết *</label>
              <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Danh mục *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all">
                  <option value="">— Chọn —</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Cấp độ</label>
                <select value={form.level} onChange={e => set('level', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all">
                  <option value="all">Tất cả</option>
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Giá (VNĐ)</label>
                <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Ngôn ngữ</label>
                <select value={form.language} onChange={e => set('language', e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all">
                  <option>Tiếng Việt</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* THUMBNAIL */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5">🖼️ Ảnh bìa</h2>
          <div onClick={() => document.getElementById('edit-thumb').click()} className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all">
            <input id="edit-thumb" type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {preview ? (
              <div className="relative aspect-video">
                <img src={preview} alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm">Nhấn để thay đổi</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-slate-500">
                <p className="text-sm">Nhấn để chọn ảnh bìa</p>
              </div>
            )}
          </div>
        </section>

        {/* OBJECTIVES */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">🎯 Mục tiêu học tập</h2>
          <div className="space-y-3">
            {form.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={obj} onChange={e => handleList('objectives', i, e.target.value)} placeholder={`Mục tiêu ${i + 1}...`} className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                {form.objectives.length > 1 && <button onClick={() => removeItem('objectives', i)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
              </div>
            ))}
          </div>
          <button onClick={() => addItem('objectives')} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Thêm mục tiêu
          </button>
        </section>

        {/* REQUIREMENTS */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">📋 Yêu cầu đầu vào</h2>
          <div className="space-y-3">
            {form.requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={req} onChange={e => handleList('requirements', i, e.target.value)} placeholder={`Yêu cầu ${i + 1}...`} className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                {form.requirements.length > 1 && <button onClick={() => removeItem('requirements', i)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
              </div>
            ))}
          </div>
          <button onClick={() => addItem('requirements')} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Thêm yêu cầu
          </button>
        </section>

        {/* TAGS */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">🏷️ Tags</h2>
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="react, javascript (ngăn cách bằng dấu phẩy)" className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all" />
        </section>

        {/* ACTIONS */}
        <div className="flex gap-3 justify-end pb-8">
          <button onClick={() => navigate('/instructor/dashboard')} className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all">Huỷ</button>
          <button onClick={() => handleSave(false)} disabled={saving} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60">💾 Lưu thay đổi</button>
          {form.status === 'draft' && (
            <button onClick={() => handleSave(true)} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60">
              {saving ? 'Đang xử lý...' : '🚀 Lưu & Xuất bản'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
