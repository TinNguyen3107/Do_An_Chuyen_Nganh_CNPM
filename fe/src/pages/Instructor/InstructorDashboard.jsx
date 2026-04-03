import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import toast from 'react-hot-toast';

const REVIEW_BADGE = {
  pending:  { label: '⏳ Chờ duyệt', cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  approved: { label: '✅ Đã duyệt',  cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  rejected: { label: '❌ Bị từ chối', cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null); // courseId đang submit
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

  const handleSubmit = async (id) => {
    if (!window.confirm('Gửi khoá học này để Admin duyệt?')) return;
    setSubmitting(id);
    try {
      await courseAPI.submit(id);
      toast.success('Đã gửi duyệt thành công! Admin sẽ xem xét sớm nhất 🎉');
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi gửi duyệt');
    } finally {
      setSubmitting(null);
    }
  };

  const canSubmit = (c) =>
    c.status === 'published' &&
    !(c.reviewStatus === 'pending' && c.submittedAt);

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
          {courses.map(c => {
            const badge = REVIEW_BADGE[c.reviewStatus];
            return (
              <div key={c._id} className="flex flex-col md:flex-row gap-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl items-center hover:border-slate-700 transition">
                {/* Thumbnail */}
                <div className="w-full md:w-56 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-black/50 shadow-lg relative">
                  {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" alt={c.title} /> : <div className="w-full h-full flex justify-center items-center text-slate-500">No Image</div>}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold font-mono tracking-tight bg-slate-900 text-white shadow">
                    {c.status === 'published' ? <span className="text-green-400">● PUBLISHED</span> : <span className="text-amber-400">● DRAFT</span>}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 w-full md:w-auto self-start md:self-center">
                  <p className="text-xs text-blue-400 font-bold mb-1">{c.category?.name}</p>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{c.title}</h3>

                  {/* Review status badge */}
                  {badge && (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  )}

                  {/* Rejection reason */}
                  {c.reviewStatus === 'rejected' && c.rejectionReason && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-2">
                      <span className="font-bold">Lý do từ chối:</span> {c.rejectionReason}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-mono">💵 {c.isFree ? 'Miễn phí' : c.price + 'đ'}</span>
                    <span className="flex items-center gap-1">👥 {c.totalStudents} học viên</span>
                    <span className="flex items-center gap-1">📖 {c.totalLectures || 0} bài học</span>
                    <span className="flex items-center gap-1 text-amber-400">★ {c.averageRating || '0'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/instructor/edit-course/${c._id}`)}
                    className="px-4 py-2 border border-slate-700 hover:bg-slate-800 hover:text-white text-slate-300 font-medium text-sm rounded-lg transition-colors flex-1 md:flex-none text-center"
                  >
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

                  {canSubmit(c) && (
                    <button
                      onClick={() => handleSubmit(c._id)}
                      disabled={submitting === c._id}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 rounded-lg transition-all flex-1 md:flex-none disabled:opacity-50"
                    >
                      {submitting === c._id ? '...' : c.reviewStatus === 'approved' ? 'Gửi cập nhật' : 'Gửi duyệt'}
                    </button>
                  )}

                  {c.reviewStatus === 'pending' && c.submittedAt && (
                    <span className="px-4 py-2 text-amber-400 text-sm font-medium flex-1 md:flex-none text-center">
                      Đang chờ duyệt...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
