import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
      toast.success('Email xác nhận đã được gửi!');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Quên mật khẩu</h2>
        
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-300 mb-6">
              Vui lòng kiểm tra hộp thư email của bạn <strong className="text-white">{email}</strong> để lấy link đặt lại mật khẩu.
            </p>
            <Link to="/auth" className="text-blue-500 hover:text-blue-400 font-medium">
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-slate-400 text-sm mb-6 text-center">
              Nhập email đã đăng ký tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/25 mb-4"
            >
              {loading ? 'Đang gửi...' : 'Gửi link xác nhận'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Nhớ mật khẩu?{' '}
              <Link to="/auth" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Quay lại đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
