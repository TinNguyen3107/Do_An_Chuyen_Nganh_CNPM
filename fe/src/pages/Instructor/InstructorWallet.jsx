import { useState, useEffect, useCallback } from 'react';
import { walletAPI, payoutAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_MAP = {
  pending:    { label: 'Chờ duyệt',    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',     icon: '⏳' },
  processing: { label: 'Đang xử lý',  cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',         icon: '🔄' },
  completed:  { label: 'Đã chi trả',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: '✅' },
  rejected:   { label: 'Từ chối',      cls: 'bg-red-500/15 text-red-400 border-red-500/30',            icon: '❌' },
};

function StatCard({ icon, label, value, sub, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} shadow-lg`}>
      <div className="absolute -right-4 -top-4 text-6xl opacity-10 select-none">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-white leading-none mb-1">{value}</p>
      {sub && <p className="text-xs text-white/50 mt-1">{sub}</p>}
    </div>
  );
}

function BankInfoCard({ wallet, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    bankName: wallet?.bankInfo?.bankName || '',
    accountNumber: wallet?.bankInfo?.accountNumber || '',
    accountName: wallet?.bankInfo?.accountName || '',
    branch: wallet?.bankInfo?.branch || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      bankName: wallet?.bankInfo?.bankName || '',
      accountNumber: wallet?.bankInfo?.accountNumber || '',
      accountName: wallet?.bankInfo?.accountName || '',
      branch: wallet?.bankInfo?.branch || '',
    });
  }, [wallet]);

  const hasBank = wallet?.bankInfo?.bankName && wallet?.bankInfo?.accountNumber;

  const handleSave = async () => {
    try {
      setSaving(true);
      await walletAPI.updateBankInfo(form);
      toast.success('Cập nhật thông tin ngân hàng thành công! 🏦');
      setEditing(false);
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi cập nhật');
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><span className="text-2xl">🏦</span> Thông tin ngân hàng</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-4 py-1.5 text-sm font-medium border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 rounded-lg transition-all">
            ✏️ {hasBank ? 'Cập nhật' : 'Thêm mới'}
          </button>
        )}
      </div>

      {!editing ? (
        hasBank ? (
          <div className="space-y-3">
            {[
              { label: 'Ngân hàng', value: form.bankName, icon: '🏛️' },
              { label: 'Số tài khoản', value: form.accountNumber, icon: '💳', mono: true },
              { label: 'Tên chủ TK', value: form.accountName, icon: '👤' },
              { label: 'Chi nhánh', value: form.branch || '—', icon: '📍' },
            ].map(({ label, value, icon, mono }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                <span className="w-7 text-center text-base">{icon}</span>
                <span className="text-xs text-slate-500 w-24 flex-shrink-0">{label}</span>
                <span className={`text-sm font-semibold text-white ${mono ? 'font-mono tracking-widest' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl">
            <p className="text-4xl mb-3">🏦</p>
            <p className="text-slate-400 text-sm">Chưa có thông tin ngân hàng</p>
            <p className="text-slate-500 text-xs mt-1">Thêm để có thể yêu cầu rút tiền</p>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {[
            { key: 'bankName', label: 'Tên ngân hàng *', placeholder: 'VD: Vietcombank, MB Bank, …' },
            { key: 'accountNumber', label: 'Số tài khoản *', placeholder: '0123456789', mono: true },
            { key: 'accountName', label: 'Tên chủ tài khoản *', placeholder: 'NGUYEN VAN A (viết hoa)' },
            { key: 'branch', label: 'Chi nhánh', placeholder: 'VD: CN Hà Nội (tuỳ chọn)' },
          ].map(({ key, label, placeholder, mono }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
              <input
                className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600 ${mono ? 'font-mono tracking-widest' : ''}`}
                value={form[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
              {saving ? '⏳ Đang lưu…' : '💾 Lưu thông tin'}
            </button>
            <button onClick={() => setEditing(false)} className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-xl transition-all">Huỷ</button>
          </div>
        </div>
      )}
    </div>
  );
}

function WithdrawForm({ wallet, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const balance = wallet?.balance ?? 0;
  const hasBank = wallet?.bankInfo?.bankName && wallet?.bankInfo?.accountNumber;
  const hasPending = wallet?.pendingPayout > 0;
  const QUICK = [100_000, 300_000, 500_000, 1_000_000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt < 100_000) return toast.error('Số tiền tối thiểu là 100,000đ');
    if (amt > balance) return toast.error(`Số dư không đủ (${fmt(balance)})`);
    try {
      setLoading(true);
      await payoutAPI.request(amt);
      toast.success('✅ Yêu cầu rút tiền đã được gửi!');
      setAmount('');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi gửi yêu cầu');
    } finally { setLoading(false); }
  };

  const disabled = !hasBank || hasPending || loading;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5"><span className="text-2xl">📤</span> Rút tiền</h2>

      {!hasBank && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
          <span className="text-amber-400">⚠️</span>
          <p className="text-xs text-amber-300">Vui lòng thêm thông tin ngân hàng trước khi rút tiền</p>
        </div>
      )}
      {hasPending && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
          <span className="text-blue-400">⏳</span>
          <p className="text-xs text-blue-300">Bạn đang có yêu cầu rút <strong>{fmt(wallet.pendingPayout)}</strong> đang chờ duyệt</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Số tiền rút (tối thiểu 100,000đ)</label>
          <div className="relative">
            <input
              type="number" min="100000" max={balance} step="1000" value={amount}
              onChange={(e) => setAmount(e.target.value)} disabled={disabled} placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-white font-mono text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-600"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Số dư khả dụng: <span className="text-emerald-400 font-bold">{fmt(balance)}</span></p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK.filter(q => q <= balance).map(q => (
            <button key={q} type="button" disabled={disabled} onClick={() => setAmount(String(q))}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${Number(amount) === q ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-blue-400'}`}>
              {(q / 1000).toFixed(0)}K
            </button>
          ))}
          {balance >= 100_000 && (
            <button type="button" disabled={disabled} onClick={() => setAmount(String(balance))}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${Number(amount) === balance ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400'}`}>
              Tối đa
            </button>
          )}
        </div>

        <button type="submit" disabled={disabled || !amount}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 text-sm">
          {loading ? '⏳ Đang gửi yêu cầu…' : `💰 Yêu cầu rút ${amount ? fmt(Number(amount)) : ''}`}
        </button>
      </form>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-slate-500 w-24 flex-shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-white ${mono ? 'font-mono tracking-wider' : ''}`}>{value || '—'}</span>
    </div>
  );
}

function PayoutHistory({ payouts, loading }) {
  const [expanded, setExpanded] = useState(null);
  if (loading) return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-800 rounded-xl" />)}</div>
    </div>
  );
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5"><span className="text-2xl">📋</span> Lịch sử rút tiền</h2>
      {payouts.length === 0 ? (
        <div className="text-center py-10 text-slate-500"><p className="text-3xl mb-2">📭</p><p className="text-sm">Chưa có lịch sử rút tiền nào</p></div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => {
            const st = STATUS_MAP[p.status] || STATUS_MAP.pending;
            const isOpen = expanded === p._id;
            return (
              <div key={p._id} className="border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all">
                <button onClick={() => setExpanded(isOpen ? null : p._id)}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-slate-800/50 transition-all">
                  <span className="text-xl">{st.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{fmt(p.amount)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{fmtDate(p.createdAt)}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${st.cls}`}>{st.label}</span>
                  <span className={`text-slate-500 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-800 bg-slate-800/30 space-y-2">
                    <Detail label="Ngân hàng" value={p.bankInfoSnapshot?.bankName} />
                    <Detail label="Số TK" value={p.bankInfoSnapshot?.accountNumber} mono />
                    <Detail label="Tên TK" value={p.bankInfoSnapshot?.accountName} />
                    {p.transactionId && <Detail label="Mã GD" value={p.transactionId} mono />}
                    {p.rejectedReason && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400">❌ Lý do từ chối: <span className="font-medium">{p.rejectedReason}</span></p>
                      </div>
                    )}
                    {p.processedAt && <Detail label="Xử lý lúc" value={fmtDate(p.processedAt)} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InstructorWallet() {
  const [wallet, setWallet] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  const fetchWallet = useCallback(async () => {
    try {
      setLoadingWallet(true);
      const res = await walletAPI.getMyWallet();
      setWallet(res.data.data);
    } catch { toast.error('Không thể tải thông tin ví'); }
    finally { setLoadingWallet(false); }
  }, []);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoadingPayouts(true);
      const res = await payoutAPI.getMyPayouts();
      setPayouts(res.data.data || []);
    } catch { setPayouts([]); }
    finally { setLoadingPayouts(false); }
  }, []);

  const refresh = useCallback(() => { fetchWallet(); fetchPayouts(); }, [fetchWallet, fetchPayouts]);
  useEffect(() => { refresh(); }, [refresh]);

  const STATS = wallet ? [
    { icon: '💰', label: 'Số dư khả dụng', value: fmt(wallet.balance), sub: 'Có thể rút ngay', gradient: 'from-emerald-600 to-teal-700' },
    { icon: '⏳', label: 'Đang rút', value: fmt(wallet.pendingPayout), sub: 'Chờ Admin duyệt', gradient: 'from-amber-600 to-orange-700' },
    { icon: '📈', label: 'Tổng đã nhận', value: fmt(wallet.totalEarned), sub: `Tỷ lệ HH: ${Math.round((wallet.commissionRate || 0.7) * 100)}%`, gradient: 'from-blue-600 to-indigo-700' },
    { icon: '✅', label: 'Đã rút thành công', value: fmt(wallet.totalWithdrawn), sub: `${payouts.filter(p => p.status === 'completed').length} lần rút`, gradient: 'from-purple-600 to-pink-700' },
  ] : [];

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">💰 Ví của tôi</h1>
        <p className="text-slate-400 text-sm">Quản lý thu nhập và các yêu cầu rút tiền</p>
      </div>

      {loadingWallet ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BankInfoCard wallet={wallet} onSaved={fetchWallet} />
        <WithdrawForm wallet={wallet} onSuccess={refresh} />
      </div>

      <PayoutHistory payouts={payouts} loading={loadingPayouts} />
    </div>
  );
}
