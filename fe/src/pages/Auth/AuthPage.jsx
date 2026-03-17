import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      if (from && from !== '/auth') {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'instructor') {
        if (user.instructorStatus === 'approved') {
          navigate('/instructor/dashboard', { replace: true });
        } else {
          navigate('/instructor/pending', { replace: true });
        }
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, navigate, location]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/[0.08] blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/[0.03] blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-md">
        {/* LOGO & BRAND */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            26<span className="text-blue-400">Tech</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Hệ thống quản lý khoá học trực tuyến</p>
        </div>

        {/* AUTH CARD */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-7">
          {/* TAB SWITCHER */}
          <div className="flex bg-slate-800/70 rounded-xl p-1 mb-6">
            {[
              ['login', 'Đăng nhập'],
              ['register', 'Đăng ký'],
            ].map(([key, label]) => (
              <button
                key={key}
                id={`tab-${key}`}
                onClick={() => setMode(key)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* HEADING */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới ✨'}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              {mode === 'login'
                ? 'Đăng nhập để tiếp tục hành trình học tập'
                : 'Chọn vai trò và điền thông tin để bắt đầu'}
            </p>
          </div>

          {/* FORM CONTENT */}
          <div className="min-h-[200px]">
            {mode === 'login'
              ? <LoginForm onSwitch={() => setMode('register')} />
              : <RegisterForm onSwitch={() => setMode('login')} />
            }
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-slate-600 text-xs mt-5">
          © 2025 26Tech ·{' '}
          <span className="hover:text-slate-400 cursor-pointer transition-colors">Điều khoản</span> ·{' '}
          <span className="hover:text-slate-400 cursor-pointer transition-colors">Chính sách</span>
        </p>
      </div>
    </div>
  );
}
