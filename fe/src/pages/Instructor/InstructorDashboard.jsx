import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = () => {
    courseAPI.getMyCourses()
      .then(res => setCourses(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handlePublish = async (id) => {
    try {
      await courseAPI.publish(id);
      toast.success('Xuất bản thành công!');
      fetchCourses();
    } catch {
      toast.error('Lỗi khi xuất bản khoá học');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá bản nháp này?')) return;
    try {
      await courseAPI.delete(id);
      toast.success('Xoá thành công');
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi xoá');
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Quản lý Khoá học</h1>
        <Link to="/instructor/create-course" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white text-sm transition-all shadow-lg shadow-blue-500/30">
          + Tạo khoá học mới
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center my-20"><div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center">
          <div className="text-4xl mb-4 text-slate-600">📝</div>
          <h2 className="text-lg font-bold text-white mb-2">Chưa có khoá học nào</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Bạn chưa tạo khoá học nào trên hệ thống. Bắt đầu chia sẻ kiến thức của bạn tới hàng ngàn học viên!</p>
          <Link to="/instructor/create-course" className="text-blue-400 font-medium hover:underline">Tạo khoá học đầu tiên →</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {courses.map(c => (
            <div key={c._id} className="flex flex-col md:flex-row gap-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl items-center hover:border-slate-700 transition">
              <div className="w-full md:w-56 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-black/50 shadow-lg relative">
                {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" /> : <div className="w-full h-full flex justify-center items-center text-slate-500">Video</div>}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold font-mono tracking-tight bg-slate-900 text-white shadow">
                  {c.status === 'published' ? <span className="text-green-400">● PUBLISHED</span> : <span className="text-amber-400">● DRAFT</span>}
                </div>
              </div>

              <div className="flex-1 w-full md:w-auto self-start md:self-center">
                <p className="text-xs text-blue-400 font-bold mb-1">{c.category?.name}</p>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{c.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-3">
                  <span className="flex items-center gap-1 font-mono">💵 {c.isFree ? 'Miễn phí' : c.price + 'đ'}</span>
                  <span className="flex items-center gap-1">👥 {c.totalStudents} học viên</span>
                  <span className="flex items-center gap-1 text-amber-400">★ {c.averageRating || '0'}</span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => navigate(`/instructor/edit-course/${c._id}`)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 hover:text-white text-slate-300 font-medium text-sm rounded-lg transition-colors flex-1 md:flex-none text-center">
                  Sửa
                </button>
                {c.status === 'draft' && (
                  <>
                    <button onClick={() => handleDelete(c._id)} className="px-4 py-2 border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 text-red-500 text-sm font-medium rounded-lg transition text-center flex-1 md:flex-none">
                      Xoá
                    </button>
                    <button onClick={() => handlePublish(c._id)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 rounded-lg transition-all text-center flex-1 md:flex-none">
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
