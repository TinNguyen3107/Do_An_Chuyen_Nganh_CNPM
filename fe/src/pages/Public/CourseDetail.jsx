import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, enrollmentAPI, chapterAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CourseReviewSection from '../../components/CourseReviewSection';
import toast from 'react-hot-toast';
import {
  Star, Users, Clock, BookOpen, PlayCircle, Check,
  Monitor, FileText, Award, ChevronDown, ChevronUp,
  Globe, Shield, Lock, HelpCircle, Tag
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const StarRating = ({ rating, size = 'md' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i}
        className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${
          i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600 fill-slate-600'
        }`}
      />
    ))}
  </div>
);

const levelLabels = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
  all: 'Tất cả cấp độ',
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse]             = useState(null);
  const [chapters, setChapters]         = useState([]);
  const [enrolled, setEnrolled]         = useState(false);
  const [loading, setLoading]           = useState(true);
  const [enrolling, setEnrolling]       = useState(false);
  const [reloadCourse, setReloadCourse] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([courseAPI.getById(id), chapterAPI.getByCourse(id)])
      .then(([resCourse, resChapters]) => {
        const c  = resCourse.data.data;
        const ch = resChapters.data.data || [];
        setCourse(c);
        setChapters(ch);
        if (ch.length > 0) setExpandedChapters([ch[0]._id]);
      })
      .catch(() => { toast.error('Không tìm thấy khoá học'); navigate('/courses'); })
      .finally(() => setLoading(false));
  }, [id, navigate, reloadCourse]);

  useEffect(() => {
    if (user) {
      enrollmentAPI.checkEnrollment(id)
        .then(res => setEnrolled(res.data.data?.isEnrolled || false))
        .catch(() => {});
    }
  }, [id, user]);

  const toggleChapter = (chid) =>
    setExpandedChapters(prev =>
      prev.includes(chid) ? prev.filter(x => x !== chid) : [...prev, chid]
    );

  const handleEnroll = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!course.isFree) { navigate(`/checkout/${id}`); return; }
    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(id);
      setEnrolled(true);
      setReloadCourse(prev => prev + 1);
      toast.success('Đăng ký khoá học thành công!');
    } catch (err) {
      if (err.response?.status === 402 && err.response?.data?.requiresPayment) {
        navigate(`/checkout/${id}`); return;
      }
      toast.error(err.response?.data?.message || 'Lỗi khi đăng ký khoá học');
    } finally { setEnrolling(false); }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="bg-slate-900 border-b border-slate-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/4" />
              <div className="h-10 bg-slate-800 rounded w-3/4" />
              <div className="h-5 bg-slate-800 rounded w-2/3" />
            </div>
            <div className="h-80 bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!course) return null;

  const totalLessons = chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);

  const sidebarFeatures = [
    { icon: <Users className="w-4 h-4" />,    text: `${course.totalStudents || 0} học viên đã đăng ký` },
    { icon: <Star className="w-4 h-4" />,     text: `${course.totalReviews || 0} đánh giá` },
    { icon: <BookOpen className="w-4 h-4" />, text: `${totalLessons} bài giảng` },
    { icon: <Clock className="w-4 h-4" />,    text: `${course.totalDuration || 0} phút học` },
    { icon: <Globe className="w-4 h-4" />,    text: course.language || 'Tiếng Việt' },
    { icon: <Shield className="w-4 h-4" />,   text: 'Truy cập trọn đời' },
    { icon: <Award className="w-4 h-4" />,    text: 'Chứng chỉ hoàn thành' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative">

        {/* Hero background strip */}
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-b border-slate-700/50 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Left: hero info + content sections ─────────────────────── */}
            <div className="lg:col-span-2">

              {/* Course info (over hero bg) */}
              <div className="pt-12 pb-8 space-y-5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Link to="/courses" className="hover:text-blue-400 transition-colors">Khoá học</Link>
                  <span>/</span>
                  <span className="text-blue-400">{course.category?.name}</span>
                  {course.level && (
                    <>
                      <span>/</span>
                      <span className="text-slate-400">{levelLabels[course.level] || course.level}</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{course.title}</h1>

                <p className="text-slate-300 text-base leading-relaxed">
                  {course.shortDescription || course.description?.slice(0, 200) + '…'}
                </p>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="font-bold text-base">
                      {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'Mới'}
                    </span>
                    <StarRating rating={course.averageRating || 0} />
                    <span className="text-slate-400">({course.totalReviews || 0} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{(course.totalStudents || 0).toLocaleString('vi-VN')} học viên</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>{course.language || 'Tiếng Việt'}</span>
                  </div>
                  {course.level && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                      {levelLabels[course.level] || course.level}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-slate-700">
                    {course.instructor?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Giảng viên</p>
                    <p className="text-sm font-semibold text-white">{course.instructor?.name}</p>
                  </div>
                </div>
              </div>

              {/* Content sections */}
              <div className="pb-12 space-y-8">

                {course.objectives?.length > 0 && (
                  <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                      <span className="w-7 h-7 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </span>
                      Bạn sẽ học được gì?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {course.objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-slate-300 text-sm leading-relaxed">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {chapters.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-blue-500/15 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                        </span>
                        Nội dung khoá học
                      </h2>
                      <span className="text-sm text-slate-400">
                        {chapters.length} chương • {totalLessons} bài giảng
                      </span>
                    </div>
                    <div className="border border-slate-800 rounded-2xl overflow-hidden">
                      {chapters.map((chapter, idx) => {
                        const isExpanded = expandedChapters.includes(chapter._id);
                        return (
                          <div key={chapter._id} className="border-b border-slate-800 last:border-0">
                            <button
                              onClick={() => toggleChapter(chapter._id)}
                              className="w-full flex items-center justify-between p-5 bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                {isExpanded
                                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                }
                                <span className="font-semibold text-white text-sm">
                                  Chương {idx + 1}: {chapter.title}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 ml-4 flex-shrink-0 hidden sm:block">
                                {chapter.lessons?.length || 0} bài học
                              </span>
                            </button>
                            {isExpanded && chapter.lessons?.length > 0 && (
                              <div className="bg-slate-900/40 py-1">
                                {chapter.lessons.map((lesson, lIdx) => {
                                  const isVideo = lesson.type === 'video';
                                  const isQuiz  = lesson.type === 'quiz';
                                  return (
                                    <div key={lesson._id}
                                      className="flex items-center justify-between py-3 px-5 sm:px-14 hover:bg-slate-800/40 transition-colors group"
                                    >
                                      <div className="flex items-center gap-3">
                                        {isVideo
                                          ? <PlayCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                          : isQuiz
                                            ? <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                            : <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        }
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                          {idx + 1}.{lIdx + 1} {lesson.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                        {lesson.isPreview && (
                                          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                            Học thử
                                          </span>
                                        )}
                                        {isVideo && lesson.duration > 0 && (
                                          <span className="text-xs text-slate-500">{lesson.duration}p</span>
                                        )}
                                        {!lesson.isPreview && (
                                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {course.requirements?.length > 0 && (
                  <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2.5">
                      <span className="w-7 h-7 bg-amber-500/15 rounded-lg flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-amber-400" />
                      </span>
                      Yêu cầu đầu vào
                    </h2>
                    <ul className="space-y-3">
                      {course.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                          <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2.5">
                    <span className="w-7 h-7 bg-purple-500/15 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </span>
                    Mô tả khoá học
                  </h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {course.description}
                  </p>
                </section>

                <CourseReviewSection
                  courseId={id}
                  enrolled={enrolled}
                  onReviewSubmitted={() => setReloadCourse(prev => prev + 1)}
                />

                {course.tags?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map(tag => (
                        <span key={tag}
                          className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:border-slate-600 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── Right: sticky sidebar ── */}
            <div className="lg:col-span-1">
              <div className="pt-12">
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">

                  {/* Thumbnail */}
                  <div className="aspect-video">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-800 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Price + CTA + Features */}
                  <div className="p-6 space-y-4">
                    <span className="text-3xl font-extrabold text-white">
                      {course.isFree
                        ? <span className="text-emerald-400">Miễn phí</span>
                        : `${Number(course.price).toLocaleString('vi-VN')}đ`
                      }
                    </span>

                    {enrolled ? (
                      <div className="space-y-2.5">
                        <div className="w-full py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl text-center text-sm flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Đã đăng ký khoá học
                        </div>
                        <Link to="/student/my-courses"
                          className="w-full block py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center text-sm transition-all shadow-lg shadow-blue-600/25"
                        >
                          Vào học ngay →
                        </Link>
                      </div>
                    ) : (
                      <button onClick={handleEnroll} disabled={enrolling}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm"
                      >
                        {enrolling ? 'Đang xử lý...' : course.isFree ? '🚀 Học miễn phí ngay' : '💳 Đăng ký khoá học'}
                      </button>
                    )}

                    {!user && (
                      <p className="text-center text-xs text-slate-500">
                        <Link to="/auth" className="text-blue-400 hover:text-blue-300">Đăng nhập</Link> để đăng ký khoá học
                      </p>
                    )}

                    <div className="pt-4 border-t border-slate-700/60 space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khoá học bao gồm:</p>
                      {sidebarFeatures.map(({ icon, text }) => (
                        <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                          <span className="text-slate-400 flex-shrink-0">{icon}</span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
