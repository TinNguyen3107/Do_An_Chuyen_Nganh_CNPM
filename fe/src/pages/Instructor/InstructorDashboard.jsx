import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0
  });
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await courseAPI.getMyCourses();
      const coursesData = res.data.data || [];
      setCourses(coursesData);
      
      // Tính toán thống kê
      const totalStudents = coursesData.reduce((acc, course) => acc + (course.studentsCount || 0), 0);
      const totalRevenue = coursesData.reduce((acc, course) => acc + (course.price * (course.studentsCount || 0)), 0);
      
      setStats({
        totalCourses: coursesData.length,
        totalStudents,
        totalRevenue
      });
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCourses(); 
  }, []);

  const handlePublish = async (id) => {
    try {
      await courseAPI.publish(id);
      toast.success('✅ Xuất bản thành công!');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xuất bản khóa học');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa bản nháp này?')) return;
    try {
      await courseAPI.delete(id);
      toast.success('🗑️ Xóa thành công');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Khóa học</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý tất cả khóa học của bạn</p>
        </div>
        <Link 
          to="/instructor/create-course" 
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo khóa học mới
        </Link>
      </div>

      {/* Stats Cards */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">Tổng khóa học</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalCourses}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">Tổng học viên</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalStudents}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">Doanh thu</p>
            <p className="text-2xl font-bold text-white mt-2">{formatPrice(stats.totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center">
          <div className="text-5xl mb-4 text-slate-600">📝</div>
          <h2 className="text-lg font-bold text-white mb-2">Chưa có khóa học nào</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Bạn chưa tạo khóa học nào trên hệ thống. Bắt đầu chia sẻ kiến thức của bạn tới hàng ngàn học viên!
          </p>
          <Link 
            to="/instructor/create-course" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30"
          >
            Tạo khóa học đầu tiên →
          </Link>
        </div>
      )}

      {/* Courses List */}
      {!loading && courses.length > 0 && (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div 
              key={course._id} 
              className="flex flex-col md:flex-row gap-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
            >
              {/* Thumbnail */}
              <div className="w-full md:w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-lg relative flex-shrink-0">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold bg-slate-900/90 backdrop-blur-sm text-white shadow">
                  {course.status === 'published' ? (
                    <span className="text-green-400">● Đã xuất bản</span>
                  ) : (
                    <span className="text-amber-400">● Bản nháp</span>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                    {course.category?.name || 'Chưa phân loại'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-3">
                  <span className="flex items-center gap-1">
                    <span className="text-emerald-400">💰</span> 
                    {formatPrice(course.price)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-blue-400">👥</span> 
                    {course.studentsCount || 0} học viên
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400">★</span> 
                    {course.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  {course.level && (
                    <span className="flex items-center gap-1">
                      <span className="text-purple-400">📊</span>
                      {course.level === 'beginner' ? 'Cơ bản' : 
                       course.level === 'intermediate' ? 'Trung cấp' : 
                       course.level === 'advanced' ? 'Nâng cao' : 'Tất cả'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto justify-end">
                <button 
                  onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 hover:text-white text-slate-300 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Sửa
                </button>
                
                {course.status === 'draft' && (
                  <>
                    <button 
                      onClick={() => handleDelete(course._id)} 
                      className="px-4 py-2 border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 text-red-500 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa
                    </button>
                    <button 
                      onClick={() => handlePublish(course._id)} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Xuất bản
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}