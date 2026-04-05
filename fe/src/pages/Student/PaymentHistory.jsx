import { useState, useEffect } from 'react';
import { paymentAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.getMyPayments();
      setPayments(res.data.data || []);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  };

  const fmt = (n) => Number(n).toLocaleString('vi-VN');

  const statusColors = {
    success: 'bg-green-500/15 text-green-400 border-green-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };
  const statusLabels = { success: '✅ Thành công', pending: '⏳ Đang chờ', failed: '❌ Thất bại', cancelled: '🚫 Đã huỷ' };
  const methodLabels = { momo: '💳 MoMo', momo_mock: '🧪 Mock', atm: '🏦 ATM', bank: '📱 Chuyển khoản' };

  if (loading) return (
    <div className="p-6 animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-800 rounded-2xl"></div>)}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">💳 Lịch sử thanh toán</h1>
          <p className="text-sm text-slate-400 mt-1">Tổng: {payments.length} giao dịch</p>
        </div>
        <button onClick={loadPayments} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition-all flex items-center gap-2">
          🔄 Làm mới
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-white mb-2">Chưa có giao dịch nào</h3>
          <p className="text-sm text-slate-400 mb-5">Khi bạn mua khoá học, lịch sử giao dịch sẽ hiển thị ở đây</p>
          <Link to="/courses" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all">
            Khám phá khoá học →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                  {p.course?.thumbnail
                    ? <img src={p.course.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">📚</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm truncate">{p.course?.title || p.orderInfo || 'Khoá học'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-mono">{p.orderId}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{new Date(p.paidAt || p.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0 hidden sm:block">{methodLabels[p.method] || p.method}</div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-amber-400 text-sm">{fmt(p.amount)}đ</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[p.status]}`}>
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
