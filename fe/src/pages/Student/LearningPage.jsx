import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PlayCircle, CheckCircle, Circle, ChevronLeft,
  Menu, X, ChevronDown, ChevronUp, Award,
  HelpCircle, FileText, Clock, Lock
} from 'lucide-react';

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

// ── LMS Custom YouTube Player ────────────────────────────────────────────────
function LMSVideoPlayer({ videoId, onWatchComplete, alreadyCompleted = false, onDurationLoad }) {
  const playerDivRef = useRef(null);
  const playerRef    = useRef(null);
  const wrapperRef   = useRef(null);
  const progressRef  = useRef(null);
  const hideTimer    = useRef(null);
  const tickTimer    = useRef(null);
  const reportedRef      = useRef(false);
  const watchedSecsRef   = useRef(0);
  const maxReachedRef    = useRef(0);
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
  const [showSeekWarn,  setShowSeekWarn]  = useState(false);

  useEffect(() => {
    let destroyed = false;
    reportedRef.current = false;
    _ytReady.then(() => {
      if (destroyed || !playerDivRef.current) return;
      playerRef.current = new window.YT.Player(idRef.current, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1, playsinline: 1, enablejsapi: 1, origin: window.location.origin },
        events: {
          onReady: (e) => { if (destroyed) return; e.target.setVolume(80); const dur = e.target.getDuration(); setDuration(dur); setReady(true); onDurationLoad?.(dur); },
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
      watchedSecsRef.current = 0;
      maxReachedRef.current  = 0;
      reportedRef.current    = false;
      clearInterval(tickTimer.current);
      clearTimeout(hideTimer.current);
      clearTimeout(seekWarnTimerRef.current);
      try { playerRef.current?.destroy(); } catch (_) {}
    };
  }, [videoId]);

  useEffect(() => {
    if (playing) {
      tickTimer.current = setInterval(() => {
        const p = playerRef.current;
        if (!p?.getCurrentTime) return;
        const ct = p.getCurrentTime();
        setCurrentTime(ct);
        if (!duration) setDuration(p.getDuration());
        watchedSecsRef.current += 0.3;
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

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const onKey = (e) => {
      // Don't fire when typing in input/textarea
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;

      const p = playerRef.current;
      if (!p) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        playing ? p.pauseVideo() : p.playVideo();
        setShowControls(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowControls(false), 2000);
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const ct = p.getCurrentTime?.() || 0;
        const dur = p.getDuration?.() || 0;
        const isDone = alreadyCompleted || reportedRef.current;
        const maxAllowed = maxReachedRef.current + 5;
        const target = Math.min(ct + 5, dur);
        if (!isDone && target > maxAllowed) {
          setShowSeekWarn(true);
          clearTimeout(seekWarnTimerRef.current);
          seekWarnTimerRef.current = setTimeout(() => setShowSeekWarn(false), 2500);
        } else {
          p.seekTo(target, true);
          setCurrentTime(target);
        }
        setShowControls(true);
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const ct = p.getCurrentTime?.() || 0;
        const target = Math.max(0, ct - 5);
        p.seekTo(target, true);
        setCurrentTime(target);
        setShowControls(true);
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (muted) { p.unMute(); p.setVolume(volume || 80); setMuted(false); }
        else { p.mute(); setMuted(true); }
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const el = wrapperRef.current;
        if (!document.fullscreenElement) el?.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ready, playing, muted, volume, alreadyCompleted]);

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
      className="relative bg-black select-none w-full"
      style={{ aspectRatio: '16/9', cursor: showControls ? 'default' : 'none' }}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <div ref={playerDivRef} id={idRef.current} className="w-full h-full" />

      {showSeekWarn && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl pointer-events-none">
          <span>⚠️</span>
          <span>Không thể tua qua phần chưa xem!</span>
        </div>
      )}

      {!ready && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 text-xs">Đang tải video...</p>
        </div>
      )}

      {buffering && ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {ready && <div className="absolute inset-0" style={{ cursor: 'default' }} onClick={togglePlay} />}

      {ready && !playing && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-blue-600/80 backdrop-blur-sm flex items-center justify-center border border-blue-400/30 shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 transition-all duration-200"
        style={{ opacity: showControls ? 1 : 0, transform: showControls ? 'translateY(0)' : 'translateY(4px)', pointerEvents: showControls ? 'auto' : 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)', paddingTop: 40 }}
      >
        <div className="px-3 mb-2 group/bar">
          <div ref={progressRef} onClick={seek} className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative" style={{ height: 4 }}>
            <div className="h-full bg-blue-500 rounded-full relative" style={{ width: `${pct}%`, transition: 'width 0.3s linear' }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity" style={{ transform: 'translate(50%,-50%)' }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 pb-2.5">
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-white/10">
            {playing
              ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            }
          </button>

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

          <span className="text-white/70 text-xs font-mono ml-1 shrink-0">{fmt(currentTime)} / {fmt(duration)}</span>
          <span className="flex-1" />

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
  const [retrying, setRetrying]   = useState(false);

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
    setRetrying(true);
  };

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  if (alreadyDone && !submitted && !retrying) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
        <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Award className="w-7 h-7 text-emerald-400" />
        </div>
        <p className="text-emerald-400 font-semibold text-lg">Bạn đã hoàn thành bài quiz này!</p>
        <button onClick={handleRetry} className="mt-3 text-xs text-slate-400 hover:text-white underline">
          Làm lại quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-purple-400" /> Bài kiểm tra
      </h3>

      {questions.map((q, qIdx) => {
        const chosen   = answers[qIdx];
        const isRight  = submitted && chosen === q.correctIndex;
        const isWrong  = submitted && chosen !== undefined && chosen !== q.correctIndex;

        return (
          <div key={qIdx} className={`bg-slate-800/80 rounded-xl p-5 border transition-colors ${
            isRight ? 'border-emerald-500/40' : isWrong ? 'border-red-500/40' : 'border-slate-700'
          }`}>
            <p className="font-medium text-sm mb-3 text-slate-200">
              Câu {qIdx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => {
                const isChosen  = chosen === oIdx;
                const isCorrect = oIdx === q.correctIndex;

                let style = 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50';
                if (submitted) {
                  if (isChosen && isCorrect) style = 'border-emerald-500 bg-emerald-500/15 text-emerald-300';
                  else if (isChosen && !isCorrect) style = 'border-red-500 bg-red-500/15 text-red-300';
                  else style = 'border-slate-700 text-slate-600 opacity-60';
                } else if (isChosen) {
                  style = 'border-blue-500 bg-blue-500/15 text-blue-300';
                }

                return (
                  <button key={oIdx} onClick={() => handleSelect(qIdx, oIdx)} disabled={submitted}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${style} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}>
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

      {!submitted ? (
        <button onClick={handleSubmit} disabled={!allAnswered}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed">
          Nộp bài ({Object.keys(answers).length}/{questions.length} câu đã trả lời)
        </button>
      ) : (
        <div className={`rounded-xl p-5 text-center border ${
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LEARNING PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function LearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');

  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [textDoneMap, setTextDoneMap] = useState({});
  const [videoDoneMap, setVideoDoneMap] = useState({});
  const [showHtmlSeekWarn, setShowHtmlSeekWarn] = useState(false);
  const [realDurationMap, setRealDurationMap] = useState({}); // lessonId -> seconds (real YT duration)

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState([]);

  const textTimerRef        = useRef(null);
  const videoReportedRef    = useRef({});
  const videoWatchedSecsRef = useRef({});
  const videoLastTimeRef    = useRef({});
  const videoMaxReachedRef  = useRef({});
  const htmlSeekWarnTimer   = useRef(null);
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
    const id = lessonId?.toString();
    setCompletedLessonIds((prev) => prev.includes(id) ? prev : [...prev, id]);
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
        const lessonId =
          typeof item.lesson === 'object' && item.lesson !== null
            ? item.lesson._id?.toString()
            : item.lesson?.toString();
        if (!lessonId) return;
        if (item.isTextCompleted)  nextTextDoneMap[lessonId]  = true;
        if (item.isVideoCompleted) nextVideoDoneMap[lessonId] = true;
        if (item.isCompleted)      nextCompletedLessonIds.push(lessonId);
      });

      lessonList.forEach((lesson) => {
        if (lesson.type === 'quiz') return;
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
      try {
        const res = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`,
          getAuthConfig()
        );
        const name = res.data?.data?.title || res.data?.title || '';
        if (name) setCourseName(name);
      } catch {}

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

  // ── Group lessons by chapter ─────────────────────────────────────────────────
  const groupedChapters = (() => {
    const chapMap = {};
    const chapOrder = [];
    lessons.forEach(l => {
      const chId   = l.chapter?._id || l.chapter || '__ungrouped';
      const chName = l.chapter?.title || (chId === '__ungrouped' ? 'Bài học' : `Chương`);
      if (!chapMap[chId]) {
        chapMap[chId] = { id: chId, title: chName, lessons: [] };
        chapOrder.push(chId);
      }
      chapMap[chId].lessons.push(l);
    });
    return chapOrder.map(id => chapMap[id]);
  })();

  // Expand first chapter by default
  useEffect(() => {
    if (groupedChapters.length > 0 && expandedChapters.length === 0) {
      setExpandedChapters([groupedChapters[0].id]);
    }
  }, [groupedChapters.length]);

  const toggleChapter = (chId) => {
    setExpandedChapters(prev =>
      prev.includes(chId) ? prev.filter(x => x !== chId) : [...prev, chId]
    );
  };

  const reportTextProgress = useCallback(async (lesson) => {
    try {
      await axios.post(
        `http://localhost:5000/api/progress/course/${courseId}/lesson/${lesson._id}/text`,
        { textReadSeconds: 10 },
        getAuthConfig()
      );
      setTextDoneMap((prev) => ({ ...prev, [lesson._id]: true }));
      const hasVideo = !!lesson.videoUrl;
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
      if (!hasText || textDoneMapRef.current[lesson._id]) {
        markLessonCompletedLocal(lesson._id);
      }
    } catch (err) {
      console.error('Video progress error:', err);
    }
  }, [courseId]);

  useEffect(() => { videoDoneMapRef.current = videoDoneMap; }, [videoDoneMap]);
  useEffect(() => { textDoneMapRef.current  = textDoneMap;  }, [textDoneMap]);

  useEffect(() => {
    if (!currentLesson) return;
    if (textTimerRef.current) clearTimeout(textTimerRef.current);
    if (currentLesson.textContent && !textDoneMap[currentLesson._id]) {
      textTimerRef.current = setTimeout(() => {
        reportTextProgress(currentLesson);
      }, 10000);
    }
    return () => { if (textTimerRef.current) clearTimeout(textTimerRef.current); };
  }, [currentLesson, courseId, textDoneMap, reportTextProgress]);

  const handleVideoTimeUpdate = async (e, lesson) => {
    const video = e.target;
    if (!video?.duration) return;
    const lid         = lesson._id?.toString();
    const currentTime = video.currentTime;
    const lastTime    = videoLastTimeRef.current[lid] ?? currentTime;
    const delta       = currentTime - lastTime;
    videoLastTimeRef.current[lid] = currentTime;
    if (delta > 0 && delta < 2) {
      videoWatchedSecsRef.current[lid] = (videoWatchedSecsRef.current[lid] || 0) + delta;
      const prevMax = videoMaxReachedRef.current[lid] || 0;
      if (currentTime > prevMax) videoMaxReachedRef.current[lid] = currentTime;
    }
    const watchedPct = ((videoWatchedSecsRef.current[lid] || 0) / video.duration) * 100;
    if (watchedPct >= 50 && !videoReportedRef.current[lid]) {
      videoReportedRef.current[lid] = true;
      await reportVideoProgress(lesson, 50);
    }
  };

  const handleVideoSeeking = (e, lesson) => {
    const video = e.target;
    if (!video?.duration) return;
    const lid = lesson._id?.toString();
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
    return !completedLessonIds.includes(previousLesson._id?.toString());
  };

  const handleSelectLesson = (lesson, globalIndex) => {
    if (isLessonLocked(globalIndex)) return;
    setCurrentLesson(lesson);
  };

  const getCompletionPercent = () => {
    if (!lessons.length) return 0;
    return Math.round((completedLessonIds.length / lessons.length) * 100);
  };

  // Build global index for each lesson (for lock check)
  const lessonGlobalIndex = {};
  lessons.forEach((l, i) => { lessonGlobalIndex[l._id] = i; });

  const completionPct = getCompletionPercent();

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* ── Top Navigation Bar ──────────────────────────────────────────────── */}
      <nav className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            title="Quay lại"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-5 w-px bg-slate-700 hidden sm:block" />
          <h1 className="font-semibold text-white truncate max-w-[180px] sm:max-w-md md:max-w-lg text-sm">
            {courseName || 'Đang tải...'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar in navbar */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              {completionPct}%
            </span>
          </div>

          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left: Video + Lesson Content */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'lg:mr-[380px]' : 'mr-0'
        }`}>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">Đang tải bài học...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-red-900/20 border border-red-800 text-red-300 rounded-2xl p-6 max-w-md text-center">
                {error}
              </div>
            </div>
          ) : !currentLesson ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">Chọn một bài học để bắt đầu</p>
            </div>
          ) : (
            <>
              {/* Video Player Area */}
              {currentLesson.videoUrl && (() => {
                const ytId = getYouTubeId(currentLesson.videoUrl);
                return (
                  <div className="bg-black">
                    {ytId ? (
                      <LMSVideoPlayer
                          videoId={ytId}
                          onWatchComplete={() => reportVideoProgress(currentLesson, 50)}
                          alreadyCompleted={!!videoDoneMap[currentLesson._id]}
                          onDurationLoad={(secs) => setRealDurationMap(prev => ({ ...prev, [currentLesson._id]: secs }))}
                        />
                    ) : (
                      <div className="relative">
                        <video
                          src={currentLesson.videoUrl}
                          controls
                          className="w-full bg-black"
                          style={{ aspectRatio: '16/9' }}
                          onTimeUpdate={(e) => handleVideoTimeUpdate(e, currentLesson)}
                          onSeeking={(e) => handleVideoSeeking(e, currentLesson)}
                          onLoadedMetadata={(e) => setRealDurationMap(prev => ({ ...prev, [currentLesson._id]: e.target.duration }))}
                        />
                        {showHtmlSeekWarn && (
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl pointer-events-none">
                            ⚠️ Không thể tua qua phần chưa xem!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Removed video placeholder for quiz/reading lessons to push content to the top */}

              {/* Lesson Content Below Video */}
              <div>
                <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
                  {/* Lesson title */}
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{currentLesson.title}</h2>
                    <p className="text-xs text-slate-500">
                      {currentLesson.videoUrl && 'Xem tối thiểu 50% video để hoàn thành • '}
                      {currentLesson.textContent && 'Đọc tối thiểu 10 giây để hoàn thành'}
                    </p>
                  </div>

                  {/* Text Content */}
                  {currentLesson.textContent && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <div
                        className="text-slate-200 leading-7 prose prose-invert max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: currentLesson.textContent }}
                      />
                    </div>
                  )}

                  {/* Quiz */}
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
                    <div className="bg-slate-800/50 rounded-xl p-6 text-slate-400 text-center border border-slate-700">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      Bài quiz này chưa có câu hỏi.
                    </div>
                  )}

                  {/* Lesson Status */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 text-sm text-slate-300">Trạng thái bài học</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <div className={`text-xs font-semibold mb-1 ${textDoneMap[currentLesson._id] ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {currentLesson.textContent ? (textDoneMap[currentLesson._id] ? '✓ Hoàn thành' : '○ Chưa xong') : '— Không có'}
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Văn bản</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <div className={`text-xs font-semibold mb-1 ${videoDoneMap[currentLesson._id] ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {currentLesson.videoUrl ? (videoDoneMap[currentLesson._id] ? '✓ Hoàn thành' : '○ Chưa xong') : '— Không có'}
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Video</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <div className={`text-xs font-semibold mb-1 ${completedLessonIds.includes(currentLesson._id?.toString()) ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {completedLessonIds.includes(currentLesson._id?.toString()) ? '✓ Hoàn thành' : '○ Chưa xong'}
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Bài học</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right Sidebar: Curriculum ─────────────────────────────────────── */}
        <div className={`absolute top-0 right-0 bottom-0 w-full lg:w-[380px] bg-slate-900 border-l border-slate-800 flex flex-col transition-transform duration-300 z-10 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <h2 className="font-bold text-white text-sm">Nội dung khoá học</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile progress */}
          <div className="p-3 border-b border-slate-800 md:hidden">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Tiến độ</span>
              <span className="font-semibold text-emerald-400">{completionPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto">
            {groupedChapters.map((chapter, chIdx) => {
              const completedInChapter = chapter.lessons.filter(l => completedLessonIds.includes(l._id?.toString())).length;
              const isExpanded = expandedChapters.includes(chapter.id);

              return (
                <div key={chapter.id} className="border-b border-slate-800/60">
                  {/* Chapter header */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-start justify-between p-4 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="flex-1 pr-3">
                      <h3 className="font-semibold text-sm text-white mb-1">{chapter.title}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{completedInChapter}/{chapter.lessons.length} bài</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-500" />
                        : <ChevronDown className="w-4 h-4 text-slate-500" />
                      }
                    </div>
                  </button>

                  {/* Lessons */}
                  {isExpanded && (
                    <div className="bg-slate-950/50 py-1">
                      {chapter.lessons.map((lesson) => {
                        const gIdx      = lessonGlobalIndex[lesson._id];
                        const locked    = isLessonLocked(gIdx);
                        const completed = completedLessonIds.includes(lesson._id?.toString());
                        const active    = currentLesson?._id?.toString() === lesson._id?.toString();
                        const isVideo   = lesson.type === 'video' || !!lesson.videoUrl;
                        const isQuiz    = lesson.type === 'quiz';

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => handleSelectLesson(lesson, gIdx)}
                            disabled={locked}
                            className={`w-full flex items-start gap-3 py-3 px-4 sm:px-6 transition-colors text-left group ${
                              active
                                ? 'bg-slate-800/80 border-l-2 border-blue-500'
                                : locked
                                  ? 'opacity-40 cursor-not-allowed border-l-2 border-transparent'
                                  : 'hover:bg-slate-800/40 border-l-2 border-transparent'
                            }`}
                          >
                            {/* Status icon */}
                            <div className="mt-0.5 flex-shrink-0">
                              {completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : locked ? (
                                <Lock className="w-4 h-4 text-slate-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                              )}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm mb-1 line-clamp-2 ${
                                active ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'
                              }`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                {isVideo ? <PlayCircle className="w-3 h-3" /> : isQuiz ? <HelpCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                <span>
                                  {(() => {
                                    const realSecs = realDurationMap[lesson._id];
                                    if (realSecs > 0) {
                                      const m = Math.floor(realSecs / 60);
                                      const s = Math.floor(realSecs % 60);
                                      return `${m}:${String(s).padStart(2, '0')}`;
                                    }
                                    if (lesson.duration > 0) return `${lesson.duration}p`;
                                    return isQuiz ? 'Quiz' : 'Bài đọc';
                                  })()}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}