import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── Status helpers ──────────────────────────────────────────────────────────────
function StatusBadge({ course }) {
  // Trường hợp đặc biệt: đã xuất bản + đang chờ duyệt CẬP NHẬT
  // (phân biệt với khóa mới: reviewedAt != null = đã từng được admin xét duyệt rồi)
  const isPendingUpdate =
    course.status === 'published' &&
    course.reviewStatus === 'pending' &&
    course.submittedAt &&
    course.reviewedAt; // null = khóa mới chưa duyệt lần nào → KHÔNG phải update

  if (isPendingUpdate) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-500" />
          Đã xuất bản
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap bg-blue-500/10 text-blue-400 border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-400 animate-pulse" />
          Đang duyệt cập nhật
        </span>
      </div>
    );
  }

  // Badge đơn bình thường
  let cfg;
  if (course.status === 'draft' || !course.submittedAt) {
    // Draft và "published nhưng chưa submit" đều trông giống nhau với GV
    // → gộp chung thành "Chưa gửi duyệt"
    cfg = { label: 'Chưa gửi duyệt', dot: 'bg-slate-400', badge: 'bg-slate-700/80 text-slate-300 border-slate-600' };
  } else if (course.reviewStatus === 'pending' && course.submittedAt) {
    cfg = { label: 'Chờ duyệt', dot: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  } else if (course.reviewStatus === 'rejected') {
    cfg = { label: 'Bị từ chối', dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
  } else if (course.reviewStatus === 'approved') {
    cfg = { label: 'Đã xuất bản', dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  } else {
    cfg = { label: 'Chưa gửi duyệt', dot: 'bg-slate-400', badge: 'bg-slate-700/80 text-slate-300 border-slate-600' };
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}



// ── Stat card ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}/10`}>
        <span className={`text-xl ${color.replace('bg-', 'text-')}`}>{value}</span>
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function InstructorDashboard() {
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const fetchCourses = () => {
    setLoading(true);
    courseAPI.getMyCourses()
      .then(res => setCourses(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (course) => {
    let msg = 'Gửi khoá học này để Admin duyệt?';
    if (course.status === 'published' && course.reviewStatus === 'approved') {
      msg = 'Bạn muốn gửi duyệt cập nhật bài giảng cho Admin xem xét?';
    }
    if (!window.confirm(msg)) return;
    try {
      const res = await courseAPI.submit(course._id);
      toast.success(res.data.message || 'Đã gửi duyệt thành công!');
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi gửi duyệt');
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

  // ── Stats ────────────────────────────────────────────────────────────────────
  const total          = courses.length;
  const published      = courses.filter(c => c.status === 'published' && c.reviewStatus === 'approved' && !(
    c.reviewStatus === 'pending' && c.submittedAt && c.reviewedAt
  )).length;
  const pending        = courses.filter(c => c.reviewStatus === 'pending' && c.submittedAt && !c.reviewedAt).length;
  const pendingUpdate  = courses.filter(c => c.status === 'published' && c.reviewStatus === 'pending' && c.submittedAt && c.reviewedAt).length;
  const rejected       = courses.filter(c => c.reviewStatus === 'rejected').length;
  const notSubmitted   = courses.filter(c => c.status === 'draft' || !c.submittedAt).length;

  // ── Tab filter ───────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'all',            label: 'Tất cả',              count: total,         dot: 'bg-slate-400'    },
    { key: 'pending',        label: 'Chờ duyệt',           count: pending,       dot: 'bg-amber-500'    },
    { key: 'pendingUpdate',  label: 'Đang duyệt cập nhật', count: pendingUpdate, dot: 'bg-blue-400'     },
    { key: 'published',      label: 'Đã xuất bản',         count: published,     dot: 'bg-emerald-500'  },
    { key: 'rejected',       label: 'Bị từ chối',          count: rejected,      dot: 'bg-red-500'      },
    { key: 'notSubmitted',   label: 'Chưa gửi duyệt',      count: notSubmitted,  dot: 'bg-slate-500'    },
  ];

  const displayCourses = courses.filter(c => {
    if (activeTab === 'all')           return true;
    if (activeTab === 'pending')       return c.reviewStatus === 'pending' && c.submittedAt && !c.reviewedAt;
    if (activeTab === 'pendingUpdate') return c.status === 'published' && c.reviewStatus === 'pending' && c.submittedAt && c.reviewedAt;
    if (activeTab === 'published')     return c.status === 'published' && c.reviewStatus === 'approved';
    if (activeTab === 'rejected')      return c.reviewStatus === 'rejected';
    if (activeTab === 'notSubmitted')  return c.status === 'draft' || !c.submittedAt;
    return true;
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Khoá học</h1>
          <p className="text-slate-400 text-sm mt-1">Tạo, chỉnh sửa và theo dõi trạng thái khoá học của bạn</p>
        </div>
        <button
          onClick={() => navigate('/instructor/create-course')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white text-sm transition-all shadow-lg shadow-blue-500/25"
        >
          <span className="text-lg leading-none">+</span> Tạo khoá học mới
        </button>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng khoá học',  value: total,        icon: '📚', tab: 'all',          accent: 'border-blue-500'    },
            { label: 'Đã xuất bản',    value: published,    icon: '✅', tab: 'published',    accent: 'border-emerald-500' },
            { label: 'Chờ duyệt',      value: pending + pendingUpdate, icon: '⏳', tab: 'pending', accent: 'border-amber-500' },
            { label: 'Chưa gửi duyệt', value: notSubmitted, icon: '📝', tab: 'notSubmitted', accent: 'border-slate-500'   },
          ].map(s => (
            <button key={s.label}
              onClick={() => setActiveTab(s.tab)}
              className={`bg-slate-900 border border-slate-800 border-l-2 ${s.accent} rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-all hover:bg-slate-800/60 ${
                activeTab === s.tab ? 'ring-1 ring-white/10 bg-slate-800/60' : ''
              }`}>
              <span className="text-2xl leading-none select-none">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold leading-none text-white">{s.value}</p>
                <p className="text-slate-400 text-xs font-medium mt-1.5">{s.label}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      {!loading && courses.length > 0 && (
        <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-px">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tab.dot}`} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === tab.key ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center my-20">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
        </div>

      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center">
          <div className="text-4xl mb-4 text-slate-600">📝</div>
          <h2 className="text-lg font-bold text-white mb-2">Chưa có khoá học nào</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Bạn chưa tạo khoá học nào trên hệ thống. Bắt đầu chia sẻ kiến thức của bạn tới hàng ngàn học viên!
          </p>
        </div>

      ) : (
        /* ── Table ──────────────────────────────────────────────────────── */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <colgroup>
                <col style={{width:'auto'}} />
                <col style={{width:'110px'}} />
                <col style={{width:'110px'}} />
                <col style={{width:'90px'}} />
                <col style={{width:'80px'}} />
                <col style={{width:'130px'}} />
                <col style={{width:'190px'}} />
              </colgroup>

              {/* Header */}
              <thead className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-800/30">
                <tr>
                  <th className="px-5 py-3 font-medium">Khoá học</th>
                  <th className="px-4 py-3 font-medium text-center">Danh mục</th>
                  <th className="px-4 py-3 font-medium text-right">Giá</th>
                  <th className="px-4 py-3 font-medium text-right">Học viên</th>
                  <th className="px-4 py-3 font-medium text-right">Rating</th>
                  <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-800">
                {displayCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    Không có khoá học nào trong mục này
                  </td>
                </tr>
              ) : displayCourses.map(c => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">

                    {/* Khoá học */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                          {c.thumbnail
                            ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-600">📚</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white line-clamp-2 leading-snug text-sm">{c.title}</p>
                          {c.reviewStatus === 'rejected' && (
                            <p className="text-xs text-red-400 mt-0.5 line-clamp-1">⚠ {c.rejectionReason || 'Bị từ chối'}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Danh mục */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {c.category?.name || '—'}
                      </span>
                    </td>

                    {/* Giá */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-emerald-400 font-medium">
                        {c.isFree || c.price === 0 ? 'Miễn phí' : `${Number(c.price).toLocaleString('vi')}đ`}
                      </span>
                    </td>

                    {/* Học viên */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-slate-300 font-medium">{c.totalStudents ?? 0}</span>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-amber-400 font-medium">
                        {c.averageRating ? `★ ${c.averageRating}` : <span className="text-slate-600">—</span>}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge course={c} />
                    </td>

                    {/* Thao tác */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/instructor/edit-course/${c._id}?tab=curriculum`)}
                          title="Quản lý bài học"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/30 rounded-lg transition-colors"
                        >📚</button>
                        <button
                          onClick={() => navigate(`/instructor/edit-course/${c._id}?tab=basic`)}
                          title="Chỉnh sửa"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 rounded-lg transition-colors"
                        >✏️</button>

                        {c.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleDelete(c._id)}
                              title="Xoá bản nháp"
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition-colors"
                            >🗑️</button>
                            <button
                              onClick={() => handleSubmit(c)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow shadow-indigo-500/20 transition-all whitespace-nowrap"
                            >Gửi duyệt</button>
                          </>
                        )}

                        {/* Legacy: published nhưng chưa submit qua workflow đúng */}
                        {c.status === 'published' && c.reviewStatus === 'pending' && !c.submittedAt && (
                          <button
                            onClick={() => handleSubmit(c)}
                            title="Gửi khoá học này để Admin duyệt"
                            className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow shadow-indigo-500/20 transition-all whitespace-nowrap"
                          >Gửi duyệt</button>
                        )}

                        {c.status === 'published' && c.reviewStatus === 'rejected' && (
                          <button
                            onClick={() => handleSubmit(c)}
                            title="Gửi duyệt lại bản bị từ chối"
                            className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-lg shadow shadow-orange-500/20 transition-all whitespace-nowrap"
                          >Gửi lại</button>
                        )}

                        {c.status === 'published' && c.reviewStatus === 'approved' && (
                           <button
                             onClick={() => handleSubmit(c)}
                             title="Gửi bản cập nhật mới cho Admin"
                             className="px-3 py-1.5 text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 hover:text-blue-400 border border-slate-600 rounded-lg transition-all whitespace-nowrap"
                           >Gửi cập nhật</button>
                        )}

                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
