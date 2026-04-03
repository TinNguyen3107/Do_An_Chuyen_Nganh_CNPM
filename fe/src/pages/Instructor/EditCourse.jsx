import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, categoryAPI, chapterAPI, lessonAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────
const TABS = ['Thông tin', 'Nội dung'];

const LESSON_TYPES = [
  { value: 'video', label: '🎬 Video' },
  { value: 'text',  label: '📄 Văn bản' },
  { value: 'quiz',  label: '🧠 Quiz' },
];

function LessonForm({ lesson, onSave, onCancel }) {
  const [data, setData] = useState({
    title:        lesson?.title || '',
    type:         lesson?.type  || 'video',
    video_url:    lesson?.video_url    || '',
    duration:     lesson?.duration     || 0,
    text_content: lesson?.text_content || '',
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mt-2 space-y-3">
      <div className="flex gap-3">
        <input
          type="text" placeholder="Tiêu đề bài học *" value={data.title}
          onChange={e => set('title', e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none"
        />
        <select
          value={data.type} onChange={e => set('type', e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {LESSON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {data.type === 'video' && (
        <div className="flex gap-3">
          <input
            type="url" placeholder="URL video (YouTube, Vimeo...)" value={data.video_url}
            onChange={e => set('video_url', e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none"
          />
          <input
            type="number" min="0" placeholder="Thời lượng (s)" value={data.duration}
            onChange={e => set('duration', Number(e.target.value))}
            className="w-32 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>
      )}

      {data.type === 'text' && (
        <textarea
          rows={4} placeholder="Nội dung bài học..." value={data.text_content}
          onChange={e => set('text_content', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none resize-none"
        />
      )}

      {data.type === 'quiz' && (
        <p className="text-xs text-slate-500 italic">Quiz sẽ có thể thêm câu hỏi sau khi tạo bài học.</p>
      )}

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-1.5 text-xs text-slate-400 hover:text-white transition">Huỷ</button>
        <button
          onClick={() => onSave(data)}
          disabled={!data.title.trim()}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
        >
          {lesson ? 'Lưu' : 'Thêm bài học'}
        </button>
      </div>
    </div>
  );
}

// ─── Chapter row ──────────────────────────────────────────────────
function ChapterRow({ chapter, courseId, onRefresh, isLocked }) {
  const [open, setOpen]           = useState(true);
  const [editing, setEditing]     = useState(false);
  const [title, setTitle]         = useState(chapter.title);
  const [addingLesson, setAdding] = useState(false);
  const [editLesson, setEditLesson] = useState(null); // lesson being edited

  const saveChapterTitle = async () => {
    if (!title.trim()) return;
    try {
      await chapterAPI.update(chapter._id, { title });
      toast.success('Đã cập nhật tên chương');
      setEditing(false);
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi cập nhật chương');
    }
  };

  const deleteChapter = async () => {
    if (!window.confirm('Xoá chương này và toàn bộ bài học trong chương?')) return;
    try {
      await chapterAPI.delete(chapter._id);
      toast.success('Đã xoá chương');
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi xoá chương');
    }
  };

  const addLesson = async (data) => {
    try {
      await lessonAPI.create(chapter._id, data);
      toast.success('Đã thêm bài học!');
      setAdding(false);
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi thêm bài học');
    }
  };

  const saveLesson = async (lessonId, data) => {
    try {
      await lessonAPI.update(lessonId, data);
      toast.success('Đã cập nhật bài học');
      setEditLesson(null);
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi cập nhật bài học');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Xoá bài học này?')) return;
    try {
      await lessonAPI.delete(lessonId);
      toast.success('Đã xoá bài học');
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi xoá bài học');
    }
  };

  const TYPE_ICON = { video: '🎬', text: '📄', quiz: '🧠' };

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      {/* Chapter header */}
      <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-3">
        <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-white transition text-xs">
          {open ? '▼' : '▶'}
        </button>
        {editing ? (
          <input
            value={title} onChange={e => setTitle(e.target.value)} autoFocus
            onKeyDown={e => e.key === 'Enter' && saveChapterTitle()}
            className="flex-1 bg-slate-900 border border-blue-500 text-slate-100 rounded-lg px-3 py-1 text-sm outline-none"
          />
        ) : (
          <span className="flex-1 font-semibold text-white text-sm">{chapter.title}</span>
        )}
        <span className="text-xs text-slate-500">{chapter.lessons?.length || 0} bài</span>

        {!isLocked && (
          <>
            {editing ? (
              <>
                <button onClick={saveChapterTitle} className="text-xs text-blue-400 hover:text-blue-300 font-bold">Lưu</button>
                <button onClick={() => { setEditing(false); setTitle(chapter.title); }} className="text-xs text-slate-500 hover:text-white">Huỷ</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-blue-400 transition">✏️</button>
            )}
            <button onClick={deleteChapter} className="text-xs text-slate-400 hover:text-red-400 transition">🗑️</button>
          </>
        )}
      </div>

      {/* Lessons */}
      {open && (
        <div className="px-4 py-3 space-y-2 bg-slate-900/50">
          {(chapter.lessons || []).map(lesson => (
            <div key={lesson._id}>
              {editLesson === lesson._id ? (
                <LessonForm
                  lesson={lesson}
                  onSave={(data) => saveLesson(lesson._id, data)}
                  onCancel={() => setEditLesson(null)}
                />
              ) : (
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/50 group transition">
                  <span className="text-sm">{TYPE_ICON[lesson.type]}</span>
                  <span className="flex-1 text-sm text-slate-300">{lesson.title}</span>
                  {lesson.duration > 0 && (
                    <span className="text-xs text-slate-500">{Math.round(lesson.duration / 60)}p</span>
                  )}
                  {!isLocked && (
                    <div className="hidden group-hover:flex gap-2">
                      <button onClick={() => setEditLesson(lesson._id)} className="text-xs text-slate-400 hover:text-blue-400">✏️</button>
                      <button onClick={() => deleteLesson(lesson._id)}  className="text-xs text-slate-400 hover:text-red-400">🗑️</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {addingLesson ? (
            <LessonForm onSave={addLesson} onCancel={() => setAdding(false)} />
          ) : (
            !isLocked && (
              <button
                onClick={() => setAdding(true)}
                className="mt-1 w-full text-xs text-slate-500 hover:text-blue-400 border border-dashed border-slate-700 hover:border-blue-500/50 rounded-lg py-2 transition"
              >
                + Thêm bài học
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [course, setCourse]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview]     = useState('');

  // Chapter/Lesson state
  const [chapters, setChapters]       = useState([]);
  const [chapLoading, setChapLoading] = useState(false);
  const [newChapTitle, setNewChapTitle] = useState('');
  const [addingChapter, setAddingChapter] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '',
    category: '', price: 0, level: 'all', language: 'Tiếng Việt',
    requirements: [''], objectives: [''], tags: '', status: 'draft',
  });

  // Load course + categories
  useEffect(() => {
    Promise.all([courseAPI.getById(id), categoryAPI.getAll()])
      .then(([cRes, catRes]) => {
        const c = cRes.data.data;
        setCourse(c);
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
      })
      .catch(() => { toast.error('Không thể tải thông tin khoá học'); navigate('/instructor/dashboard'); })
      .finally(() => setLoading(false));
  }, [id]);

  // Load chapters when switching to Curriculum tab
  const loadChapters = useCallback(async () => {
    setChapLoading(true);
    try {
      const res = await chapterAPI.getByCourse(id);
      setChapters(res.data.data || []);
    } catch {
      toast.error('Lỗi tải nội dung khoá học');
    } finally {
      setChapLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 1) loadChapters();
  }, [activeTab, loadChapters]);

  // Form helpers
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

  // Save info
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

  // Add chapter
  const handleAddChapter = async () => {
    if (!newChapTitle.trim()) return;
    try {
      await chapterAPI.create(id, { title: newChapTitle });
      toast.success('Đã thêm chương!');
      setNewChapTitle('');
      setAddingChapter(false);
      loadChapters();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi thêm chương');
    }
  };

  // Submit for review
  const handleSubmit = async () => {
    if (!window.confirm('Gửi khoá học này để Admin duyệt?')) return;
    setSubmitting(true);
    try {
      await courseAPI.submit(id);
      toast.success('Đã gửi duyệt thành công! 🎉');
      navigate('/instructor/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi gửi duyệt');
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = course?.reviewStatus === 'pending' && course?.submittedAt;
  const canSubmit = course?.status === 'published' && !isLocked;

  if (loading) return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-slate-800 rounded w-1/3" />
      <div className="h-64 bg-slate-800 rounded-2xl" />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Chỉnh sửa Khoá học</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border ${form.status === 'published' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {form.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
            </span>
            {course?.reviewStatus && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border ${
                course.reviewStatus === 'approved' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                course.reviewStatus === 'rejected' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                'border-amber-500/30 bg-amber-500/10 text-amber-400'
              }`}>
                {course.reviewStatus === 'approved' ? '✅ Đã duyệt' : course.reviewStatus === 'rejected' ? '❌ Bị từ chối' : '⏳ Chờ duyệt'}
              </span>
            )}
          </div>
        </div>
        {/* Submit button */}
        {canSubmit && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : course?.reviewStatus === 'approved' ? '🔄 Gửi cập nhật' : '🚀 Gửi duyệt'}
          </button>
        )}
      </div>

      {/* Rejection reason */}
      {course?.reviewStatus === 'rejected' && course?.rejectionReason && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
          <span className="font-bold text-red-400">Lý do từ chối:</span> {course.rejectionReason}
        </div>
      )}

      {/* Locked notice */}
      {isLocked && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
          ⚠️ Khoá học đang chờ Admin duyệt. Bạn không thể thêm/sửa/xoá bài học lúc này.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === i ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB 0: Thông tin ────────────────────────────────────────── */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Basic info */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-5">📋 Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Tiêu đề *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả ngắn</label>
                <input type="text" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả chi tiết *</label>
                <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Danh mục *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none">
                    <option value="">— Chọn —</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Cấp độ</label>
                  <select value={form.level} onChange={e => set('level', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none">
                    <option value="all">Tất cả</option>
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Giá (VNĐ)</label>
                  <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Ngôn ngữ</label>
                  <select value={form.language} onChange={e => set('language', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none">
                    <option>Tiếng Việt</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Thumbnail */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-5">🖼️ Ảnh bìa</h2>
            <div onClick={() => document.getElementById('edit-thumb').click()}
              className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all">
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

          {/* Objectives */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">🎯 Mục tiêu học tập</h2>
            <div className="space-y-3">
              {form.objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={obj} onChange={e => handleList('objectives', i, e.target.value)}
                    placeholder={`Mục tiêu ${i + 1}...`}
                    className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none" />
                  {form.objectives.length > 1 && (
                    <button onClick={() => removeItem('objectives', i)} className="p-2.5 text-slate-500 hover:text-red-400 rounded-xl transition-all">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => addItem('objectives')} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              + Thêm mục tiêu
            </button>
          </section>

          {/* Requirements */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">📋 Yêu cầu đầu vào</h2>
            <div className="space-y-3">
              {form.requirements.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={req} onChange={e => handleList('requirements', i, e.target.value)}
                    placeholder={`Yêu cầu ${i + 1}...`}
                    className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none" />
                  {form.requirements.length > 1 && (
                    <button onClick={() => removeItem('requirements', i)} className="p-2.5 text-slate-500 hover:text-red-400 rounded-xl transition-all">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => addItem('requirements')} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              + Thêm yêu cầu
            </button>
          </section>

          {/* Tags */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">🏷️ Tags</h2>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="react, javascript (ngăn cách bằng dấu phẩy)"
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none" />
          </section>

          {/* Actions */}
          <div className="flex gap-3 justify-end pb-8">
            <button onClick={() => navigate('/instructor/dashboard')} className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all">Huỷ</button>
            <button onClick={() => handleSave(false)} disabled={saving} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60">
              💾 Lưu thay đổi
            </button>
            {form.status === 'draft' && (
              <button onClick={() => handleSave(true)} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60">
                {saving ? 'Đang xử lý...' : '🚀 Lưu & Xuất bản'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 1: Nội dung (Curriculum) ────────────────────────────── */}
      {activeTab === 1 && (
        <div className="space-y-4 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">📚 Nội dung khoá học</h2>
              <p className="text-xs text-slate-500 mt-0.5">{chapters.length} chương • {chapters.reduce((s, c) => s + (c.lessons?.length || 0), 0)} bài học</p>
            </div>
            {!isLocked && (
              <button
                onClick={() => setAddingChapter(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition"
              >
                + Thêm chương
              </button>
            )}
          </div>

          {/* Add chapter form */}
          {addingChapter && (
            <div className="flex gap-3 bg-slate-900 border border-slate-700 rounded-xl p-4">
              <input
                autoFocus value={newChapTitle} onChange={e => setNewChapTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddChapter()}
                placeholder="Tên chương học..."
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none"
              />
              <button onClick={handleAddChapter} disabled={!newChapTitle.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition disabled:opacity-50">Thêm</button>
              <button onClick={() => { setAddingChapter(false); setNewChapTitle(''); }} className="px-4 py-2 text-slate-400 hover:text-white text-sm transition">Huỷ</button>
            </div>
          )}

          {/* Chapter list */}
          {chapLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" /></div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-700 rounded-2xl">
              <p className="text-3xl mb-3">📂</p>
              <p className="text-slate-400 text-sm">Khoá học chưa có chương nào.</p>
              <p className="text-xs text-slate-500 mt-1">Nhấn "+ Thêm chương" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map(ch => (
                <ChapterRow
                  key={ch._id}
                  chapter={ch}
                  courseId={id}
                  onRefresh={loadChapters}
                  isLocked={isLocked}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
