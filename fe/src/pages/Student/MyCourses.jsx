import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentAPI.getMyEnrollments()
      .then(res => setEnrollments(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-8">Khoá học của tôi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-slate-800" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Khoá học của tôi</h1>
          <p className="text-slate-400 mt-1">{enrollments.length} khoá học đã đăng ký</p>
        </div>
        <Link to="/courses" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all">
          + Tìm khoá học mới
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-white mb-2">Chưa có khoá học nào</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Bắt đầu hành trình học tập của bạn bằng cách đăng ký các khoá học phù hợp</p>
          <Link to="/courses" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all">
            Khám phá khoá học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {enrollments.map(enrollment => {
            const course = enrollment.course;
            if (!course) return null;
            return (
              <div key={enrollment._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group">
                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-xs font-semibold text-blue-400 mb-1 block">{course.category?.name}</span>
                  <h3 className="font-bold text-white mb-1 line-clamp-2 text-sm leading-snug">{course.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{course.instructor?.name}</p>

                  {/* Progress bar - placeholder */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Tiến độ học tập</span>
                      <span className="font-semibold text-blue-400">0%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Đăng ký: {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}
                    </span>
                    <Link
                      to={`/courses/${course._id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      Vào học →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
