import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | failed | pending
  const [payment, setPayment] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');
  const transId = searchParams.get('transId');
  const message = searchParams.get('message');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    const processResult = async () => {
      // Step 1: If MoMo/ATM redirect returns resultCode=0 (success),
      // auto-confirm in our DB (since IPN can't reach localhost)
      if (resultCode === '0') {
        try {
          await paymentAPI.confirmBank(orderId, transId || `REDIRECT_${Date.now()}`);
          console.log('✅ Auto-confirmed payment via redirect resultCode=0');
        } catch (err) {
          console.log('Auto-confirm skipped:', err.response?.data?.message || err.message);
          // Already confirmed or other error — continue
        }
      } else if (resultCode && resultCode !== '0') {
        // MoMo returned a failure code
        setStatus('failed');
        return;
      }

      // Step 2: Fetch payment status from our DB
      try {
        const res = await paymentAPI.getStatus(orderId);
        const data = res.data.data;
        setPayment(data);

        if (data.status === 'success') {
          setStatus('success');
        } else if (data.status === 'failed') {
          setStatus('failed');
        } else {
          setStatus('pending');
        }
      } catch {
        // If we can't fetch status but MoMo said success, trust MoMo
        if (resultCode === '0') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      }
    };

    processResult();
  }, [orderId, resultCode, transId]);

  // Demo: manually confirm a pending payment
  const handleDemoConfirm = async () => {
    if (!orderId) return;
    setConfirming(true);
    try {
      await paymentAPI.confirmBank(orderId, `DEMO_CONFIRM_${Date.now()}`);
      setStatus('success');
      toast.success('Xác nhận thành công! 🎉');
      // Refresh payment data
      try {
        const res = await paymentAPI.getStatus(orderId);
        setPayment(res.data.data);
      } catch { /* ignore */ }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xác nhận');
    } finally {
      setConfirming(false);
    }
  };

  const fmt = (n) => Number(n).toLocaleString('vi-VN');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl shadow-black/30">

          {/* LOADING */}
          {status === 'loading' && (
            <>
              <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-2">Đang xử lý thanh toán...</h2>
              <p className="text-slate-400 text-sm">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Thanh toán thành công!</h2>
              <p className="text-slate-400 text-sm mb-6">Cảm ơn bạn đã mua khoá học tại 26Tech LMS</p>

              {payment && (
                <div className="text-left space-y-2 mb-6 bg-slate-800/50 rounded-xl p-4">
                  <div className="flex justify-between text-sm py-1.5 border-b border-slate-700">
                    <span className="text-slate-400">Order ID</span>
                    <span className="font-mono text-xs text-white">{payment.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1.5 border-b border-slate-700">
                    <span className="text-slate-400">Số tiền</span>
                    <span className="font-bold text-amber-400">{fmt(payment.amount)}đ</span>
                  </div>
                  <div className="flex justify-between text-sm py-1.5 border-b border-slate-700">
                    <span className="text-slate-400">Phương thức</span>
                    <span className="text-white font-semibold">
                      {payment.method === 'momo' ? '💳 MoMo'
                        : payment.method === 'atm' ? '🏦 ATM'
                        : payment.method === 'bank' ? '📱 Chuyển khoản'
                        : '🧪 Mock'}
                    </span>
                  </div>
                  {payment.transId && (
                    <div className="flex justify-between text-sm py-1.5">
                      <span className="text-slate-400">Trans ID</span>
                      <span className="font-mono text-xs text-white">{payment.transId}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Link to="/student/my-courses" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all">
                  Vào học ngay →
                </Link>
                <Link to="/courses" className="block w-full py-3 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl text-sm transition-all">
                  Tiếp tục mua khoá học
                </Link>
              </div>
            </>
          )}

          {/* FAILED */}
          {status === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Thanh toán thất bại</h2>
              <p className="text-slate-400 text-sm mb-6">
                {message || 'Giao dịch không thành công. Vui lòng thử lại.'}
              </p>
              <div className="space-y-3">
                <Link to="/courses" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all">
                  Quay lại danh sách khoá học
                </Link>
              </div>
            </>
          )}

          {/* PENDING */}
          {status === 'pending' && (
            <>
              <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">⏳</span>
              </div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2">Đang chờ xác nhận</h2>
              <p className="text-slate-400 text-sm mb-4">
                Thanh toán đang được xử lý. Trong môi trường Sandbox, MoMo không gửi được IPN về localhost.
              </p>

              {payment && (
                <div className="text-left space-y-2 mb-4 bg-slate-800/50 rounded-xl p-4">
                  <div className="flex justify-between text-sm py-1.5 border-b border-slate-700">
                    <span className="text-slate-400">Order ID</span>
                    <span className="font-mono text-xs text-white">{payment.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1.5">
                    <span className="text-slate-400">Số tiền</span>
                    <span className="font-bold text-amber-400">{fmt(payment.amount)}đ</span>
                  </div>
                </div>
              )}

              <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-3 text-sm text-purple-300 mb-4">
                🧪 Nếu bạn đã thanh toán thành công trên MoMo, nhấn nút bên dưới để xác nhận thủ công.
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDemoConfirm}
                  disabled={confirming}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang xác nhận...</>
                  ) : (
                    '✅ Xác nhận thanh toán thành công'
                  )}
                </button>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-all">
                  🔄 Kiểm tra lại
                </button>
                <Link to="/courses" className="block w-full py-3 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl text-sm transition-all text-center">
                  Quay lại danh sách khoá học
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
