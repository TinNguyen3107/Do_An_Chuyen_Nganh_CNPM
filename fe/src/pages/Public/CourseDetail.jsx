import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StarRating = ({ rating, size = 'md' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    green: 'bg-green-500/15 border-green-500/30 text-green-300',
    amber: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    purple: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    setLoading(true);
    courseAPI.getById(id).then(res => {
      setCourse(res.data.data);
    }).catch(() => {
      toast.error('Không tìm thấy khoá học');
      navigate('/courses');
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      enrollmentAPI.checkEnrollment(id).then(res => {
        setEnrolled(res.data.data?.isEnrolled || false);
      }).catch(() => {});
    }
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate('/auth'); return; }
    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(id);
      setEnrolled(true);
      toast.success('Đăng ký khoá học thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đăng ký khoá học');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-2/3 mb-4" />
      <div className="h-4 bg-slate-800 rounded w-1/2 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-slate-800 rounded-2xl" />
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
        </div>
        <div className="h-80 bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );

  if (!course) return null;

  const levelLabels = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', all: 'Tất cả cấp độ' };

  return (
    <div className="min-h-screen">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link to="/courses" className="hover:text-blue-400 transition-colors">Khoá học</Link>
            <span>/</span>
            <span className="text-blue-400">{course.category?.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight max-w-3xl">{course.title}</h1>
          <p className="text-slate-300 text-lg mb-5 max-w-2xl">{course.shortDescription || course.description?.slice(0, 150) + '...'}</p>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <StarRating rating={course.averageRating || 0} size="lg" />
              <span className="text-amber-400 font-bold">{course.averageRating > 0 ? course.averageRating.toFixed(1) : 'Mới'}</span>
              <span className="text-slate-400 text-sm">({course.totalStudents || 0} học viên)</span>
            </div>
            <Badge color="blue">{course.category?.name}</Badge>
            <Badge color="purple">{levelLabels[course.level] || 'Tất cả'}</Badge>
            <Badge color="amber">🌐 {course.language || 'Tiếng Việt'}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              {course.instructor?.name?.charAt(0)}
            </div>
            <span>Giảng viên: <span className="font-semibold text-white">{course.instructor?.name}</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* THUMBNAIL VIDEO */}
            {course.thumbnail && (
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* OBJECTIVES */}
            {course.objectives?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎯</span> Bạn sẽ học được gì?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {obj}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REQUIREMENTS */}
            {course.requirements?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📋</span> Yêu cầu đầu vào
                </h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DESCRIPTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📖</span> Mô tả khoá học
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{course.description}</p>
            </div>

            {/* TAGS */}
            {course.tags?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR CARD */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
              {course.thumbnail && (
                <div className="aspect-video overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-4xl font-extrabold text-white">
                    {course.isFree ? <span className="text-green-400">Miễn phí</span> : `${Number(course.price).toLocaleString('vi-VN')}đ`}
                  </span>
                </div>

                {enrolled ? (
                  <div className="space-y-3">
                    <div className="w-full py-3 bg-green-500/20 border border-green-500/30 text-green-400 font-bold rounded-xl text-center text-sm">
                      ✅ Đã đăng ký khoá học
                    </div>
                    <Link to="/student/my-courses" className="w-full block py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center text-sm transition-all">
                      Vào học ngay →
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm mb-3"
                  >
                    {enrolling ? 'Đang xử lý...' : course.isFree ? '🚀 Học miễn phí ngay' : '💳 Đăng ký khoá học'}
                  </button>
                )}

                {!user && (
                  <p className="text-center text-xs text-slate-500 mt-3">
                    <Link to="/auth" className="text-blue-400 hover:text-blue-300">Đăng nhập</Link> để đăng ký khoá học
                  </p>
                )}

                <div className="mt-5 space-y-3 border-t border-slate-800 pt-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khoá học bao gồm:</p>
                  {[
                    { icon: '👥', text: `${course.totalStudents || 0} học viên đã đăng ký` },
                    { icon: '📚', text: `${course.totalLectures || 0} bài giảng` },
                    { icon: '⏱', text: `${course.totalDuration || 0} phút học` },
                    { icon: '🌍', text: course.language || 'Tiếng Việt' },
                    { icon: '♾️', text: 'Truy cập trọn đời' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                      <span>{icon}</span>
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
  );
}
