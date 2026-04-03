import { useState, useEffect, useCallback } from 'react';
import { adminCourseReviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Course card ──────────────────────────────────────────────────
function CourseCard({ course, onApprove, onReject, onViewDetail, loading }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
      <div className="flex gap-5 items-start">
        {/* Thumbnail */}
        <div className="w-40 aspect-video bg-slate-800 rounded-xl overflow-hidden shrink-0">
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-slate-600 text-2xl">🎓</div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-blue-400 font-semibold mb-1">{course.category?.name}</p>
          <h3 className="text-base font-bold text-white mb-1 line-clamp-2">{course.title}</h3>
          <p className="text-xs text-slate-400 mb-2">
            👤 {course.instructor?.name} · {course.instructor?.email}
          </p>

          {course.updateNote && (
            <div className="text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mb-2">
              <span className="font-bold text-slate-400">Ghi chú cập nhật:</span> {course.updateNote}
            </div>
          )}

          {course.updateType && (
            <span className="inline-block px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full mb-2">
              {course.updateType}
            </span>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
            <span>📚 {course.totalLectures || 0} bài học</span>
            <span>💵 {course.price ? course.price.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}</span>
            <span>🕒 {course.submittedAt ? new Date(course.submittedAt).toLocaleDateString('vi-VN') : '—'}</span>
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onViewDetail(course._id)}
              className="px-4 py-1.5 text-xs border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
            >
              🔍 Xem chi tiết
            </button>
            <button
              onClick={() => onApprove(course._id)}
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold rounded-lg transition disabled:opacity-50"
            >
              ✅ Duyệt cập nhật
            </button>
            <button
              onClick={() => onReject(course._id)}
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-lg transition disabled:opacity-50"
            >
              ❌ Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────
function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">❌ Từ chối cập nhật</h3>
        <p className="text-sm text-slate-400 mb-3">Vui lòng nhập lý do từ chối để giảng viên biết cần điều chỉnh gì.</p>
        <textarea
          autoFocus rows={4} value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Nội dung cập nhật chưa đáp ứng yêu cầu vì..."
          className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none resize-none"
        />
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onCancel} className="px-5 py-2 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm transition">Huỷ</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────
function DetailModal({ courseId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminCourseReviewAPI.getByIdForReview(courseId)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Không thể tải chi tiết'))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">📋 Chi tiết khoá học</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-xl">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" /></div>
          ) : data ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">{data.title}</h2>
              <p className="text-sm text-slate-400">{data.description}</p>

              {Array.isArray(data.chapters) && data.chapters.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nội dung khoá học</p>
                  {data.chapters.map((ch, i) => (
                    <div key={ch._id || i} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-slate-800/80 font-semibold text-sm text-white">
                        Chương {i + 1}: {ch.title}
                      </div>
                      {ch.lessons?.length > 0 && (
                        <ul className="px-4 py-2 space-y-1">
                          {ch.lessons.map((l, j) => (
                            <li key={l._id || j} className="flex items-center gap-2 text-sm text-slate-300 py-1">
                              <span className="text-slate-500">{j + 1}.</span>
                              <span>{l.title}</span>
                              <span className="text-xs text-slate-500 ml-auto">{l.type}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Khoá học chưa có nội dung chương/bài.</p>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Không tải được dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function AdminCourseUpdateReview() {
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actLoading, setAct]    = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCourseReviewAPI.getPendingUpdates();
      setCourses(res.data.courses || []);
    } catch {
      toast.error('Không thể tải danh sách khoá học cập nhật');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleApprove = async (courseId) => {
    if (!window.confirm('Duyệt cập nhật khoá học này?')) return;
    setAct(true);
    try {
      await adminCourseReviewAPI.approve(courseId);
      toast.success('✅ Đã duyệt cập nhật khoá học!');
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi duyệt');
    } finally {
      setAct(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!reason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    setAct(true);
    try {
      await adminCourseReviewAPI.reject(rejectTarget, reason);
      toast.success('Đã từ chối cập nhật khoá học');
      setRejectTarget(null);
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi từ chối');
    } finally {
      setAct(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">🔄 Duyệt cập nhật khoá học</h1>
          <p className="text-sm text-slate-400 mt-1">Các khoá học đã được duyệt trước đây và đang gửi yêu cầu cập nhật</p>
        </div>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400 font-bold">
          {courses.length} khoá học
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-slate-300 font-semibold">Không có khoá học cập nhật nào đang chờ duyệt</p>
          <p className="text-sm text-slate-500 mt-2">Tất cả các khoá học cập nhật đã được xử lý!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(c => (
            <CourseCard
              key={c._id}
              course={c}
              loading={actLoading}
              onApprove={handleApprove}
              onReject={(id) => setRejectTarget(id)}
              onViewDetail={(id) => setDetailTarget(id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {rejectTarget && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}
      {detailTarget && (
        <DetailModal
          courseId={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
}
