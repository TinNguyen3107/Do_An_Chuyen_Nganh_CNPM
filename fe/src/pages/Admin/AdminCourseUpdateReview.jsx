import { useEffect, useState, useRef, useCallback } from 'react';
import { adminCourseReviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── YouTube IFrame API: load once, shared across player instances ─────────────
const _ytReady = (() => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window._ytApiPromise) return window._ytApiPromise;
  window._ytApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  });
  return window._ytApiPromise;
})();

// ── Helper: extract YouTube video ID ─────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ── Helper: detect video type ─────────────────────────────────────────────────
function getVideoEmbed(url) {
  if (!url) return null;
  const ytId = getYouTubeId(url);
  if (ytId) return { type: 'youtube', id: ytId };
  const driveMatch = url.match(/(?:drive\.google\.com\/file\/d\/|id=)([A-Za-z0-9_-]+)/);
  if (driveMatch) return { type: 'iframe', src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return { type: 'video', src: url };
  return { type: 'iframe', src: url };
}

// ── Utility ───────────────────────────────────────────────────────────────────
const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// ── LMS Custom YouTube Player ─────────────────────────────────────────────────
function LMSVideoPlayer({ videoId, title }) {
  const playerDivRef  = useRef(null);
  const playerRef     = useRef(null);
  const wrapperRef    = useRef(null);
  const progressRef   = useRef(null);
  const hideTimer     = useRef(null);
  const tickTimer     = useRef(null);
  const idRef         = useRef(`yt-${Math.random().toString(36).slice(2, 8)}`);

  const [ready,        setReady]        = useState(false);
  const [playing,      setPlaying]      = useState(false);
  const [buffering,    setBuffering]    = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(80);
  const [muted,        setMuted]        = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed,        setSpeed]        = useState(1);
  const [showSpeed,    setShowSpeed]    = useState(false);
  const [isFs,         setIsFs]         = useState(false);

  useEffect(() => {
    let destroyed = false;
    _ytReady.then(() => {
      if (destroyed || !playerDivRef.current) return;
      playerRef.current = new window.YT.Player(idRef.current, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1, playsinline: 1, enablejsapi: 1, origin: window.location.origin },
        events: {
          onReady: (e) => { if (destroyed) return; e.target.setVolume(80); setDuration(e.target.getDuration()); setReady(true); },
          onStateChange: (e) => { if (destroyed) return; const S = window.YT.PlayerState; setPlaying(e.data === S.PLAYING); setBuffering(e.data === S.BUFFERING); if (e.data === S.ENDED) setPlaying(false); },
        },
      });
    });
    return () => { destroyed = true; clearInterval(tickTimer.current); clearTimeout(hideTimer.current); try { playerRef.current?.destroy(); } catch (_) {} };
  }, [videoId]);

  useEffect(() => {
    if (playing) { tickTimer.current = setInterval(() => { const p = playerRef.current; if (!p?.getCurrentTime) return; setCurrentTime(p.getCurrentTime()); if (!duration) setDuration(p.getDuration()); }, 300); }
    else { clearInterval(tickTimer.current); }
    return () => clearInterval(tickTimer.current);
  }, [playing, duration]);

  useEffect(() => { const h = () => setIsFs(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h); }, []);

  const resetHide = useCallback(() => { setShowControls(true); clearTimeout(hideTimer.current); if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000); }, [playing]);
  const togglePlay = () => { if (!ready) return; playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo(); resetHide(); };
  const seek = (e) => { if (!progressRef.current || !duration) return; const rect = progressRef.current.getBoundingClientRect(); const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); playerRef.current?.seekTo(ratio * duration, true); setCurrentTime(ratio * duration); };
  const changeVolume = (val) => { const v = Number(val); setVolume(v); playerRef.current?.setVolume(v); if (v === 0) { setMuted(true); playerRef.current?.mute(); } else { setMuted(false); playerRef.current?.unMute(); } };
  const toggleMute = () => { if (muted) { playerRef.current?.unMute(); playerRef.current?.setVolume(volume || 80); setMuted(false); } else { playerRef.current?.mute(); setMuted(true); } };
  const changeSpeed = (s) => { setSpeed(s); playerRef.current?.setPlaybackRate(s); setShowSpeed(false); };
  const toggleFs = () => { const el = wrapperRef.current; if (!document.fullscreenElement) el?.requestFullscreen?.(); else document.exitFullscreen?.(); };
  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={wrapperRef} className="relative bg-black rounded-xl overflow-hidden select-none" style={{ aspectRatio: '16/9', cursor: showControls ? 'default' : 'none' }} onMouseMove={resetHide} onMouseLeave={() => playing && setShowControls(false)}>
      <div ref={playerDivRef} id={idRef.current} className="w-full h-full" />
      {!ready && (<div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-3"><div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" /><p className="text-slate-500 text-xs">Đang tải video...</p></div>)}
      {buffering && ready && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" /></div>)}
      {ready && <div className="absolute inset-0" style={{ cursor: 'pointer' }} onClick={togglePlay} />}
      {ready && !playing && !buffering && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20"><svg className="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></div></div>)}
      <div className="absolute inset-x-0 bottom-0 transition-all duration-200" style={{ opacity: showControls ? 1 : 0, transform: showControls ? 'translateY(0)' : 'translateY(4px)', pointerEvents: showControls ? 'auto' : 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)', paddingTop: 40 }}>
        <div className="px-3 mb-2 group/bar"><div ref={progressRef} onClick={seek} className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative" style={{ height: 4 }}><div className="h-full bg-blue-500 rounded-full relative" style={{ width: `${pct}%`, transition: 'width 0.3s linear' }}><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity" style={{ transform: 'translate(50%,-50%)' }} /></div></div></div>
        <div className="flex items-center gap-1 px-3 pb-2.5">
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-white/10">{playing ? (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>) : (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>)}</button>
          <div className="flex items-center gap-1 group/vol">
            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-white/10">{muted || volume === 0 ? (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>) : (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>)}</button>
            <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={e => changeVolume(e.target.value)} className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-blue-500 cursor-pointer overflow-hidden" style={{ height: 4 }} />
          </div>
          <span className="text-white/70 text-xs font-mono ml-1 shrink-0">{fmt(currentTime)} / {fmt(duration)}</span>
          <span className="flex-1" />
          <div className="relative z-10">
            <button onClick={() => setShowSpeed(s => !s)} className="text-white/80 hover:text-white text-xs font-semibold px-2 py-1 rounded border border-white/20 hover:border-white/50 transition-colors">{speed}×</button>
            {showSpeed && (<div className="absolute bottom-full right-0 mb-1 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-2xl" style={{ minWidth: 120 }}><p className="text-xs text-slate-500 px-3 pt-2 pb-1 font-semibold uppercase tracking-wide">Tốc độ</p>{[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (<button key={s} onClick={() => changeSpeed(s)} className={`flex items-center justify-between w-full px-4 py-1.5 text-xs transition-colors ${speed === s ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><span>{s}×</span>{s === 1 && <span className="text-slate-500 text-[10px]">bình thường</span>}{speed === s && <span className="text-blue-300">✓</span>}</button>))}</div>)}
          </div>
          <button onClick={toggleFs} className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">{isFs ? (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 3 16 3 16 8"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>) : (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>)}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminCourseUpdateReview() {
  const [courses, setCourses]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal]           = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading]   = useState(false);
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [previewLesson, setPreviewLesson]   = useState(null);

  useEffect(() => { fetchCourses(); }, [page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await adminCourseReviewAPI.getPendingUpdates({ page, limit: 10 });
      setCourses(res.data.courses || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Lỗi khi tải danh sách cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (course) => {
    try {
      setLoading(true);
      const res = await adminCourseReviewAPI.getByIdForReview(course._id);
      setSelectedCourse(res.data.data);
      setRejectionReason('');
      setShowModal(true);
    } catch {
      toast.error('Lỗi khi tải chi tiết khoá học');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => { setShowModal(false); setSelectedCourse(null); setRejectionReason(''); };

  const handleApprove = async (courseId) => {
    if (!window.confirm('Duyệt bản cập nhật này?')) return;
    try {
      setActionLoading(true);
      await adminCourseReviewAPI.approve(courseId);
      toast.success('✅ Đã duyệt bản cập nhật!');
      closeModal(); fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi duyệt');
    } finally { setActionLoading(false); }
  };

  const handleReject = async (courseId) => {
    if (!rejectionReason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    if (!window.confirm('Từ chối bản cập nhật này?')) return;
    try {
      setActionLoading(true);
      await adminCourseReviewAPI.reject(courseId, rejectionReason);
      toast.success('Đã từ chối bản cập nhật');
      closeModal(); fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối');
    } finally { setActionLoading(false); }
  };

  // ── Helpers ──
  const levelLabel = (l) => ({ beginner: 'Người mới bắt đầu', intermediate: 'Trung cấp', advanced: 'Nâng cao', all: 'Tất cả cấp độ' }[l] || 'N/A');
  const totalLessons = (c) => c?.chapters?.reduce((a, ch) => a + (ch.lessons?.length || 0), 0) || 0;

  return (
    <div className="animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Duyệt Cập Nhật Khoá Học</h1>
        <p className="text-slate-400 text-sm">
          Các khoá học đã xuất bản được giảng viên gửi yêu cầu cập nhật nội dung
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <span className="text-blue-400 text-lg flex-shrink-0">🔄</span>
        <div>
          <p className="text-blue-400 font-semibold text-sm">Về "Duyệt cập nhật"</p>
          <p className="text-blue-300/70 text-xs mt-0.5">
            Các khoá học này đã từng được duyệt và xuất bản. Giảng viên vừa thêm/sửa/xoá nội dung và gửi lại
            để Admin xem xét trước khi cập nhật chính thức trên nền tảng.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-medium text-lg">Không có bản cập nhật nào chờ duyệt</p>
            <p className="text-sm mt-1 text-slate-600">Tất cả đã được xử lý!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Khoá học</th>
                    <th className="px-6 py-3 text-left">Giảng viên</th>
                    <th className="px-6 py-3 text-left">Duyệt lần trước</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map(course => (
                    <tr key={course._id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                            {course.thumbnail
                              ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-slate-600">📚</div>
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white group-hover:text-blue-400 transition line-clamp-1">{course.title}</p>
                              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold flex-shrink-0">🔄 CẬP NHẬT</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{course.category?.name || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300">{course.instructor?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{course.instructor?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        {course.reviewedAt ? (
                          <p className="text-xs text-slate-400">
                            {new Date(course.reviewedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetail(course)}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 rounded-lg transition-all text-sm"
                        >
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-slate-800">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal (2-column layout) ─────────────────────────────────────── */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto max-w-4xl w-full shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-start z-10">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-lg font-bold text-white">{selectedCourse.title}</h2>
                  <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
                    🔄 Cập nhật
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  <span>👤 Giảng viên: <span className="text-slate-300 font-medium">{selectedCourse.instructor?.name}</span></span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span>Danh mục: <span className="text-blue-400 font-medium">{selectedCourse.category?.name}</span></span>
                </p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition flex-shrink-0 mt-1">✕</button>
            </div>

            {/* Body: 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">

              {/* Left: Thumbnail + Update Context + Description */}
              <div className="p-6 space-y-5">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-800/50 aspect-video flex items-center justify-center">
                  {selectedCourse.thumbnail ? (
                    <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <span className="text-4xl">🎬</span>
                      <span className="text-xs">Chưa có ảnh bìa</span>
                    </div>
                  )}
                </div>

                {/* Update context */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 font-semibold text-xs uppercase tracking-wide mb-1">🔄 Bản cập nhật</p>
                  <p className="text-blue-300/80 text-xs">
                    Duyệt lần trước:{' '}
                    <span className="font-semibold text-blue-300">
                      {selectedCourse.reviewedAt
                        ? new Date(selectedCourse.reviewedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </p>
                  {selectedCourse.rejectionReason && (
                    <p className="text-xs text-slate-400 mt-1">
                      Từ chối trước: <span className="text-red-300 font-medium">{selectedCourse.rejectionReason}</span>
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Mô tả khoá học</h3>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedCourse.description || selectedCourse.shortDescription || 'Không có mô tả'}
                  </p>
                </div>
              </div>

              {/* Right: Price + Stats + Actions + Changed Lessons */}
              <div className="p-6 space-y-5">
                <p className="text-3xl font-extrabold text-blue-400">
                  {selectedCourse.price === 0 || selectedCourse.isFree ? 'Miễn phí' : `${Number(selectedCourse.price || 0).toLocaleString('vi-VN')}đ`}
                </p>

                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-sm py-1">
                    <span className="text-slate-400">📚 Tổng số bài học</span>
                    <span className="text-white font-semibold">{totalLessons(selectedCourse)} bài</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1">
                    <span className="text-slate-400">📶 Trình độ</span>
                    <span className="text-white font-semibold">{levelLabel(selectedCourse.level)}</span>
                  </div>
                </div>

                {selectedCourse.reviewStatus === 'pending' && (
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <div className="flex gap-3">
                      <button onClick={() => handleApprove(selectedCourse._id)} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50">
                        ✅ Duyệt cập nhật
                      </button>
                      <button onClick={() => handleReject(selectedCourse._id)} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-red-400 hover:text-red-300 font-semibold border border-red-500/40 hover:bg-red-500/10 rounded-xl transition disabled:opacity-50">
                        ✕ Từ chối
                      </button>
                    </div>
                    <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Lý do từ chối (bắt buộc khi từ chối)..." className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none text-sm" rows="3" />
                  </div>
                )}

                {/* Changed lessons only */}
                <div className="border-t border-slate-800 pt-4">
                  {(() => {
                    const reviewedAt = selectedCourse.reviewedAt ? new Date(selectedCourse.reviewedAt) : null;
                    let lessonCounter = 0;
                    const changedLessons = selectedCourse.chapters
                      ?.flatMap(ch => (ch.lessons || []).map(l => {
                        lessonCounter++;
                        const num = lessonCounter;
                        const lessonCreated = l.createdAt ? new Date(l.createdAt) : null;
                        const isNew = reviewedAt && lessonCreated && lessonCreated > reviewedAt;
                        const changeLabel = isNew
                          ? '🆕 Bài giảng mới'
                          : `Thay thế: Bài ${num}: ${l.title}`;
                        return { ...l, chapterTitle: ch.title, isNew, changeLabel, num };
                      }))
                      .filter(l => {
                        if (!reviewedAt) return true;
                        const lessonUpdated = l.updatedAt ? new Date(l.updatedAt) : null;
                        const lessonCreated = l.createdAt ? new Date(l.createdAt) : null;
                        return (lessonUpdated && lessonUpdated > reviewedAt) || (lessonCreated && lessonCreated > reviewedAt);
                      }) || [];
                    return (
                      <>
                        <h3 className="text-base font-bold text-white mb-4">
                          📋 Chi tiết thay đổi ({changedLessons.length} mục)
                        </h3>
                        {changedLessons.length > 0 ? (
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {changedLessons.map((lesson) => (
                              <button key={lesson._id} onClick={() => setPreviewLesson(lesson)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition text-left group">
                                <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm flex-shrink-0 ${lesson.type === 'video' ? 'bg-purple-500/15 text-purple-400' : lesson.type === 'quiz' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                                  {lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '?' : '📄'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition block truncate">Bài {lesson.num}: {lesson.title}</span>
                                  <span className={`text-xs ${lesson.isNew ? 'text-emerald-400' : 'text-slate-500'}`}>{lesson.changeLabel}</span>
                                </div>
                                <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0">Xem ▶</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm italic">Không phát hiện bài học thay đổi cụ thể. Có thể thay đổi nằm ở thông tin khoá học.</p>
                        )}
                      </>
                    );
                  })()}
                </div>

                {selectedCourse.reviewStatus !== 'pending' && (
                  <button onClick={closeModal} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition text-sm">Đóng</button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Lesson Preview Modal ── */}
      {previewLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800">
              <div className="flex items-center gap-4">
                <button onClick={() => setPreviewLesson(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-sm border border-slate-600">
                  ← Quay lại
                </button>
                <h3 className="text-base font-bold text-white flex items-center gap-2 border-l border-slate-600 pl-4">
                  {previewLesson.type === 'video' && <span>🎥</span>}
                  {previewLesson.type === 'text'  && <span>📝</span>}
                  {previewLesson.type === 'quiz'  && <span>❓</span>}
                  <span className="line-clamp-1">{previewLesson.title}</span>
                </h3>
              </div>
              <button onClick={() => setPreviewLesson(null)} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-700 rounded-lg">✕</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-6">
              {/* VIDEO */}
              {previewLesson.type === 'video' && (() => {
                const embed = getVideoEmbed(previewLesson.video_url);
                return (
                  <div className="w-full max-w-3xl mx-auto">
                    {embed?.type === 'youtube' && <LMSVideoPlayer key={embed.id} videoId={embed.id} title={previewLesson.title} />}
                    {embed?.type === 'iframe' && (
                      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                        <iframe key={embed.src} src={embed.src} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title={previewLesson.title} style={{ border: 'none' }} />
                      </div>
                    )}
                    {embed?.type === 'video' && (
                      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                        <video key={embed.src} src={embed.src} controls controlsList="nodownload" className="w-full h-full object-contain" />
                      </div>
                    )}
                    {!embed && (
                      <div className="aspect-video bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center"><span className="text-4xl">▶️</span></div>
                        <p className="text-slate-500 text-sm">Video chưa được cấu hình</p>
                      </div>
                    )}
                    <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tiêu đề bài học</p>
                      <p className="text-white font-semibold">{previewLesson.title}</p>
                      {previewLesson.duration > 0 && (
                        <p className="text-xs text-slate-400 mt-1">⏱ Thời lượng: {Math.floor(previewLesson.duration / 60)}:{String(previewLesson.duration % 60).padStart(2, '0')} phút</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TEXT */}
              {previewLesson.type === 'text' && (
                <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm min-h-64">
                  {previewLesson.text_content ? (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Nội dung bài đọc</p>
                      <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: previewLesson.text_content }} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
                      <span className="text-4xl">📝</span>
                      <p className="text-sm">Nội dung văn bản chưa được cập nhật.</p>
                    </div>
                  )}
                </div>
              )}

              {/* QUIZ */}
              {previewLesson.type === 'quiz' && (
                <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
                  {previewLesson.questions?.length > 0 ? (
                    <div className="space-y-8">
                      {previewLesson.questions.map((q, idx) => (
                        <div key={q._id || idx}>
                          <h4 className="text-base font-bold text-white mb-4">Câu hỏi {idx + 1}: {q.question}</h4>
                          <div className="space-y-2.5">
                            {q.options?.map((optText, oIdx) => (
                              <label key={oIdx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${oIdx === q.correctIndex ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                                <input type="radio" name={`quiz-${idx}`} className="w-4 h-4 accent-blue-500" readOnly />
                                <span className="text-sm text-slate-200">{optText}</span>
                                {oIdx === q.correctIndex && (
                                  <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">✓ Đáp án đúng</span>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
                      <span className="text-4xl">❓</span>
                      <p className="text-sm">Bài trắc nghiệm chưa có câu hỏi.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-500">Chế độ xem trước dành cho Quản trị viên</p>
              <button onClick={() => setPreviewLesson(null)} className="px-5 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors flex items-center gap-2 border border-slate-600">
                ← Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
