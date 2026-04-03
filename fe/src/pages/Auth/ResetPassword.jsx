import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwords.password || !passwords.confirm) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    if (passwords.password !== passwords.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (passwords.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authAPI.resetPassword(token, passwords.password);
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/auth', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Đặt lại mật khẩu mới</h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={passwords.password}
              onChange={(e) => setPasswords({...passwords, password: e.target.value})}
              className="w-full bg-slate-800/60 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full bg-slate-800/60 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/25 mb-4"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
          </button>
          
          <p className="text-center text-sm text-slate-500">
            <Link to="/auth" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Hủy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
