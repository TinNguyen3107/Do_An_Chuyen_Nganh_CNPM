import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// ── YouTube IFrame API: load once ─────────────────────────────────────────────
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

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// ── LMS Custom YouTube Player — hoàn toàn ẩn YouTube branding ────────────────
function LMSVideoPlayer({ videoId, onWatchComplete, alreadyCompleted = false }) {
  const playerDivRef = useRef(null);
  const playerRef    = useRef(null);
  const wrapperRef   = useRef(null);
  const progressRef  = useRef(null);
  const hideTimer    = useRef(null);
  const tickTimer    = useRef(null);
  const reportedRef      = useRef(false);
  const watchedSecsRef   = useRef(0);     // tích lũy giây xem THỰC TẾ khi đang play
  const maxReachedRef    = useRef(0);     // giây xa nhất đã xem thực tế → giới hạn seek
  const seekWarnTimerRef = useRef(null);
  const idRef            = useRef(`yt-${Math.random().toString(36).slice(2, 8)}`);

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
  const [isFs,          setIsFs]          = useState(false);
  const [showSeekWarn,  setShowSeekWarn]  = useState(false); // cảnh báo tua quá 5s

  useEffect(() => {
    let destroyed = false;
    reportedRef.current = false;
    _ytReady.then(() => {
      if (destroyed || !playerDivRef.current) return;
      playerRef.current = new window.YT.Player(idRef.current, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1, playsinline: 1, enablejsapi: 1, origin: window.location.origin },
        events: {
          onReady: (e) => { if (destroyed) return; e.target.setVolume(80); setDuration(e.target.getDuration()); setReady(true); },
          onStateChange: (e) => {
            if (destroyed) return;
            const S = window.YT.PlayerState;
            setPlaying(e.data === S.PLAYING);
            setBuffering(e.data === S.BUFFERING);
            if (e.data === S.ENDED) setPlaying(false);
          },
        },
      });
    });
    return () => {
      destroyed = true;
      watchedSecsRef.current = 0;   // reset khi chuyển video
      maxReachedRef.current  = 0;   // reset giới hạn seek
      reportedRef.current    = false;
      clearInterval(tickTimer.current);
      clearTimeout(hideTimer.current);
      clearTimeout(seekWarnTimerRef.current);
      try { playerRef.current?.destroy(); } catch (_) {}
    };
  }, [videoId]);

  // Progress tick + tracking 50% real watch time
  useEffect(() => {
    if (playing) {
      tickTimer.current = setInterval(() => {
        const p = playerRef.current;
        if (!p?.getCurrentTime) return;
        const ct = p.getCurrentTime();
        setCurrentTime(ct);
        if (!duration) setDuration(p.getDuration());
        // Tích lũy thời gian xem thực tế — 0.3s/tick khi đang play
        watchedSecsRef.current += 0.3;
        // Cập nhật điểm xa nhất đã xem (dùng để giới hạn seek)
        if (ct > maxReachedRef.current) maxReachedRef.current = ct;
        const dur = p.getDuration() || 0;
        if (dur > 0 && watchedSecsRef.current / dur >= 0.5 && !reportedRef.current) {
          reportedRef.current = true;
          onWatchComplete?.();
        }
      }, 300);
    } else {
      clearInterval(tickTimer.current);
    }
    return () => clearInterval(tickTimer.current);
  }, [playing, duration, onWatchComplete]);

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const resetHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, [playing]);

  const togglePlay = () => { if (!ready) return; playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo(); resetHide(); };
  const seek = (e) => {
    if (!progressRef.current || !duration) return;
    const rect       = progressRef.current.getBoundingClientRect();
    const ratio      = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = ratio * duration;

    // Nếu đã hoàn thành video → cho phép tua tự do
    const isDone = alreadyCompleted || reportedRef.current;
    if (!isDone) {
      const maxAllowed = maxReachedRef.current + 5;
      if (targetTime > maxAllowed) {
        const snapTo = Math.min(maxAllowed, duration);
        playerRef.current?.seekTo(snapTo, true);
        setCurrentTime(snapTo);
        setShowSeekWarn(true);
        clearTimeout(seekWarnTimerRef.current);
        seekWarnTimerRef.current = setTimeout(() => setShowSeekWarn(false), 2500);
        return;
      }
    }

    playerRef.current?.seekTo(targetTime, true);
    setCurrentTime(targetTime);
  };
  const changeVolume = (val) => { const v = Number(val); setVolume(v); playerRef.current?.setVolume(v); if (v === 0) { setMuted(true); playerRef.current?.mute(); } else { setMuted(false); playerRef.current?.unMute(); } };
  const toggleMute   = () => { if (muted) { playerRef.current?.unMute(); playerRef.current?.setVolume(volume || 80); setMuted(false); } else { playerRef.current?.mute(); setMuted(true); } };
  const changeSpeed  = (s) => { setSpeed(s); playerRef.current?.setPlaybackRate(s); setShowSpeed(false); };
  const toggleFs     = () => { const el = wrapperRef.current; if (!document.fullscreenElement) el?.requestFullscreen?.(); else document.exitFullscreen?.(); };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={wrapperRef}
      className="relative bg-black rounded-xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9', cursor: showControls ? 'default' : 'none' }}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <div ref={playerDivRef} id={idRef.current} className="w-full h-full" />

      {/* Cảnh báo tua quá 5s */}
      {showSeekWarn && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl pointer-events-none">
          <span>⚠️</span>
          <span>Không thể tua qua phần chưa xem!</span>
        </div>
      )}

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 text-xs">Đang tải video...</p>
        </div>
      )}

      {/* Buffering */}
      {buffering && ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Click to play/pause */}
      {ready && <div className="absolute inset-0" style={{ cursor: 'pointer' }} onClick={togglePlay} />}

      {/* Center play icon */}
      {ready && !playing && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <svg className="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute inset-x-0 bottom-0 transition-all duration-200"
        style={{ opacity: showControls ? 1 : 0, transform: showControls ? 'translateY(0)' : 'translateY(4px)', pointerEvents: showControls ? 'auto' : 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)', paddingTop: 40 }}
      >
        {/* Progress bar */}
        <div className="px-3 mb-2 group/bar">
          <div ref={progressRef} onClick={seek} className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative" style={{ height: 4 }}>
            <div className="h-full bg-blue-500 rounded-full relative" style={{ width: `${pct}%`, transition: 'width 0.3s linear' }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity" style={{ transform: 'translate(50%,-50%)' }} />
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1 px-3 pb-2.5">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-white/10">
            {playing
              ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            }
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1 group/vol">
            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-white/10">
              {muted || volume === 0
                ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              }
            </button>
            <input type="range" min="0" max="100" value={muted ? 0 : volume}
              onChange={e => changeVolume(e.target.value)}
              className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-blue-500 cursor-pointer overflow-hidden"
              style={{ height: 4 }}
            />
          </div>

          {/* Time */}
          <span className="text-white/70 text-xs font-mono ml-1 shrink-0">{fmt(currentTime)} / {fmt(duration)}</span>
          <span className="flex-1" />

          {/* Speed */}
          <div className="relative z-10">
            <button onClick={() => setShowSpeed(s => !s)} className="text-white/80 hover:text-white text-xs font-semibold px-2 py-1 rounded border border-white/20 hover:border-white/50 transition-colors">
              {speed}×
            </button>
            {showSpeed && (
              <div className="absolute bottom-full right-0 mb-1 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-2xl" style={{ minWidth: 120 }}>
                <p className="text-xs text-slate-500 px-3 pt-2 pb-1 font-semibold uppercase tracking-wide">Tốc độ</p>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                  <button key={s} onClick={() => changeSpeed(s)}
                    className={`flex items-center justify-between w-full px-4 py-1.5 text-xs transition-colors ${speed === s ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <span>{s}×</span>
                    {s === 1 && <span className="text-slate-500 text-[10px]">bình thường</span>}
                    {speed === s && <span className="text-blue-300">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFs} className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
            {isFs
              ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 3 16 3 16 8"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>
              : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quiz Section Component ────────────────────────────────────────────────────
function QuizSection({ lesson, courseId, getAuthConfig, alreadyDone, onComplete }) {
  const [answers, setAnswers]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]         = useState(0);
  const [retrying, setRetrying]   = useState(false); // override alreadyDone

  const questions = lesson.questions || [];

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctIndex) correct++; });
    setScore(correct);
    setSubmitted(true);
    setRetrying(false);
    if (correct === questions.length) {
      onComplete?.();
      try {
        await axios.post(
          `http://localhost:5000/api/progress/course/${courseId}/lesson/${lesson._id}/quiz`,
          {},
          getAuthConfig()
        );
      } catch (err) {
        console.error('Quiz progress error:', err);
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setRetrying(true); // bật cờ → hiển thị quiz dù alreadyDone = true
  };

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  // Hiện màn "Đã hoàn thành" chỉ khi done & KHÔNG đang retry
  if (alreadyDone && !submitted && !retrying) {
    return (
      <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
        <p className="text-emerald-400 font-semibold text-lg">✅ Bạn đã hoàn thành bài quiz này!</p>
        <button onClick={handleRetry} className="mt-3 text-xs text-slate-400 hover:text-white underline">
          Làm lại quiz
        </button>
      </div>
    );
  }


  return (
    <div className="mb-5 space-y-5">
      <h3 className="font-semibold text-lg">📝 Bài kiểm tra</h3>

      {questions.map((q, qIdx) => {
        const chosen   = answers[qIdx];
        const isRight  = submitted && chosen === q.correctIndex;
        const isWrong  = submitted && chosen !== undefined && chosen !== q.correctIndex;

        return (
          <div key={qIdx} className={`bg-slate-800 rounded-xl p-4 border transition-colors ${
            isRight ? 'border-emerald-500/40' : isWrong ? 'border-red-500/40' : 'border-slate-700'
          }`}>
            <p className="font-medium text-sm mb-3 text-slate-200">
              {qIdx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => {
                const isChosen  = chosen === oIdx;
                const isCorrect = oIdx === q.correctIndex;

                let style = 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50';
                if (submitted) {
                  if (isChosen && isCorrect) {
                    // Chọn đúng → xanh
                    style = 'border-emerald-500 bg-emerald-500/15 text-emerald-300';
                  } else if (isChosen && !isCorrect) {
                    // Chọn sai → đỏ (KHÔNG reveal đáp án đúng)
                    style = 'border-red-500 bg-red-500/15 text-red-300';
                  } else {
                    // Không chọn → mờ đi, giữ bí mật đáp án
                    style = 'border-slate-700 text-slate-600 opacity-60';
                  }
                } else if (isChosen) {
                  style = 'border-blue-500 bg-blue-500/15 text-blue-300';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, oIdx)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${style} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                    {opt}
                    {submitted && isChosen && isCorrect  && <span className="float-right text-emerald-400">✓</span>}
                    {submitted && isChosen && !isCorrect && <span className="float-right text-red-400">✗</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Submit / Result */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Nộp bài ({Object.keys(answers).length}/{questions.length} câu đã trả lời)
        </button>
      ) : (
        <div className={`rounded-xl p-4 text-center border ${
          score === questions.length
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <p className="text-xl font-bold">{score === questions.length ? '🎉 Xuất sắc!' : '📊 Kết quả'}</p>
          <p className="text-sm mt-1">Đúng {score}/{questions.length} câu</p>
          {score < questions.length && (
            <button onClick={handleRetry} className="mt-3 px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
              Làm lại
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LearningPage() {
  const { courseId } = useParams();

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');

  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [textDoneMap, setTextDoneMap] = useState({});
  const [videoDoneMap, setVideoDoneMap] = useState({});
  const [showHtmlSeekWarn, setShowHtmlSeekWarn] = useState(false); // cảnh báo tua HTML5

  const textTimerRef        = useRef(null);
  const videoReportedRef    = useRef({});     // đã báo cáo video lesson nào rồi
  const videoWatchedSecsRef = useRef({});     // giây xem thực tế của từng lesson (HTML5)
  const videoLastTimeRef    = useRef({});     // vị trí cuối để tính delta (HTML5)
  const videoMaxReachedRef  = useRef({});     // điểm xa nhất đã xem (HTML5) → giới hạn seek
  const htmlSeekWarnTimer   = useRef(null);
  // Refs luôn giữ giá trị mới nhất → tránh stale closure trong callbacks
  const videoDoneMapRef     = useRef({});
  const textDoneMapRef      = useRef({});

  const getAuthConfig = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('accessToken');

    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    };
  };

  const markLessonCompletedLocal = (lessonId) => {
    // Bug 5: normalize về string để includes() so sánh đúng
    const id = lessonId?.toString();
    setCompletedLessonIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        `http://localhost:5000/api/learning/course/${courseId}`,
        getAuthConfig()
      );

      const lessonData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.lessons)
        ? res.data.lessons
        : [];

      setLessons(lessonData);

      if (lessonData.length > 0) {
        setCurrentLesson((prev) => {
          if (!prev) return lessonData[0];
          const stillExists = lessonData.find((l) => l._id === prev._id);
          return stillExists || lessonData[0];
        });
      } else {
        setCurrentLesson(null);
      }
    } catch (err) {
      console.error('Fetch lessons error:', err);
      setError(
        err.response?.data?.message || 'Không thể tải danh sách bài học'
      );
      setLessons([]);
      setCurrentLesson(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (lessonList = []) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/progress/course/${courseId}`,
        getAuthConfig()
      );

      const items = Array.isArray(res.data?.data) ? res.data.data : [];

      const nextTextDoneMap = {};
      const nextVideoDoneMap = {};
      const nextCompletedLessonIds = [];

      items.forEach((item) => {
        // Bug 5: normalize lessonId về string
        const lessonId =
          typeof item.lesson === 'object' && item.lesson !== null
            ? item.lesson._id?.toString()
            : item.lesson?.toString();

        if (!lessonId) return;

        if (item.isTextCompleted)  nextTextDoneMap[lessonId]  = true;
        if (item.isVideoCompleted) nextVideoDoneMap[lessonId] = true;
        if (item.isCompleted)      nextCompletedLessonIds.push(lessonId);
      });

      // Suy ra completion cục bộ: chỉ áp dụng cho video/text, KHÔNG áp dụng quiz
      // Bug 1: quiz có videoUrl='' và textContent='' → tránh auto-complete oan
      lessonList.forEach((lesson) => {
        if (lesson.type === 'quiz') return; // quiz chỉ mark done qua /quiz endpoint
        const lid = lesson._id?.toString();
        if (!lid) return;
        const textOk  = !lesson.textContent || nextTextDoneMap[lid];
        const videoOk = !lesson.videoUrl    || nextVideoDoneMap[lid];
        if (textOk && videoOk && !nextCompletedLessonIds.includes(lid)) {
          nextCompletedLessonIds.push(lid);
        }
      });

      setTextDoneMap(nextTextDoneMap);
      setVideoDoneMap(nextVideoDoneMap);
      setCompletedLessonIds(nextCompletedLessonIds);
    } catch (err) {
      console.error('Fetch progress error:', err);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      // Fetch course name
      try {
        const res = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`,
          getAuthConfig()
        );
        const name = res.data?.data?.title || res.data?.title || '';
        if (name) setCourseName(name);
      } catch {}

      // Fetch lessons then progress
      let lessonList = [];
      try {
        const res = await axios.get(
          `http://localhost:5000/api/learning/course/${courseId}`,
          getAuthConfig()
        );
        lessonList = Array.isArray(res.data) ? res.data
          : Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data?.lessons) ? res.data.lessons : [];
        setLessons(lessonList);
        setCurrentLesson(prev => prev
          ? (lessonList.find(l => l._id === prev._id) || lessonList[0] || null)
          : (lessonList[0] || null));
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách bài học');
      } finally {
        setLoading(false);
      }

      await fetchProgress(lessonList);
    };

    initPage();

    return () => { if (textTimerRef.current) clearTimeout(textTimerRef.current); };
  }, [courseId]);

  // Bug 3: useCallback + đọc từ ref thay vì closure để tránh stale state
  const reportTextProgress = useCallback(async (lesson) => {
    try {
      await axios.post(
        `http://localhost:5000/api/progress/course/${courseId}/lesson/${lesson._id}/text`,
        { textReadSeconds: 10 },
        getAuthConfig()
      );

      setTextDoneMap((prev) => ({ ...prev, [lesson._id]: true }));

      const hasVideo = !!lesson.videoUrl;
      // Đọc từ ref để luôn có giá trị mới nhất, tránh stale closure
      if (!hasVideo || videoDoneMapRef.current[lesson._id]) {
        markLessonCompletedLocal(lesson._id);
      }
    } catch (err) {
      console.error('Text progress error:', err);
    }
  }, [courseId]);

  const reportVideoProgress = useCallback(async (lesson, percent) => {
    try {
      await axios.post(
        `http://localhost:5000/api/progress/course/${courseId}/lesson/${lesson._id}/video`,
        { videoPercent: Math.round(percent) },
        getAuthConfig()
      );

      setVideoDoneMap((prev) => ({ ...prev, [lesson._id]: true }));

      const hasText = !!lesson.textContent;
      // Đọc từ ref để luôn có giá trị mới nhất, tránh stale closure
      if (!hasText || textDoneMapRef.current[lesson._id]) {
        markLessonCompletedLocal(lesson._id);
      }
    } catch (err) {
      console.error('Video progress error:', err);
    }
  }, [courseId]);

  // Bug 2+3: sync refs mỗi khi state thay đổi — để callbacks đọc giá trị mới nhất
  useEffect(() => { videoDoneMapRef.current = videoDoneMap; }, [videoDoneMap]);
  useEffect(() => { textDoneMapRef.current  = textDoneMap;  }, [textDoneMap]);

  useEffect(() => {
    if (!currentLesson) return;

    if (textTimerRef.current) {
      clearTimeout(textTimerRef.current);
    }

    if (currentLesson.textContent && !textDoneMap[currentLesson._id]) {
      textTimerRef.current = setTimeout(() => {
        reportTextProgress(currentLesson);
      }, 10000);
    }

    return () => {
      if (textTimerRef.current) {
        clearTimeout(textTimerRef.current);
      }
    };
  // Bug 2: bỏ videoDoneMap khỏi deps → timer KHÔNG bị reset khi video cập nhật
  // reportTextProgress đọc videoDoneMapRef.current nên vẫn có giá trị mới nhất
  }, [currentLesson, courseId, textDoneMap, reportTextProgress]);

  const handleVideoTimeUpdate = async (e, lesson) => {
    const video = e.target;
    if (!video?.duration) return;

    const lid         = lesson._id?.toString();
    const currentTime = video.currentTime;
    const lastTime    = videoLastTimeRef.current[lid] ?? currentTime;
    const delta       = currentTime - lastTime;
    videoLastTimeRef.current[lid] = currentTime;

    // Chỉ tích lũy khi đi tiến & delta nhỏ (bỏ qua seek nhảy lớn > 2s)
    if (delta > 0 && delta < 2) {
      videoWatchedSecsRef.current[lid] = (videoWatchedSecsRef.current[lid] || 0) + delta;
      // Cập nhật điểm xa nhất đã xem (dùng để giới hạn seek)
      const prevMax = videoMaxReachedRef.current[lid] || 0;
      if (currentTime > prevMax) videoMaxReachedRef.current[lid] = currentTime;
    }

    const watchedPct = ((videoWatchedSecsRef.current[lid] || 0) / video.duration) * 100;

    // Ngưỡng 50%: phải xem THỰC TẾ đủ 50% thời lượng
    if (watchedPct >= 50 && !videoReportedRef.current[lid]) {
      videoReportedRef.current[lid] = true;
      await reportVideoProgress(lesson, 50);
    }
  };

  // Giới hạn tua HTML5 video: không cho seek quá 5s so với điểm đã xem xa nhất
  // Trừ khi video đã hoàn thành → cho tua tự do
  const handleVideoSeeking = (e, lesson) => {
    const video = e.target;
    if (!video?.duration) return;
    const lid        = lesson._id?.toString();

    // Nếu đã hoàn thành (trong session hoặc từ DB) → bỏ giới hạn
    if (videoReportedRef.current[lid] || videoDoneMapRef.current[lid]) return;

    const maxReached = videoMaxReachedRef.current[lid] || 0;
    const maxAllowed = maxReached + 5;
    if (video.currentTime > maxAllowed) {
      video.currentTime = Math.min(maxAllowed, video.duration);
      setShowHtmlSeekWarn(true);
      clearTimeout(htmlSeekWarnTimer.current);
      htmlSeekWarnTimer.current = setTimeout(() => setShowHtmlSeekWarn(false), 2500);
    }
  };

  const isLessonLocked = (index) => {
    if (index === 0) return false;

    const previousLesson = lessons[index - 1];
    if (!previousLesson) return false;

    // Bug 5: so sánh bằng string để tránh mismatch ObjectId vs string
    return !completedLessonIds.includes(previousLesson._id?.toString());
  };

  const handleSelectLesson = (lesson, index) => {
    if (isLessonLocked(index)) return;
    setCurrentLesson(lesson);
  };

  const getCompletionPercent = () => {
    if (!lessons.length) return 0;
    return Math.round((completedLessonIds.length / lessons.length) * 100);
  };

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{courseName || 'Học khóa học'}</h1>
        {courseName && <p className="text-slate-400 mt-1 text-sm">Tiến độ học tập của bạn</p>}
      </div>

      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300">Tiến độ khóa học</span>
          <span className="font-semibold text-blue-400">
            {getCompletionPercent()}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${getCompletionPercent()}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          Đang tải bài học...
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 text-red-300 rounded-2xl p-6">
          {error}
        </div>
      ) : lessons.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          Không có bài học
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h2 className="font-bold mb-4">Danh sách bài học</h2>

              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const locked = isLessonLocked(index);
                  // Bug 5: normalize sang string khi so sánh
                  const completed = completedLessonIds.includes(lesson._id?.toString());
                  const active = currentLesson?._id?.toString() === lesson._id?.toString();

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => handleSelectLesson(lesson, index)}
                      disabled={locked}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        active
                          ? 'bg-blue-600 border-blue-500'
                          : locked
                          ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm">
                            {index + 1}. {lesson.title}
                          </div>
                          <div className="text-xs text-slate-300 mt-1">
                            {lesson.textContent ? 'Có văn bản' : 'Không có văn bản'}{' '}
                            • {lesson.videoUrl ? 'Có video' : 'Không có video'}
                          </div>
                        </div>

                        <div className="text-xs font-semibold">
                          {completed ? (
                            <span className="text-green-400">Xong</span>
                          ) : locked ? (
                            <span className="text-yellow-400">Khóa</span>
                          ) : (
                            <span className="text-blue-300">Mở</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {currentLesson ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-4">{currentLesson.title}</h2>

                {currentLesson.videoUrl && (() => {
                  const ytId = getYouTubeId(currentLesson.videoUrl);
                  return (
                    <div className="mb-5">
                      {ytId ? (
                        <LMSVideoPlayer
                          videoId={ytId}
                          onWatchComplete={() => reportVideoProgress(currentLesson, 50)}
                          alreadyCompleted={!!videoDoneMap[currentLesson._id]}
                        />
                      ) : (
                        <>
                          <video
                            src={currentLesson.videoUrl}
                            controls
                            className="w-full rounded-xl bg-black"
                            onTimeUpdate={(e) => handleVideoTimeUpdate(e, currentLesson)}
                            onSeeking={(e) => handleVideoSeeking(e, currentLesson)}
                          />
                          {showHtmlSeekWarn && (
                            <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg py-2 px-3">
                              ⚠️ Không thể tua qua phần chưa xem!
                            </div>
                          )}
                        </>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        Xem tối thiểu 50% video để hoàn thành phần video.
                      </p>
                    </div>
                  );
                })()}

                {currentLesson.textContent && (
                  <div className="mb-5">
                    <h3 className="font-semibold mb-2">Nội dung bài học</h3>
                    <div
                        className="bg-slate-800 rounded-xl p-4 text-slate-200 leading-7 prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentLesson.textContent }}
                      />
                    <p className="text-xs text-slate-400 mt-2">
                      Đọc tối thiểu 10 giây để hoàn thành phần văn bản.
                    </p>
                  </div>
                )}

                {/* ── Quiz section ── */}
                {currentLesson.type === 'quiz' && Array.isArray(currentLesson.questions) && currentLesson.questions.length > 0 && (
                  <QuizSection
                    key={currentLesson._id}
                    lesson={currentLesson}
                    courseId={courseId}
                    getAuthConfig={getAuthConfig}
                    alreadyDone={completedLessonIds.includes(currentLesson._id?.toString())}
                    onComplete={() => markLessonCompletedLocal(currentLesson._id)}
                  />
                )}

                {currentLesson.type === 'quiz' && (!currentLesson.questions || currentLesson.questions.length === 0) && (
                  <div className="mb-5 bg-slate-800 rounded-xl p-5 text-slate-400 text-center">
                    📝 Bài quiz này chưa có câu hỏi.
                  </div>
                )}


                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Trạng thái bài học</h3>
                  <div className="text-sm text-slate-300 space-y-1">
                    <p>
                      Văn bản:{' '}
                      <span
                        className={
                          textDoneMap[currentLesson._id]
                            ? 'text-green-400 font-semibold'
                            : 'text-yellow-400 font-semibold'
                        }
                      >
                        {currentLesson.textContent
                          ? textDoneMap[currentLesson._id]
                            ? 'Đã hoàn thành'
                            : 'Chưa hoàn thành'
                          : 'Không áp dụng'}
                      </span>
                    </p>
                    <p>
                      Video:{' '}
                      <span
                        className={
                          videoDoneMap[currentLesson._id]
                            ? 'text-green-400 font-semibold'
                            : 'text-yellow-400 font-semibold'
                        }
                      >
                        {currentLesson.videoUrl
                          ? videoDoneMap[currentLesson._id]
                            ? 'Đã hoàn thành'
                            : 'Chưa hoàn thành'
                          : 'Không áp dụng'}
                      </span>
                    </p>
                    <p>
                      Bài học:{' '}
                      <span
                        className={
                          completedLessonIds.includes(currentLesson._id?.toString())
                            ? 'text-green-400 font-semibold'
                            : 'text-yellow-400 font-semibold'
                        }
                      >
                        {completedLessonIds.includes(currentLesson._id?.toString())
                          ? 'Đã hoàn thành'
                          : 'Chưa hoàn thành'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                Chọn một bài học để bắt đầu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}