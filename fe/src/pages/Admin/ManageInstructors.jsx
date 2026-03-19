import { useState, useEffect } from 'react';
import { instructorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  pending: { label: 'Chờ duyệt', color: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
  approved: { label: 'Đã duyệt', color: 'bg-green-500/15 border-green-500/30 text-green-300' },
  rejected: { label: 'Từ chối', color: 'bg-red-500/15 border-red-500/30 text-red-300' },
};

export default function ManageInstructors() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejNote, setRejNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Lấy danh sách hồ sơ đăng ký
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await instructorAPI.getAllApplications(params);

      // Khớp với cấu trúc trả về: { applications, total, ... }
      const data = res.data.data || res.data;
      setApplications(data.applications || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  // Xử lý Phê duyệt
  const handleApprove = async (id) => {
    if (!window.confirm('Xác nhận phê duyệt ứng viên này thành Giảng viên?')) return;

    setActionLoading(true);
    try {
      await instructorAPI.approve(id);
      toast.success('✅ Đã phê duyệt giảng viên thành công!');
      fetchApplications();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi phê duyệt');
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý Từ chối
  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      // Truyền id và adminNote vào API reject
      await instructorAPI.reject(id, rejNote || 'Hồ sơ chưa đạt yêu cầu');
      toast.success('Đã từ chối hồ sơ giảng viên');
      fetchApplications();
      setSelected(null);
      setRejNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Phê duyệt Giảng viên</h1>
          <p className="text-slate-400 mt-1">{total} hồ sơ · Quản lý quyền giảng dạy</p>
        </div>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="flex gap-2 mb-6 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit">
        {[
          { val: 'pending', label: 'Chờ duyệt', icon: '⏳' },
          { val: 'approved', label: 'Đã duyệt', icon: '✅' },
          { val: 'rejected', label: 'Từ chối', icon: '❌' },
          { val: '', label: 'Tất cả', icon: '📋' },
        ].map(tab => (
          <button
            key={tab.val}
            onClick={() => setStatusFilter(tab.val)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${statusFilter === tab.val ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3 mb-4"><div className="w-12 h-12 bg-slate-800 rounded-full" /><div className="flex-1"><div className="h-4 bg-slate-800 rounded w-1/2 mb-2" /><div className="h-3 bg-slate-800 rounded w-1/3" /></div></div>
              <div className="space-y-2"><div className="h-3 bg-slate-800 rounded" /><div className="h-3 bg-slate-800 rounded w-3/4" /></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-400">Không có hồ sơ nào trong mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map(app => {
            const user = app.user; // Dữ liệu từ populate('user')
            const statusInfo = STATUS_MAP[app.status] || STATUS_MAP.pending;
            return (
              <div
                key={app._id}
                className={`bg-slate-900 border rounded-2xl p-5 transition-all hover:border-slate-600 group ${selected?._id === app._id ? 'border-blue-500' : 'border-slate-800'}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-sm truncate">{user?.name || 'Ẩn danh'}</h3>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chuyên môn</span>
                    <p className="text-slate-300 text-xs mt-1 font-medium">{app.expertise || 'Chưa cập nhật'}</p>
                  </div>
                  {app.biography && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Giới thiệu</span>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{app.biography}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-500">{new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                  {app.cvUrl && (
                    <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                      Xem hồ sơ CV ↗
                    </a>
                  )}
                </div>

                {app.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleApprove(app._id)}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => setSelected(app)}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL TỪ CHỐI (REJECT) */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1">Lý do từ chối</h3>
            <p className="text-slate-400 text-sm mb-5 font-medium">Ứng viên: <span className="text-blue-400">{selected.user?.name}</span></p>

            <textarea
              rows={4}
              value={rejNote}
              onChange={e => setRejNote(e.target.value)}
              placeholder="Nhập lý do chi tiết để giúp ứng viên cải thiện hồ sơ..."
              className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none mb-5"
            />

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-bold text-sm transition-all">Hủy</button>
              <button
                onClick={() => handleReject(selected._id)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}