import { useState, useEffect, useCallback } from 'react';
import { payoutAPI, walletAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_MAP = {
  pending:    { label: 'Chờ duyệt',   cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',     icon: '⏳' },
  processing: { label: 'Đang xử lý', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',         icon: '🔄' },
  completed:  { label: 'Đã chi trả', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: '✅' },
  rejected:   { label: 'Từ chối',     cls: 'bg-red-500/15 text-red-400 border-red-500/30',            icon: '❌' },
};
const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Đã chi trả' },
  { key: 'rejected', label: 'Từ chối' },
];

function ApproveModal({ payout, onClose, onDone }) {
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!txId.trim()) return toast.error('Vui lòng nhập mã giao dịch');
    try {
      setLoading(true);
      await payoutAPI.approve(payout._id, txId.trim());
      toast.success('✅ Đã duyệt và xác nhận chi trả!');
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi duyệt payout');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-1">✅ Xác nhận chi trả</h3>
        <p className="text-sm text-slate-400 mb-5">Nhập mã giao dịch sau khi bạn đã chuyển khoản cho instructor</p>
        <div className="bg-slate-800 rounded-xl p-4 mb-5 space-y-2">
          <p className="text-xs text-slate-500">Instructor: <span className="text-white font-semibold">{payout.instructor?.name}</span></p>
          <p className="text-xs text-slate-500">Số tiền: <span className="text-emerald-400 font-bold text-sm">{fmt(payout.amount)}</span></p>
          <p className="text-xs text-slate-500">Ngân hàng: <span className="text-white font-semibold">{payout.bankInfoSnapshot?.bankName}</span></p>
          <p className="text-xs text-slate-500">Số TK: <span className="text-white font-mono font-bold tracking-widest">{payout.bankInfoSnapshot?.accountNumber}</span></p>
          <p className="text-xs text-slate-500">Tên TK: <span className="text-white font-semibold">{payout.bankInfoSnapshot?.accountName}</span></p>
        </div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mã giao dịch ngân hàng *</label>
        <input
          id="txId-input" autoFocus value={txId} onChange={e => setTxId(e.target.value)}
          placeholder="VD: FT26XXXXXX hoặc số tham chiếu GD"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all mb-4 placeholder:text-slate-600"
          onKeyDown={e => e.key === 'Enter' && handleApprove()}
        />
        <div className="flex gap-3">
          <button onClick={handleApprove} disabled={loading || !txId.trim()}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-lg">
            {loading ? '⏳ Đang xử lý…' : '✅ Xác nhận đã chuyển khoản'}
          </button>
          <button onClick={onClose} className="px-5 border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-xl transition-all">Huỷ</button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ payout, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return toast.error('Vui lòng nhập lý do từ chối');
    try {
      setLoading(true);
      await payoutAPI.reject(payout._id, reason.trim());
      toast.success('Đã từ chối yêu cầu rút tiền');
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi từ chối payout');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-1">❌ Từ chối yêu cầu</h3>
        <p className="text-sm text-slate-400 mb-4"><span className="font-bold text-white">{payout.instructor?.name}</span> — {fmt(payout.amount)}</p>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Lý do từ chối *</label>
        <textarea autoFocus rows={3} value={reason} onChange={e => setReason(e.target.value)}
          placeholder="VD: Thông tin tài khoản không hợp lệ, số tài khoản sai…"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all mb-4 placeholder:text-slate-600"
        />
        <div className="flex gap-3">
          <button onClick={handleReject} disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-lg">
            {loading ? '⏳…' : '❌ Xác nhận từ chối'}
          </button>
          <button onClick={onClose} className="px-5 border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-xl transition-all">Huỷ</button>
        </div>
      </div>
    </div>
  );
}

function PayoutCard({ payout, onRefresh }) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const st = STATUS_MAP[payout.status] || STATUS_MAP.pending;
  const canAct = ['pending', 'processing'].includes(payout.status);

  const handleProcess = async () => {
    if (payout.status !== 'pending') return;
    try {
      setProcessing(true);
      await payoutAPI.process(payout._id);
      toast.success('Đã chuyển sang đang xử lý');
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    } finally { setProcessing(false); }
  };

  const handleDone = () => { setApproveOpen(false); setRejectOpen(false); onRefresh(); };

  return (
    <>
      {approveOpen && <ApproveModal payout={payout} onClose={() => setApproveOpen(false)} onDone={handleDone} />}
      {rejectOpen && <RejectModal payout={payout} onClose={() => setRejectOpen(false)} onDone={handleDone} />}

      <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 flex-shrink-0">
              {payout.instructor?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{payout.instructor?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{payout.instructor?.email}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-extrabold text-white">{fmt(payout.amount)}</p>
            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-bold rounded-lg border ${st.cls}`}>{st.icon} {st.label}</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl px-4 py-3 mb-4 space-y-1.5">
          <div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-20">Ngân hàng</span><span className="text-xs font-semibold text-white">{payout.bankInfoSnapshot?.bankName || '—'}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-20">Số TK</span><span className="text-xs font-mono font-bold text-white tracking-widest">{payout.bankInfoSnapshot?.accountNumber || '—'}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-20">Tên TK</span><span className="text-xs font-semibold text-white">{payout.bankInfoSnapshot?.accountName || '—'}</span></div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span>📅 Gửi: {fmtDate(payout.createdAt)}</span>
          {payout.processedAt && <span>⚡ XL: {fmtDate(payout.processedAt)}</span>}
        </div>

        {payout.rejectedReason && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-400">❌ Lý do từ chối: <span className="font-medium">{payout.rejectedReason}</span></p>
          </div>
        )}
        {payout.transactionId && (
          <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-xs text-emerald-400">✅ Mã GD: <span className="font-mono font-bold">{payout.transactionId}</span></p>
          </div>
        )}

        {canAct && (
          <div className="flex gap-2">
            {payout.status === 'pending' && (
              <button onClick={handleProcess} disabled={processing}
                className="px-3 py-2 text-xs font-bold border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all disabled:opacity-50">
                {processing ? '⏳' : '🔄 Bắt đầu xử lý'}
              </button>
            )}
            <button onClick={() => setApproveOpen(true)}
              className="flex-1 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg transition-all shadow-md shadow-emerald-500/20">
              ✅ Duyệt & xác nhận
            </button>
            <button onClick={() => setRejectOpen(true)}
              className="px-4 py-2 text-xs font-bold border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">
              ❌ Từ chối
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function WalletsOverview({ wallets, onRefresh }) {
  const [editId, setEditId] = useState(null);
  const [newRate, setNewRate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveRate = async (walletId) => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0 || rate > 1) return toast.error('Tỷ lệ phải từ 0.01 đến 1.00');
    try {
      setSaving(true);
      await walletAPI.updateRate(walletId, rate);
      toast.success(`Đã cập nhật tỷ lệ HH: ${Math.round(rate * 100)}%`);
      setEditId(null);
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    } finally { setSaving(false); }
  };

  if (!wallets?.length) return (
    <div className="text-center py-10 text-slate-500"><p className="text-3xl mb-2">💼</p><p className="text-sm">Chưa có ví giảng viên nào</p></div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            {['Giảng viên', 'Số dư', 'Đang rút', 'Tổng nhận', 'Đã rút', 'Tỷ lệ HH', ''].map(h => (
              <th key={h} className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wallets.map(w => (
            <tr key={w._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-all">
              <td className="px-3 py-4"><div><p className="font-semibold text-white text-sm">{w.instructor?.name}</p><p className="text-xs text-slate-500">{w.instructor?.email}</p></div></td>
              <td className="px-3 py-4 text-emerald-400 font-bold font-mono">{fmt(w.balance)}</td>
              <td className="px-3 py-4 text-amber-400 font-mono">{fmt(w.pendingPayout)}</td>
              <td className="px-3 py-4 text-blue-400 font-mono">{fmt(w.totalEarned)}</td>
              <td className="px-3 py-4 text-slate-400 font-mono">{fmt(w.totalWithdrawn)}</td>
              <td className="px-3 py-4">
                {editId === w._id ? (
                  <div className="flex items-center gap-2">
                    <input type="number" min="0.01" max="1" step="0.01" value={newRate} onChange={e => setNewRate(e.target.value)}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500" />
                    <button onClick={() => handleSaveRate(w._id)} disabled={saving} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-lg">✓</button>
                    <button onClick={() => setEditId(null)} className="text-xs text-slate-500 hover:text-white">✕</button>
                  </div>
                ) : (
                  <span className="px-2 py-1 text-xs font-bold rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    {Math.round((w.commissionRate || 0.7) * 100)}%
                  </span>
                )}
              </td>
              <td className="px-3 py-4">
                {editId !== w._id && (
                  <button onClick={() => { setEditId(w._id); setNewRate(String(w.commissionRate || 0.7)); }}
                    className="text-xs text-slate-500 hover:text-white border border-slate-700 hover:border-slate-600 px-2 py-1 rounded-lg transition-all">
                    Sửa %
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPayouts() {
  const [tab, setTab] = useState('all');
  const [viewTab, setViewTab] = useState('payouts');
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(null);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      const params = tab !== 'all' ? { status: tab } : {};
      const res = await payoutAPI.getAll(params);
      setPayouts(res.data.data || []);
      setStats(res.data.stats || null);
    } catch { toast.error('Không thể tải dữ liệu payout'); }
    finally { setLoading(false); }
  }, [tab]);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await walletAPI.getAllWallets();
      setWallets(res.data.data || []);
    } catch { setWallets([]); }
  }, []);

  const fetchRevenue = useCallback(async () => {
    try {
      const res = await paymentAPI.getStats();
      setRevenue(res.data.data || null);
    } catch { setRevenue(null); }
  }, []);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);
  useEffect(() => { fetchWallets(); }, [fetchWallets]);
  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const refresh = () => { fetchPayouts(); fetchWallets(); fetchRevenue(); };

  const STAT_CARDS = stats ? [
    { icon: '⏳', label: 'Chờ duyệt',   value: stats.pending,    gradient: 'from-amber-600 to-orange-700', alert: stats.pending },
    { icon: '🔄', label: 'Đang xử lý', value: stats.processing, gradient: 'from-blue-600 to-indigo-700' },
    { icon: '✅', label: 'Đã chi trả',  value: stats.completed,  gradient: 'from-emerald-600 to-teal-700' },
    { icon: '💰', label: 'Tổng đã trả', value: fmt(stats.totalPaid), gradient: 'from-purple-600 to-pink-700' },
  ] : [];

  return (
    <div className="animate-fade-in max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">💳 Quản lý Chi trả Giảng viên</h1>
        <p className="text-slate-400 text-sm">Xét duyệt yêu cầu rút tiền và quản lý ví instructor</p>
      </div>

      {revenue && (
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">💰 Tổng quan doanh thu Platform</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Tổng thu từ học viên</p>
              <p className="text-xl font-extrabold text-white">{Number(revenue.totalAmount||0).toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-slate-600 mt-0.5">{revenue.success} giao dịch</p>
            </div>
            <div className="text-center border-x border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Platform nhận (30%)</p>
              <p className="text-xl font-extrabold text-blue-400">{Number(revenue.totalPlatformFee||0).toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-slate-600 mt-0.5">Lợi nhuận thuần</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Đã trả giảng viên (70%)</p>
              <p className="text-xl font-extrabold text-purple-400">{Number(revenue.totalCommission||0).toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-slate-600 mt-0.5">Tích luỹ vào ví GV</p>
            </div>
          </div>
          {revenue.totalAmount > 0 && (
            <div className="mt-4">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${((revenue.totalCommission / revenue.totalAmount) * 100).toFixed(1)}%` }} />
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${((revenue.totalPlatformFee / revenue.totalAmount) * 100).toFixed(1)}%` }} />
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />GV: {((revenue.totalCommission / revenue.totalAmount) * 100).toFixed(0)}%</div>
                <div className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Platform: {((revenue.totalPlatformFee / revenue.totalAmount) * 100).toFixed(0)}%</div>
              </div>
            </div>
          )}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(s => (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${s.gradient} shadow-lg`}>
              {s.alert > 0 && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-black text-white animate-pulse">{s.alert}</span>
              )}
              <div className="absolute -right-3 -top-3 text-5xl opacity-10 select-none">{s.icon}</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold text-white leading-none">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {[{ key: 'payouts', label: '📋 Yêu cầu rút tiền' }, { key: 'wallets', label: '💼 Ví instructor' }].map(v => (
          <button key={v.key} onClick={() => setViewTab(v.key)}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${viewTab === v.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 bg-slate-900'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {viewTab === 'payouts' ? (
        <>
          <div className="flex gap-1 mb-5 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === t.key ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                {t.label}
                {t.key === 'pending' && stats?.pending > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">{stats.pending}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-900 rounded-2xl animate-pulse" />)}</div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-400 text-sm font-medium">Không có yêu cầu nào</p>
              <p className="text-slate-600 text-xs mt-1">
                {tab === 'all' ? 'Chưa có instructor nào yêu cầu rút tiền' : `Không có yêu cầu nào ở trạng thái "${TABS.find(t => t.key === tab)?.label}"`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {payouts.map(p => <PayoutCard key={p._id} payout={p} onRefresh={refresh} />)}
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><span>💼</span> Ví của tất cả giảng viên</h2>
          <WalletsOverview wallets={wallets} onRefresh={fetchWallets} />
        </div>
      )}
    </div>
  );
}
