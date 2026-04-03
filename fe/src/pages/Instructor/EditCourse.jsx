import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { courseAPI, categoryAPI, chapterAPI, lessonAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>;
const IconSave       = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>;
const IconPlus       = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IconPlus5      = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IconTrash      = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const IconChevronUp  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>;
const IconChevronDn  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>;
const IconGrip       = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16"/></svg>;
const IconVideo      = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>;
const IconText       = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IconQuiz       = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'basic',      label: 'Thông tin cơ bản' },
  { key: 'thumbnail',  label: 'Ảnh bìa' },
  { key: 'curriculum', label: 'Chương trình giảng dạy' },
  { key: 'settings',   label: 'Cài đặt thêm' },
];

const LESSON_TYPE_CFG = {
  video: { icon: <IconVideo />, label: 'Video',    bubble: 'bg-blue-500/10    text-blue-400    border-blue-500/30'    },
  text:  { icon: <IconText />,  label: 'Bài đọc',  bubble: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  quiz:  { icon: <IconQuiz />,  label: 'Quiz',      bubble: 'bg-purple-500/10  text-purple-400  border-purple-500/30'  },
};

const inputCls = 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm';
const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5';

// ════════════════════════════════════════════════════════════════════════════
//  CURRICULUM TAB  — source-style inline UI with real API
// ════════════════════════════════════════════════════════════════════════════
function CurriculumTab({ courseId, reviewStatus }) {
  const [chapters,     setChapters]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState({});       // { chapterId: bool }
  const [editLessonId, setEditLessonId] = useState(null);     // lesson._id whose content editor is open
  const [saving,       setSaving]       = useState({});       // { key: bool }

  /* ── helpers ── */
  const setSav = (k, v) => setSaving(p => ({ ...p, [k]: v }));
  const toggle = (cId) => setExpanded(p => ({ ...p, [cId]: !p[cId] }));

  /* ── fetch ── */
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chapterAPI.getByCourse(courseId);
      const data = res.data.data || [];
      setChapters(data);
      // expand all by default
      const exp = {};
      data.forEach(c => { exp[c._id] = true; });
      setExpanded(exp);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetch(); }, [fetch]);

  /* ── chapter actions ── */
  const addChapter = async () => {
    try {
      await chapterAPI.create(courseId, { title: `Chương mới`, description: '' });
      fetch();
      if (reviewStatus === 'approved') toast('⚠ Nội dung thay đổi — hãy nhớ nhấn "Gửi duyệt cập nhật" để Admin xem xét!', { icon: '📋', duration: 5000 });
    } catch { toast.error('Lỗi khi thêm chương'); }
  };

  const saveChapterTitle = async (chapter) => {
    if (!chapter.title.trim()) return;
    setSav(`ch-${chapter._id}`, true);
    try { await chapterAPI.update(chapter._id, { title: chapter.title, description: chapter.description || '' }); }
    catch { toast.error('Lỗi lưu tên chương'); }
    finally { setSav(`ch-${chapter._id}`, false); }
  };

  const deleteChapter = async (cId) => {
    if (!window.confirm('Xoá chương này sẽ xoá toàn bộ bài học bên trong. Tiếp tục?')) return;
    try {
      await chapterAPI.delete(cId);
      fetch();
      if (reviewStatus === 'approved') toast('⚠ Nội dung thay đổi — hãy nhớ nhấn "Gửi duyệt cập nhật" để Admin xem xét!', { icon: '📋', duration: 5000 });
    } catch { toast.error('Lỗi khi xoá chương'); }
  };

  // local chapter title update (before blur-save)
  const updateChTitle = (cId, val) =>
    setChapters(cs => cs.map(c => c._id === cId ? { ...c, title: val } : c));

  /* ── lesson actions ── */
  const addLesson = async (chapterId, type) => {
    setSav(`add-${chapterId}-${type}`, true);
    try {
      const payload = {
        title: 'Bài học mới',
        type,
        ...(type === 'quiz'  && { questions: [] }),
        ...(type === 'video' && { video_url: '', duration: 0 }),
        ...(type === 'text'  && { text_content: '' }),
      };
      await lessonAPI.create(chapterId, payload);
      fetch();
      if (reviewStatus === 'approved') toast('⚠ Nội dung thay đổi — hãy nhớ nhấn "Gửi duyệt cập nhật" để Admin xem xét!', { icon: '📋', duration: 5000 });
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi khi thêm bài học'); }
    finally { setSav(`add-${chapterId}-${type}`, false); }
  };

  const saveLessonTitle = async (lesson, newTitle) => {
    if (!newTitle.trim() || newTitle === lesson.title) return;
    setSav(`lt-${lesson._id}`, true);
    try { await lessonAPI.update(lesson._id, { title: newTitle }); }
    catch { toast.error('Lỗi lưu tên bài'); }
    finally { setSav(`lt-${lesson._id}`, false); }
  };

  const saveLessonContent = async (lesson, patch) => {
    setSav(`lc-${lesson._id}`, true);
    try {
      await lessonAPI.update(lesson._id, { ...patch });
      toast.success('Đã lưu nội dung!');
      fetch();
    } catch { toast.error('Lỗi khi lưu nội dung'); }
    finally { setSav(`lc-${lesson._id}`, false); }
  };

  const deleteLesson = async (lId) => {
    if (!window.confirm('Xoá bài học này?')) return;
    try {
      await lessonAPI.delete(lId);
      fetch();
      if (reviewStatus === 'approved') toast('⚠ Nội dung thay đổi — hãy nhớ nhấn "Gửi duyệt cập nhật" để Admin xem xét!', { icon: '📋', duration: 5000 });
    } catch { toast.error('Lỗi khi xoá'); }
  };

  // ── Lesson content editor (inline, source-style) ──
  function LessonEditor({ lesson, chapterId }) {
    const [videoUrl,  setVideoUrl]  = useState(lesson.video_url  || '');
    const [duration,  setDuration]  = useState(lesson.duration   || '');
    const [content,   setContent]   = useState(lesson.text_content || '');
    const [questions, setQuestions] = useState(
      lesson.questions?.length ? lesson.questions
      : [{ question: '', options: ['', '', '', ''], correctIndex: 0 }]
    );

    const addQ  = () => setQuestions(q => [...q, { question: '', options: ['', '', '', ''], correctIndex: 0 }]);
    const remQ  = (i) => setQuestions(q => q.filter((_, j) => j !== i));
    const updQ  = (i, f, v) => setQuestions(q => q.map((x, j) => j === i ? { ...x, [f]: v } : x));
    const updOpt = (qi, oi, v) => setQuestions(q => q.map((x, j) => j === qi ? { ...x, options: x.options.map((o, k) => k === oi ? v : o) } : x));

    const save = () => {
      const patch = lesson.type === 'video'
        ? { video_url: videoUrl, duration: Number(duration) || 0 }
        : lesson.type === 'text'
        ? { text_content: content }
        : { questions };
      saveLessonContent(lesson, patch);
      setEditLessonId(null);
    };

    return (
      <div className="px-5 pb-4 pt-3 border-t border-slate-700/50 bg-slate-800/20">
        {lesson.type === 'video' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">URL Video (YouTube / link trực tiếp)</label>
              <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Thời lượng (phút)</label>
              <input type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="0"
                className="w-40 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
        )}
        {lesson.type === 'text' && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Nội dung bài đọc</label>
            <textarea rows={7} value={content} onChange={e => setContent(e.target.value)}
              placeholder="<h2>Tiêu đề</h2><p>Nội dung...</p>"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500 text-sm resize-y font-mono" />
          </div>
        )}
        {lesson.type === 'quiz' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Danh sách câu hỏi</span>
              <button type="button" onClick={addQ} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"><IconPlus /> Thêm câu hỏi</button>
            </div>
            {questions.map((q, qi) => (
              <div key={qi} className="bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded shrink-0">Q{qi + 1}</span>
                  <input className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                    value={q.question} onChange={e => updQ(qi, 'question', e.target.value)} placeholder="Nhập câu hỏi..." />
                  {questions.length > 1 && (
                    <button type="button" onClick={() => remQ(qi)} className="text-slate-500 hover:text-red-400 shrink-0"><IconTrash /></button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button type="button" onClick={() => updQ(qi, 'correctIndex', oi)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${q.correctIndex === oi ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600 hover:border-emerald-500/50'}`}>
                        {q.correctIndex === oi && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                      <input className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-2 py-1 text-xs outline-none"
                        value={opt} onChange={e => updOpt(qi, oi, e.target.value)} placeholder={`Đáp án ${oi + 1}`} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 pl-2">● Nhấn vòng tròn để chọn đáp án đúng</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => setEditLessonId(null)}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors">
            Đóng
          </button>
          <button onClick={save} disabled={saving[`lc-${lesson._id}`]}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-60">
            {saving[`lc-${lesson._id}`] ? 'Đang lưu...' : 'Lưu nội dung'}
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Nội dung khoá học</h3>
          <p className="text-slate-500 text-xs mt-0.5">Thay đổi được lưu ngay lập tức vào hệ thống</p>
        </div>
        <button onClick={addChapter}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-xl transition-colors text-sm">
          <IconPlus5 /> Thêm chương
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && chapters.length === 0 && (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 border-dashed rounded-2xl">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-semibold text-slate-300 mb-1">Chưa có chương nào</p>
          <p className="text-sm text-slate-500 mb-4">Nhấn "Thêm chương" để bắt đầu xây dựng nội dung khoá học</p>
          <button onClick={addChapter}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-colors">
            + Thêm chương đầu tiên
          </button>
        </div>
      )}

      {/* Chapters */}
      <div className="space-y-3">
        {chapters.map((ch, chIdx) => (
          <div key={ch._id} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-900">

            {/* Chapter header — source style */}
            <div className="flex items-center gap-3 p-4 bg-slate-800/60">
              <span className="text-slate-600 cursor-move shrink-0"><IconGrip /></span>
              <span className="text-slate-400 text-sm font-bold shrink-0">Chương {chIdx + 1}:</span>
              {/* Editable title inline */}
              <input
                type="text"
                value={ch.title.includes(': ') ? ch.title.split(': ').slice(1).join(': ') : ch.title}
                onChange={e => updateChTitle(ch._id, `Chương ${chIdx + 1}: ${e.target.value}`)}
                onBlur={() => saveChapterTitle(ch)}
                className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-white font-semibold text-sm placeholder-slate-500"
                placeholder="Tên chương..."
              />
              {saving[`ch-${ch._id}`] && <span className="text-xs text-slate-500 shrink-0">Đang lưu...</span>}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => deleteChapter(ch._id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <IconTrash />
                </button>
                <button onClick={() => toggle(ch._id)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  {expanded[ch._id] ? <IconChevronUp /> : <IconChevronDn />}
                </button>
              </div>
            </div>

            {/* Lessons */}
            {expanded[ch._id] && (
              <div className="divide-y divide-slate-800/50">
                {(!ch.lessons || ch.lessons.length === 0) && (
                  <p className="text-center text-xs text-slate-600 py-4">Chưa có bài học trong chương này</p>
                )}

                {(ch.lessons || []).map((lesson, lIdx) => {
                  const tcfg = LESSON_TYPE_CFG[lesson.type] || LESSON_TYPE_CFG.video;
                  const isEditing = editLessonId === lesson._id;

                  return (
                    <div key={lesson._id}>
                      {/* Lesson row */}
                      <div className={`flex items-center gap-3 px-4 py-3 ${isEditing ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'} transition-colors`}>
                        <span className="text-slate-700 cursor-move shrink-0"><IconGrip /></span>
                        {/* Type icon */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${tcfg.bubble}`}>
                          {tcfg.icon}
                        </div>
                        <span className="text-slate-500 text-xs shrink-0">Bài {lIdx + 1}:</span>
                        {/* Editable lesson title */}
                        <input
                          type="text"
                          defaultValue={lesson.title}
                          onBlur={e => saveLessonTitle(lesson, e.target.value)}
                          className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-sm text-white placeholder-slate-500"
                          placeholder="Tên bài học..."
                        />
                        {saving[`lt-${lesson._id}`] && <span className="text-xs text-slate-600 shrink-0">...</span>}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditLessonId(isEditing ? null : lesson._id)}
                            className={`text-xs font-medium px-2.5 py-1 border rounded-lg transition-colors ${isEditing ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                            {isEditing ? 'Đóng' : 'Nội dung'}
                          </button>
                          <button onClick={() => deleteLesson(lesson._id)}
                            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <IconTrash />
                          </button>
                        </div>
                      </div>

                      {/* Inline content editor */}
                      {isEditing && <LessonEditor lesson={lesson} chapterId={ch._id} />}
                    </div>
                  );
                })}

                {/* Add lesson buttons — source style */}
                <div className="flex items-center gap-2 px-4 py-3">
                  {[
                    { type: 'video', label: 'Video',    cls: 'text-blue-400    bg-blue-500/10    hover:bg-blue-500/20    border-blue-500/20'    },
                    { type: 'text',  label: 'Bài đọc',  cls: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' },
                    { type: 'quiz',  label: 'Quiz',     cls: 'text-purple-400  bg-purple-500/10  hover:bg-purple-500/20  border-purple-500/20'  },
                  ].map(({ type, label, cls }) => (
                    <button key={type}
                      onClick={() => addLesson(ch._id, type)}
                      disabled={saving[`add-${ch._id}-${type}`]}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-60 ${cls}`}>
                      <IconPlus /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN EditCourse page
// ════════════════════════════════════════════════════════════════════════════
export default function EditCourse() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();

  const initialTab = TABS.some(t => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'basic';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving,  setSaving]        = useState(false);
  const [thumbnail, setThumbnail]   = useState(null);
  const [preview,   setPreview]     = useState('');
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '',
    category: '', price: 0, level: 'all', language: 'Tiếng Việt',
    requirements: [''], objectives: [''], tags: '', status: 'draft',
  });
  // Trạng thái duyệt — tách riêng để không gửi lên backend khi save
  const [courseData, setCourseData] = useState({ reviewStatus: 'pending', rejectionReason: '', submittedAt: null });

  useEffect(() => {
    Promise.all([courseAPI.getById(id), categoryAPI.getAll()])
      .then(([cRes, catRes]) => {
        const c = cRes.data.data;
        setForm({
          title: c.title || '', description: c.description || '',
          shortDescription: c.shortDescription || '',
          category: c.category?._id || c.category || '',
          price: c.price || 0, level: c.level || 'all',
          language: c.language || 'Tiếng Việt',
          requirements: c.requirements?.length ? c.requirements : [''],
          objectives:   c.objectives?.length   ? c.objectives   : [''],
          tags: c.tags?.join(', ') || '', status: c.status,
        });
        setCourseData({
          reviewStatus: c.reviewStatus || 'pending',
          rejectionReason: c.rejectionReason || '',
          submittedAt: c.submittedAt || null,
        });
        setPreview(c.thumbnail || '');
        setCategories(catRes.data.data || []);
      })
      .catch(() => { toast.error('Không thể tải khoá học'); navigate('/instructor/dashboard'); })
      .finally(() => setLoading(false));
  }, [id]);

  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleList = (k, i, v) => { const a = [...form[k]]; a[i] = v; set(k, a); };
  const addItem    = (k) => set(k, [...form[k], '']);
  const remItem    = (k, i) => set(k, form[k].filter((_, j) => j !== i));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      toast.error('Vui lòng điền Tiêu đề, Mô tả và Danh mục');
      setActiveTab('basic'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      ['title','description','shortDescription','price','level','language'].forEach(k => fd.append(k, form[k]));
      fd.append('category', form.category);
      fd.append('requirements', JSON.stringify(form.requirements.filter(r => r.trim())));
      fd.append('objectives',   JSON.stringify(form.objectives.filter(o => o.trim())));
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      await courseAPI.update(id, fd);
      toast.success('💾 Cập nhật thành công!');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi khi lưu'); }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    const label = courseData.reviewStatus === 'rejected' ? 'duyệt lại'
      : courseData.reviewStatus === 'approved' ? 'duyệt cập nhật' : 'duyệt';
    if (!window.confirm(`Gửi khoá học này để Admin xem xét và ${label}?`)) return;
    try {
      const res = await courseAPI.submit(id);
      toast.success(res.data.message || '🎉 Đã gửi duyệt thành công!');
      navigate('/instructor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi duyệt');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-slate-800 rounded w-1/3" />
      <div className="h-64 bg-slate-800 rounded-2xl" />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <IconArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Chỉnh sửa Khoá học</h1>
            <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded text-xs font-bold border ${
              form.status === 'draft'
                ? 'border-slate-600 bg-slate-700 text-slate-400'
                : courseData.reviewStatus === 'pending' && courseData.submittedAt
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : courseData.reviewStatus === 'rejected'
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : courseData.reviewStatus === 'approved'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-600 bg-slate-700 text-slate-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {form.status === 'draft'
                ? 'Bản nháp'
                : courseData.reviewStatus === 'pending' && courseData.submittedAt
                  ? 'Chờ duyệt'
                  : courseData.reviewStatus === 'rejected'
                    ? 'Bị từ chối'
                    : courseData.reviewStatus === 'approved'
                      ? 'Đã xuất bản'
                      : 'Chưa gửi duyệt'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab !== 'curriculum' && !(courseData.reviewStatus === 'pending' && courseData.submittedAt) && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/25 text-sm disabled:opacity-60">
              <IconSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          )}
          {(courseData.reviewStatus === 'approved' || courseData.reviewStatus === 'rejected' ||
            (courseData.reviewStatus === 'pending' && !courseData.submittedAt)) && (
            <button onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 text-sm">
              🚀 {courseData.reviewStatus === 'rejected' ? 'Gửi duyệt lại' : courseData.reviewStatus === 'approved' ? 'Gửi duyệt cập nhật' : 'Gửi duyệt'}
            </button>
          )}
        </div>
      </div>

      {/* ── Status banners ── */}
      {courseData.reviewStatus === 'pending' && courseData.submittedAt && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <span className="text-amber-400 text-lg flex-shrink-0">⏳</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">Đang chờ Admin duyệt</p>
            <p className="text-amber-300/70 text-xs mt-0.5">Bạn không thể chỉnh sửa thông tin khoá học trong thời gian này. Vui lòng chờ kết quả từ Admin.</p>
          </div>
        </div>
      )}
      {courseData.reviewStatus === 'rejected' && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <span className="text-red-400 text-lg flex-shrink-0">❌</span>
          <div className="min-w-0">
            <p className="text-red-400 font-semibold text-sm">Khoá học bị từ chối duyệt</p>
            {courseData.rejectionReason && (
              <p className="text-red-300/80 text-xs mt-0.5">Lý do: <span className="font-medium">{courseData.rejectionReason}</span></p>
            )}
            <p className="text-slate-400 text-xs mt-1.5">Hãy chỉnh sửa theo yêu cầu rồi nhấn “Gửi duyệt lại”.</p>
          </div>
        </div>
      )}
      {courseData.reviewStatus === 'approved' && (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <span className="text-emerald-400 flex-shrink-0">✅</span>
          <p className="text-emerald-400/80 text-xs flex-1">Khoá học đã được duyệt và công khai. Sau khi chỉnh sửa, nhấn <span className="font-semibold text-emerald-400">Gửi duyệt cập nhật</span> để Admin xem xét thay đổi.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.key ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content card (not for curriculum) */}
      <div className={activeTab !== 'curriculum' ? 'bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8' : ''}>

        {/* ── Thông tin cơ bản ─── */}
        {activeTab === 'basic' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <label className={labelCls}>Tiêu đề khoá học *</label>
              <input type="text" className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Mô tả ngắn</label>
              <input type="text" className={inputCls} value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Mô tả chi tiết *</label>
              <textarea rows={4} className={`${inputCls} resize-none`} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Danh mục *</label>
                <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Giá (VNĐ)</label>
                <input type="number" min="0" className={inputCls} value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Cấp độ</label>
                <select className={inputCls} value={form.level} onChange={e => set('level', e.target.value)}>
                  <option value="all">Tất cả</option>
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
            <div>
              <label className={labelCls}>🎯 Mục tiêu học tập</label>
              <div className="space-y-2">
                {form.objectives.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={inputCls} value={o} onChange={e => handleList('objectives', i, e.target.value)} placeholder={`Mục tiêu ${i + 1}...`} />
                    {form.objectives.length > 1 && <button onClick={() => remItem('objectives', i)} className="p-2 text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all"><IconTrash /></button>}
                  </div>
                ))}
              </div>
              <button onClick={() => addItem('objectives')} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><IconPlus /> Thêm mục tiêu</button>
            </div>
            <div>
              <label className={labelCls}>📋 Yêu cầu đầu vào</label>
              <div className="space-y-2">
                {form.requirements.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={inputCls} value={r} onChange={e => handleList('requirements', i, e.target.value)} placeholder={`Yêu cầu ${i + 1}...`} />
                    {form.requirements.length > 1 && <button onClick={() => remItem('requirements', i)} className="p-2 text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all"><IconTrash /></button>}
                  </div>
                ))}
              </div>
              <button onClick={() => addItem('requirements')} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><IconPlus /> Thêm yêu cầu</button>
            </div>
            <div>
              <label className={labelCls}>🏷️ Tags</label>
              <input type="text" className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="react, javascript (ngăn cách bằng dấu phẩy)" />
            </div>
          </div>
        )}

        {/* ── Ảnh bìa ─── */}
        {activeTab === 'thumbnail' && (
          <div className="max-w-xl">
            <p className="text-slate-400 text-sm mb-5">Ảnh bìa hiện tại. Nhấn để thay đổi (PNG/JPG · 16:9 · tối đa 5MB).</p>
            <div onClick={() => document.getElementById('edit-thumb').click()}
              className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all">
              <input id="edit-thumb" type="file" accept="image/*" className="hidden" onChange={handleFile} />
              {preview ? (
                <div className="relative aspect-video">
                  <img src={preview} alt="Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">Nhấn để thay đổi ảnh</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-3 text-slate-500">
                  <span className="text-3xl">🖼️</span>
                  <p className="text-sm">Nhấn để chọn ảnh bìa</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Chương trình giảng dạy ─── SOURCE STYLE ─── */}
        {activeTab === 'curriculum' && <CurriculumTab courseId={id} reviewStatus={courseData.reviewStatus} />}

        {/* ── Cài đặt thêm ─── */}
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

      {/* Bottom bar for info tabs */}
      {activeTab !== 'curriculum' && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-5">
          <button onClick={() => navigate('/instructor/dashboard')} className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Về dashboard
          </button>
          <div className="flex items-center gap-2">
            {!(courseData.reviewStatus === 'pending' && courseData.submittedAt) && (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm disabled:opacity-60">
                <IconSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            )}
            {(courseData.reviewStatus === 'approved' || courseData.reviewStatus === 'rejected' ||
              (courseData.reviewStatus === 'pending' && !courseData.submittedAt)) && (
              <button onClick={handleSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 text-sm">
                🚀 {courseData.reviewStatus === 'rejected' ? 'Gửi duyệt lại' : courseData.reviewStatus === 'approved' ? 'Gửi duyệt cập nhật' : 'Gửi duyệt'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
