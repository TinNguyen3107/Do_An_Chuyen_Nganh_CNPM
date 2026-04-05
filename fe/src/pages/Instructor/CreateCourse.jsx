import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, categoryAPI, chapterAPI, lessonAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Icons (inline SVG thay cho lucide-react) ───────────────────────────────
const IconArrowLeft  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>;
const IconPlus       = ({ size = 4 }) => <svg className={`w-${size} h-${size}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IconTrash      = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const IconChevronUp  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>;
const IconChevronDn  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>;
const IconVideo      = ({ cls = 'w-4 h-4' }) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>;
const IconText       = ({ cls = 'w-4 h-4' }) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IconQuiz       = ({ cls = 'w-4 h-4' }) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconSave       = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>;
const IconGrip       = () => <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>;

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'basic',      label: 'Thông tin cơ bản' },
  { key: 'thumbnail',  label: 'Ảnh bìa' },
  { key: 'curriculum', label: 'Chương trình giảng dạy' },
  { key: 'settings',   label: 'Cài đặt thêm' },
];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('basic');
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [thumbnail, setThumbnail]       = useState(null);
  const [preview, setPreview]           = useState('');
  const [editingLessonId, setEditingLessonId] = useState(null);

  // Basic info form
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '',
    category: '', price: 0, level: 'all',
    language: 'Tiếng Việt',
    requirements: [''], objectives: [''], tags: '',
  });

  // Local chapters state (UI only — saved to API after course created)
  const [chapters, setChapters] = useState([
    { id: 1, title: 'Chương 1: Giới thiệu', expanded: true, lessons: [] }
  ]);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data || []));
  }, []);

  // ── Form helpers ────────────────────────────────────────────────────────────
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const handleList  = (key, idx, val) => { const a = [...form[key]]; a[idx] = val; set(key, a); };
  const addItem     = (key) => set(key, [...form[key], '']);
  const removeItem  = (key, idx) => set(key, form[key].filter((_, i) => i !== idx));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Chỉ chấp nhận file ảnh'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Ảnh tối đa 5MB'); return; }
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── Chapter helpers ─────────────────────────────────────────────────────────
  const addChapter = () => setChapters(cs => [
    ...cs,
    { id: Date.now(), title: `Chương ${cs.length + 1}: Chương mới`, expanded: true, lessons: [] }
  ]);

  const updateChapterTitle = (cId, title) =>
    setChapters(cs => cs.map(c => c.id === cId ? { ...c, title } : c));

  const removeChapter = (cId) =>
    setChapters(cs => cs.filter(c => c.id !== cId));

  const toggleChapter = (cId) =>
    setChapters(cs => cs.map(c => c.id === cId ? { ...c, expanded: !c.expanded } : c));

  const addLesson = (cId, type) =>
    setChapters(cs => cs.map(c => c.id === cId ? {
      ...c,
      lessons: [...c.lessons, { id: Date.now(), title: `Bài mới`, type, videoUrl: '', content: '', questions: [] }]
    } : c));

  const updateLesson = (cId, lId, patch) =>
    setChapters(cs => cs.map(c => c.id === cId ? {
      ...c,
      lessons: c.lessons.map(l => l.id === lId ? { ...l, ...patch } : l)
    } : c));

  const removeLesson = (cId, lId) =>
    setChapters(cs => cs.map(c => c.id === cId ? {
      ...c, lessons: c.lessons.filter(l => l.id !== lId)
    } : c));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      toast.error('Vui lòng điền Tiêu đề, Mô tả và Danh mục (tab Thông tin cơ bản)');
      setActiveTab('basic');
      return false;
    }
    return true;
  };

  const handleSave = async (goToLessons = false) => {
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('shortDescription', form.shortDescription);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('status', 'draft');
      fd.append('level', form.level);
      fd.append('requirements', JSON.stringify(form.requirements.filter(r => r.trim())));
      fd.append('objectives', JSON.stringify(form.objectives.filter(o => o.trim())));
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      if (thumbnail) fd.append('thumbnail', thumbnail);

      const res = await courseAPI.create(fd);
      const courseId = res.data.data?._id;

      // ── Tự động tạo chapters & lessons nếu GV đã điền ────────────────────
      if (courseId && goToLessons) {
        // Lọc các chương có nội dung (tiêu đề khác default HOẶC có bài học)
        const meaningfulChapters = chapters.filter(
          ch => ch.lessons.length > 0 || !ch.title.startsWith('Chương') === false
            ? true : ch.title.trim() !== ''
        );

        for (let i = 0; i < meaningfulChapters.length; i++) {
          const ch = meaningfulChapters[i];
          try {
            // Tạo chương trên API
            const chRes = await chapterAPI.create(courseId, {
              title: ch.title,
              description: '',
              order: i + 1,
            });
            const chapterId = chRes.data.data?._id;

            // Tạo từng bài học trong chương
            if (chapterId && ch.lessons.length > 0) {
              for (let j = 0; j < ch.lessons.length; j++) {
                const ls = ch.lessons[j];
                const lessonData = {
                  title: ls.title || `Bài ${j + 1}`,
                  type: ls.type || 'video',
                  order: j + 1,
                  video_url: ls.videoUrl || '',
                  text_content: ls.content || '',
                };
                await lessonAPI.create(chapterId, lessonData);
              }
            }
          } catch (chErr) {
            console.warn('Lỗi tạo chương/bài:', chErr);
            // Không dừng — tiếp tục tạo chương tiếp theo
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────────

      if (goToLessons && courseId) {
        toast.success('✅ Tạo xong! Nội dung đã được lưu.');
        navigate(`/instructor/edit-course/${courseId}?tab=curriculum`);
      } else {
        toast.success('💾 Lưu nháp thành công!');
        navigate('/instructor/dashboard');
      }
    } catch (err) {
      console.error('Create course error:', err.response?.data);
      const errorData = err.response?.data;
      if (errorData?.errors?.length) {
        toast.error(errorData.errors.join(', '));
      } else {
        toast.error(errorData?.message || 'Lỗi khi tạo khoá học');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input styles ─────────────────────────────────────────────────────
  const inputCls  = 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm';
  const labelCls  = 'block text-sm font-medium text-slate-300 mb-1.5';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <IconArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Tạo Khoá học Mới</h1>
            <p className="text-slate-400 text-sm mt-0.5">Thiết lập thông tin và nội dung khoá học</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-medium rounded-xl transition-colors text-sm disabled:opacity-60"
          >
            💾 Lưu nháp
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/25 text-sm disabled:opacity-60"
          >
            <IconSave /> {loading ? 'Đang lưu...' : 'Lưu & Thêm nội dung'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.key
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8">

        {/* ── Tab: Thông tin cơ bản ───────────────────────────────────────── */}
        {activeTab === 'basic' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <label className={labelCls}>Tiêu đề khoá học <span className="text-red-400">*</span></label>
              <input type="text" className={inputCls} placeholder="VD: Lập trình ReactJS từ A đến Z"
                value={form.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>Mô tả ngắn</label>
              <input type="text" className={inputCls} placeholder="Một câu mô tả khoá học..."
                value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>Mô tả chi tiết <span className="text-red-400">*</span></label>
              <textarea rows={4} className={`${inputCls} resize-none`} placeholder="Mô tả đầy đủ về nội dung, lợi ích khoá học..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Danh mục <span className="text-red-400">*</span></label>
                <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Giá (VNĐ)</label>
                <input type="number" min="0" className={inputCls} placeholder="0 = Miễn phí"
                  value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Cấp độ</label>
                <select className={inputCls} value={form.level} onChange={e => set('level', e.target.value)}>
                  <option value="all">Tất cả cấp độ</option>
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Ngôn ngữ</label>
                <select className={inputCls} value={form.language} onChange={e => set('language', e.target.value)}>
                  <option>Tiếng Việt</option>
                  <option>English</option>
                </select>
              </div>
            </div>

            {/* Objectives */}
            <div>
              <label className={labelCls}>🎯 Mục tiêu học tập</label>
              <div className="space-y-2">
                {form.objectives.map((obj, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" className={inputCls} placeholder={`Mục tiêu ${i + 1}...`}
                      value={obj} onChange={e => handleList('objectives', i, e.target.value)} />
                    {form.objectives.length > 1 && (
                      <button onClick={() => removeItem('objectives', i)}
                        className="p-2 text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all">
                        <IconTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => addItem('objectives')}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                <IconPlus size={3} /> Thêm mục tiêu
              </button>
            </div>

            {/* Requirements */}
            <div>
              <label className={labelCls}>📋 Yêu cầu đầu vào</label>
              <div className="space-y-2">
                {form.requirements.map((req, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" className={inputCls} placeholder={`Yêu cầu ${i + 1}...`}
                      value={req} onChange={e => handleList('requirements', i, e.target.value)} />
                    {form.requirements.length > 1 && (
                      <button onClick={() => removeItem('requirements', i)}
                        className="p-2 text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all">
                        <IconTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => addItem('requirements')}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                <IconPlus size={3} /> Thêm yêu cầu
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className={labelCls}>🏷️ Tags</label>
              <input type="text" className={inputCls} placeholder="react, javascript, web (ngăn cách bằng dấu phẩy)"
                value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
          </div>
        )}

        {/* ── Tab: Ảnh bìa ───────────────────────────────────────────────── */}
        {activeTab === 'thumbnail' && (
          <div className="max-w-xl">
            <p className="text-slate-400 text-sm mb-5">Ảnh bìa giúp khoá học nổi bật hơn. Khuyến nghị tỉ lệ 16:9, tối đa 5MB.</p>
            <div
              onClick={() => document.getElementById('thumb-input').click()}
              className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all"
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
                <div className="aspect-video flex flex-col items-center justify-center gap-3 text-slate-500">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🖼️</span>
                  </div>
                  <p className="text-sm font-medium text-slate-300">Nhấn để chọn ảnh bìa</p>
                  <p className="text-xs">PNG, JPG · Tối đa 5MB · Khuyến nghị 16:9</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Chương trình giảng dạy ────────────────────────────────── */}
        {activeTab === 'curriculum' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Nội dung khoá học</h3>
                <p className="text-slate-400 text-xs mt-1">Cấu trúc chương - bài học sẽ được tạo sau khi lưu khoá học.</p>
              </div>
              <button onClick={addChapter}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors text-sm">
                <IconPlus /> Thêm chương
              </button>
            </div>

            <div className="space-y-3">
              {chapters.map((chapter, cIdx) => (
                <div key={chapter.id} className="border border-slate-700 rounded-2xl overflow-hidden">
                  {/* Chapter header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-slate-500 flex-shrink-0"><IconGrip /></span>
                      <span className="text-slate-400 text-sm font-medium flex-shrink-0">Chương {cIdx + 1}:</span>
                      <input
                        type="text"
                        value={chapter.title.includes(': ') ? chapter.title.split(': ').slice(1).join(': ') : chapter.title}
                        onChange={e => updateChapterTitle(chapter.id, `Chương ${cIdx + 1}: ${e.target.value}`)}
                        className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-white text-sm font-semibold"
                        placeholder="Tên chương..."
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => removeChapter(chapter.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                        <IconTrash />
                      </button>
                      <button onClick={() => toggleChapter(chapter.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                        {chapter.expanded ? <IconChevronUp /> : <IconChevronDn />}
                      </button>
                    </div>
                  </div>

                  {/* Lessons */}
                  {chapter.expanded && (
                    <div className="p-4 space-y-2 bg-slate-900/50">
                      {chapter.lessons.map((lesson, lIdx) => (
                        <div key={lesson.id} className="ml-6 border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
                          <div className="flex items-center justify-between px-3 py-2.5">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <span className="text-slate-600"><IconGrip /></span>
                              {/* Type icon */}
                              <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                                lesson.type === 'video' ? 'bg-blue-500/10 text-blue-400' :
                                lesson.type === 'text'  ? 'bg-emerald-500/10 text-emerald-400' :
                                                          'bg-purple-500/10 text-purple-400'
                              }`}>
                                {lesson.type === 'video' ? <IconVideo /> : lesson.type === 'text' ? <IconText /> : <IconQuiz />}
                              </span>
                              <span className="text-slate-500 text-xs flex-shrink-0">Bài {lIdx + 1}:</span>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={e => updateLesson(chapter.id, lesson.id, { title: e.target.value })}
                                className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-white text-sm"
                                placeholder="Tên bài học..."
                              />
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)}
                                className="text-xs font-medium text-slate-400 hover:text-blue-400 px-2 py-1 bg-slate-800 hover:bg-blue-500/10 border border-slate-700 rounded-lg transition-colors"
                              >
                                {editingLessonId === lesson.id ? 'Đóng' : 'Nội dung'}
                              </button>
                              <button onClick={() => removeLesson(chapter.id, lesson.id)}
                                className="p-1 text-slate-600 hover:text-red-400 transition-colors">
                                <IconTrash />
                              </button>
                            </div>
                          </div>

                          {/* Lesson editor */}
                          {editingLessonId === lesson.id && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-800 space-y-3">
                              {lesson.type === 'video' && (
                                <div>
                                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">URL Video (YouTube / link trực tiếp)</label>
                                  <input type="text" placeholder="https://youtube.com/..."
                                    value={lesson.videoUrl}
                                    onChange={e => updateLesson(chapter.id, lesson.id, { videoUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                                </div>
                              )}
                              {lesson.type === 'text' && (
                                <div>
                                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Nội dung bài đọc</label>
                                  <textarea rows={5} placeholder="Nhập nội dung bài đọc..."
                                    value={lesson.content}
                                    onChange={e => updateLesson(chapter.id, lesson.id, { content: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 text-sm resize-y" />
                                </div>
                              )}
                              {lesson.type === 'quiz' && (
                                <p className="text-xs text-slate-500 italic">Quiz sẽ được cấu hình chi tiết sau khi lưu khoá học trong trang Quản lý bài học.</p>
                              )}
                              <div className="flex justify-end">
                                <button
                                  onClick={() => setEditingLessonId(null)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors">
                                  Đóng
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add lesson buttons */}
                      <div className="flex items-center gap-2 ml-6 pt-1">
                        <button onClick={() => addLesson(chapter.id, 'video')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors">
                          <IconPlus size={3} /> Video
                        </button>
                        <button onClick={() => addLesson(chapter.id, 'text')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors">
                          <IconPlus size={3} /> Bài đọc
                        </button>
                        <button onClick={() => addLesson(chapter.id, 'quiz')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors">
                          <IconPlus size={3} /> Trắc nghiệm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-2 italic">
              ✅ Chương và bài học sẽ được tự động tạo khi bạn nhấn "Lưu &amp; Thêm nội dung".
            </p>
          </div>
        )}

        {/* ── Tab: Cài đặt thêm ──────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-xl space-y-4">
            <h3 className="text-base font-bold text-white mb-4">Cài đặt hiển thị</h3>
            {[
              { label: 'Hiển thị tiến độ học tập', desc: 'Cho phép học viên theo dõi phần trăm hoàn thành khoá học.' },
              { label: 'Cho phép đánh giá',         desc: 'Học viên có thể để lại đánh giá sau khi hoàn thành 20% khoá học.' },
              { label: 'Cho phép hỏi đáp',           desc: 'Học viên có thể đặt câu hỏi trong từng bài học.' },
            ].map(item => (
              <label key={item.label} className="flex items-start gap-3 p-4 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer transition-colors">
                <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 accent-blue-500 rounded" />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-5">
        <button onClick={() => navigate('/instructor/dashboard')}
          className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Về dashboard
        </button>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={loading}
            className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-medium rounded-xl transition-all text-sm disabled:opacity-60">
            💾 Lưu nháp
          </button>
          <button onClick={() => handleSave(true)} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm disabled:opacity-60">
            <IconSave /> {loading ? 'Đang lưu...' : 'Lưu & Thêm nội dung'}
          </button>
        </div>
      </div>
    </div>
  );
}
