import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isInstructor, isApprovedInstructor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        isActive(to) ? 'text-blue-400' : 'text-slate-300 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">
              26<span className="text-blue-400">Tech</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/courses', 'Khoá học')}
            {isApprovedInstructor && navLink('/instructor/dashboard', 'Quản lý khoá học')}
            {user && navLink('/student/dashboard', 'Học của tôi')}
            {isAdmin && navLink('/admin/dashboard', 'Admin')}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!user ? (
              <Link
                to="/auth"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
              >
                Đăng nhập
              </Link>
            ) : (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'instructor' ? '🏫 Giảng viên' : '🎓 Học viên'}
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs text-slate-500">Đang đăng nhập với</p>
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    </div>

                    {user && (
                      <Link to="/student/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                        <span>📚</span> Học của tôi
                      </Link>
                    )}
                    {isApprovedInstructor && (
                      <Link to="/instructor/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                        <span>🏫</span> Quản lý khoá học
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                        <span>👑</span> Trang Admin
                      </Link>
                    )}
                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        id="logout-btn"
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <span>🚪</span> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
