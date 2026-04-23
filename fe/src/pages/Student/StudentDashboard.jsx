import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentAPI.getMyEnrollments()
      .then((res) => setEnrollments(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completedCoursesCount = enrollments.filter(
    (enrollment) => (enrollment.progress || 0) === 100 || enrollment.isCompleted
  ).length;

  const inProgressCoursesCount = enrollments.filter(
    (enrollment) => (enrollment.progress || 0) > 0 && (enrollment.progress || 0) < 100
  ).length;

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* WELCOME HEADER */}
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-2xl p-7 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-2xl object-cover" alt="" /> : user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Xin chào, {user?.name}! 👋</h1>
            <p className="text-slate-400">Tiếp tục hành trình học tập của bạn hôm nay</p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Khoá học đã đăng ký', value: enrollments.length, icon: '📚', color: 'from-blue-500 to-indigo-600' },
          { label: 'Khoá học đang học', value: enrollments.length, icon: '▶️', color: 'from-emerald-500 to-teal-600' },
          { label: 'Đã hoàn thành', value: 0, icon: '🏆', color: 'from-amber-500 to-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-3`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{loading ? '—' : stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* RECENT COURSES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Khoá học gần đây</h2>
          <Link to="/student/my-courses" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-800/50 rounded-xl animate-pulse">
                <div className="w-20 h-14 bg-slate-700 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📖</div>
            <p className="text-slate-400 mb-4">Bạn chưa đăng ký khoá học nào</p>
            <Link to="/courses" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-sm">
              Khám phá khoá học
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.slice(0, 5).map(enrollment => {
              const course = enrollment.course;
              if (!course) return null;
              return (
                <Link key={enrollment._id} to={`/student/learning/${course._id}`} className="flex gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-xl transition-all group">
                  <div className="w-20 h-14 bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
                        <span className="text-blue-400 text-xs">📚</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{course.instructor?.name}</p>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden w-full">
                      <div 
                        className="h-full w-0 bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 flex-shrink-0 self-center">
                    {enrollment.progress || 0}%
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/courses" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl">🔍</div>
            <div>
              <p className="text-sm font-semibold text-white">Khám phá khoá học</p>
              <p className="text-xs text-slate-500">Tìm khoá học phù hợp</p>
            </div>
          </Link>
          <Link to="/student/my-courses" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-xl">📚</div>
            <div>
              <p className="text-sm font-semibold text-white">Khoá học của tôi</p>
              <p className="text-xs text-slate-500">Tiếp tục học tập</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
