import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('momo');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    courseAPI.getById(courseId)
      .then(res => setCourse(res.data.data))
      .catch(() => { toast.error('Không tìm thấy khoá học'); navigate('/courses'); })
      .finally(() => setLoading(false));
  }, [courseId, user]);

  const handlePay = async (payMethod) => {
    setProcessing(true);
    try {
      let res;
      switch (payMethod) {
        case 'momo':
          res = await paymentAPI.createMomo(courseId);
          if (res.data.success && res.data.payUrl) {
            setResult({ type: 'redirect', data: res.data });
            window.open(res.data.payUrl, '_blank');
          }
          break;
        case 'mock':
          res = await paymentAPI.createMock(courseId);
          if (res.data.success) {
            setResult({ type: 'mock_success', data: res.data });
            toast.success('Thanh toán thành công! 🎉');
          }
          break;
        case 'atm':
          res = await paymentAPI.createATM(courseId);
          if (res.data.success && res.data.payUrl) {
            setResult({ type: 'redirect', data: res.data });
            window.open(res.data.payUrl, '_blank');
          }
          break;
        case 'bank':
          res = await paymentAPI.createBank(courseId);
          if (res.data.success) {
            setResult({ type: 'bank', data: res.data });
          }
          break;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo đơn thanh toán');
    } finally {
      setProcessing(false);
      // Auto-scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  };

  const checkStatus = async (orderId) => {
    try {
      const res = await paymentAPI.getStatus(orderId);
      const payment = res.data.data;
      if (payment.status === 'success') {
        setResult({ type: 'success', data: payment });
        toast.success('Thanh toán thành công!');
      } else if (payment.status === 'failed') {
        toast.error('Thanh toán thất bại');
      } else {
        toast.loading('Đang chờ xác nhận...', { duration: 2000 });
      }
    } catch {
      toast.error('Không thể kiểm tra trạng thái');
    }
  };

  // Demo: tự xác nhận chuyển khoản ngân hàng
  const confirmBankDemo = async (orderId) => {
    setConfirming(true);
    try {
      await paymentAPI.confirmBank(orderId, `DEMO_TXN_${Date.now()}`);
      setResult({ type: 'success', data: { orderId } });
      toast.success('Xác nhận thành công! Bạn đã được ghi danh vào khoá học 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xác nhận');
    } finally {
      setConfirming(false);
    }
  };

  const fmt = (n) => Number(n).toLocaleString('vi-VN');

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link to={`/courses/${courseId}`} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 mb-4">
            ← Quay lại khoá học
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            💳 Thanh toán khoá học
          </h1>
          <p className="text-slate-400 mt-2">Chọn phương thức thanh toán phù hợp với bạn</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT: Payment methods */}
          <div className="lg:col-span-3 space-y-6">
            {/* Course Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-20 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{course.title}</h3>
                <p className="text-sm text-slate-400">{course.instructor?.name}</p>
              </div>
              <div className="text-xl font-extrabold text-amber-400 flex-shrink-0">
                {fmt(course.price)}đ
              </div>
            </div>

            {/* Methods */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-sm">💳</span>
                Phương thức thanh toán
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'momo', icon: '💳', name: 'Ví MoMo', desc: 'Thanh toán qua ví điện tử MoMo', color: 'pink' },
                  { id: 'atm', icon: '🏦', name: 'Thẻ ATM / Ngân hàng', desc: 'Nhập thẻ ATM hoặc tài khoản NH', color: 'blue' },
                  { id: 'bank', icon: '📱', name: 'Chuyển khoản QR', desc: 'Chuyển khoản qua mã VietQR', color: 'green' },
                  { id: 'mock', icon: '🧪', name: 'Mock (Demo)', desc: 'Thanh toán thử không cần ví', color: 'purple' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200
                      ${method === m.id
                        ? m.color === 'pink' ? 'border-pink-500 bg-pink-500/10'
                          : m.color === 'blue' ? 'border-blue-500 bg-blue-500/10'
                          : m.color === 'green' ? 'border-green-500 bg-green-500/10'
                          : 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                  >
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="font-bold text-sm text-white">{m.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>

              {/* Warning */}
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 flex gap-2 items-start text-sm text-amber-300 mb-5">
                <span className="flex-shrink-0">⚠️</span>
                <span>Đây là môi trường <strong>Demo / Sandbox</strong>. Không có tiền thật được giao dịch.</span>
              </div>

              {/* Pay button */}
              <button
                onClick={() => handlePay(method)}
                disabled={processing}
                className={`w-full py-3.5 font-bold rounded-xl transition-all text-white shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed
                  ${method === 'momo' ? 'bg-gradient-to-r from-pink-600 to-pink-500 shadow-pink-600/30 hover:shadow-pink-600/50'
                    : method === 'atm' ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-600/30 hover:shadow-blue-600/50'
                    : method === 'bank' ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-green-600/30 hover:shadow-green-600/50'
                    : 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-600/30 hover:shadow-purple-600/50'
                  }`}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  `Thanh toán ${fmt(course.price)}đ`
                )}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div ref={resultRef} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-sm">📄</span>
                  Kết quả thanh toán
                </h2>

                {/* Mock success */}
                {result.type === 'mock_success' && (
                  <div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center mb-4">
                      <div className="text-5xl mb-3">🎉</div>
                      <div className="text-xl font-bold text-green-400 mb-1">Thanh toán thành công!</div>
                      <p className="text-sm text-slate-400">Bạn đã được ghi danh vào khoá học</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm py-2 border-b border-slate-800"><span className="text-slate-400">Order ID</span><span className="font-mono text-xs text-white">{result.data.orderId}</span></div>
                      <div className="flex justify-between text-sm py-2 border-b border-slate-800"><span className="text-slate-400">Số tiền</span><span className="font-bold text-amber-400">{fmt(result.data.amount)}đ</span></div>
                      <div className="flex justify-between text-sm py-2 border-b border-slate-800"><span className="text-slate-400">Trans ID</span><span className="font-mono text-xs text-white">{result.data.transId}</span></div>
                      <div className="flex justify-between text-sm py-2"><span className="text-slate-400">Trạng thái</span><span className="text-green-400 font-semibold">✅ Thành công</span></div>
                    </div>
                    <Link to="/student/my-courses" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center text-sm transition-all">
                      Vào học ngay →
                    </Link>
                  </div>
                )}

                {/* Redirect (MoMo / ATM) */}
                {result.type === 'redirect' && (
                  <div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center mb-4">
                      <div className="text-5xl mb-3">🔗</div>
                      <div className="text-xl font-bold text-amber-400 mb-1">Đơn hàng đã tạo!</div>
                      <p className="text-sm text-slate-400">Hoàn tất thanh toán trên trang MoMo</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm py-2 border-b border-slate-800"><span className="text-slate-400">Order ID</span><span className="font-mono text-xs text-white">{result.data.orderId}</span></div>
                      <div className="flex justify-between text-sm py-2 border-b border-slate-800"><span className="text-slate-400">Số tiền</span><span className="font-bold text-amber-400">{fmt(result.data.amount)}đ</span></div>
                      <div className="flex justify-between text-sm py-2"><span className="text-slate-400">Trạng thái</span><span className="text-amber-400 font-semibold">⏳ Chờ thanh toán</span></div>
                    </div>
                    <div className="flex gap-3 mb-3">
                      <a href={result.data.payUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-center text-sm transition-all">
                        Mở trang thanh toán →
                      </a>
                      <button onClick={() => checkStatus(result.data.orderId)} className="px-5 py-3 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl text-sm transition-all">
                        🔄 Kiểm tra
                      </button>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-3 text-sm text-purple-300 mb-3">
                      🧪 MoMo Sandbox không thể gửi IPN về localhost. Dùng nút bên dưới để giả lập xác nhận thanh toán.
                    </div>
                    <button
                      onClick={() => confirmBankDemo(result.data.orderId)}
                      disabled={confirming}
                      className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {confirming ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang xác nhận...</>
                      ) : (
                        '✅ Demo: Xác nhận thanh toán thành công'
                      )}
                    </button>
                  </div>
                )}

                {/* Bank transfer */}
                {result.type === 'bank' && (
                  <div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center mb-4">
                      <div className="text-5xl mb-3">🏦</div>
                      <div className="text-xl font-bold text-blue-400 mb-1">Thông tin chuyển khoản</div>
                      <p className="text-sm text-slate-400">Quét mã QR hoặc chuyển khoản thủ công</p>
                    </div>
                    {result.data.qrUrl && (
                      <div className="flex justify-center mb-4">
                        <img src={result.data.qrUrl} alt="QR Code" className="w-48 h-48 rounded-xl border-2 border-blue-500/30 bg-white" />
                      </div>
                    )}
                    <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 mb-4">
                      <div className="flex justify-between text-sm py-1.5 border-b border-slate-700"><span className="text-slate-400">Ngân hàng</span><span className="font-semibold text-white">{result.data.bank?.name}</span></div>
                      <div className="flex justify-between text-sm py-1.5 border-b border-slate-700"><span className="text-slate-400">Số tài khoản</span><span className="font-mono font-semibold text-white">{result.data.bank?.accountNumber}</span></div>
                      <div className="flex justify-between text-sm py-1.5 border-b border-slate-700"><span className="text-slate-400">Tên TK</span><span className="font-semibold text-white">{result.data.bank?.accountName}</span></div>
                      <div className="flex justify-between text-sm py-1.5 border-b border-slate-700"><span className="text-slate-400">Số tiền</span><span className="font-bold text-amber-400">{fmt(result.data.amount)}đ</span></div>
                      <div className="flex justify-between text-sm py-1.5"><span className="text-slate-400">Nội dung CK</span><span className="font-mono font-semibold text-blue-400">{result.data.transferContent}</span></div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-sm text-amber-300 mb-4">
                      ⚠️ Vui lòng nhập đúng <strong>nội dung chuyển khoản</strong> để hệ thống tự động xác nhận.
                    </div>
                    <button onClick={() => checkStatus(result.data.orderId)} className="w-full py-3 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl text-sm transition-all font-semibold mb-3">
                      🔄 Kiểm tra trạng thái thanh toán
                    </button>
                    <button
                      onClick={() => confirmBankDemo(result.data.orderId)}
                      disabled={confirming}
                      className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {confirming ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang xác nhận...</>
                      ) : (
                        '✅ Demo: Xác nhận đã chuyển khoản'
                      )}
                    </button>
                  </div>
                )}

                {/* Verified success */}
                {result.type === 'success' && (
                  <div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center mb-4">
                      <div className="text-5xl mb-3">✅</div>
                      <div className="text-xl font-bold text-green-400 mb-1">Thanh toán đã xác nhận!</div>
                      <p className="text-sm text-slate-400">Bạn đã được ghi danh vào khoá học</p>
                    </div>
                    <Link to="/student/my-courses" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center text-sm transition-all">
                      Vào học ngay →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-white mb-5">📋 Tóm tắt đơn hàng</h2>

              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-full aspect-video rounded-xl object-cover mb-4" />
              )}

              <h3 className="font-bold text-white mb-1">{course.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{course.instructor?.name}</p>

              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Giá khoá học</span><span className="text-white">{fmt(course.price)}đ</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Giảm giá</span><span className="text-green-400">0đ</span></div>
                <div className="flex justify-between font-bold text-base border-t border-slate-800 pt-3 mt-3">
                  <span className="text-white">Tổng cộng</span>
                  <span className="text-amber-400 text-xl">{fmt(course.price)}đ</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                {[
                  { icon: '🔒', text: 'Thanh toán an toàn, bảo mật' },
                  { icon: '♾️', text: 'Truy cập trọn đời khoá học' },
                  { icon: '💬', text: 'Hỗ trợ 24/7 qua chat' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Sandbox credentials */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">🔑 MoMo Sandbox Test</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">SĐT</span><span className="font-mono text-slate-300">0918 181 083</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Mật khẩu</span><span className="font-mono text-slate-300">000000</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">OTP</span><span className="font-mono text-slate-300">000000</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
