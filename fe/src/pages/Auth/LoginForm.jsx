import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EyeIcon = ({ open }) => open ? (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Field = ({ id, label, type = 'text', placeholder, value, onChange, error, icon, showToggle, onToggle, showPass }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
      )}
      <input
        id={id}
        type={showToggle ? (showPass ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-800/60 border ${error ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} text-slate-100 placeholder-slate-500 rounded-xl ${icon ? 'pl-10' : 'pl-4'} ${showToggle ? 'pr-10' : 'pr-4'} py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
      />
      {showToggle && (
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
          <EyeIcon open={showPass} />
        </button>
      )}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">⚠ {error}</p>}
  </div>
);

export default function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (ev) => setForm(f => ({ ...f, [key]: ev.target.value }));

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ.';
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu.';
    return e;
  };

  const getRedirectPath = (user) => {
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') {
      return user.instructorStatus === 'approved' ? '/instructor/dashboard' : '/instructor/pending';
    }
    return '/student/dashboard';
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      const userData = res.data.data;
      login(userData);
      toast.success(`Chào mừng trở lại, ${userData.name}!`);

      // Redirect to original destination or role-specific dashboard
      const from = location.state?.from?.pathname;
      if (from && from !== '/auth') {
        navigate(from, { replace: true });
      } else {
        navigate(getRedirectPath(userData), { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errors.general}
        </div>
      )}

      <Field
        id="login-email"
        label="Email"
        type="email"
        placeholder="example@email.com"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
      />

      <Field
        id="login-password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        showToggle
        onToggle={() => setShowPass(s => !s)}
        showPass={showPass}
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
      />

      {/* Demo credentials hint */}
      <div className="mb-5 p-3 bg-slate-800/50 rounded-xl">
        <p className="text-xs text-slate-500 mb-1.5 font-medium">Tài khoản demo Admin:</p>
        <p className="text-xs text-blue-400 font-mono">admin@gmail.com / admin12345</p>
      </div>

      <button
        id="login-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/25"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang đăng nhập...
          </>
        ) : 'Đăng nhập'}
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-600">
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Bảo mật bằng JWT Authentication
      </div>

      <p className="text-center text-xs text-slate-500 mt-4">
        Chưa có tài khoản?{' '}
        <button id="switch-to-register" type="button" onClick={onSwitch} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Đăng ký miễn phí
        </button>
      </p>
    </form>
  );
}
