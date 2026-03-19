import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookIcon, CheckIcon, StudentIcon, InstructorIcon, UserIcon } from '../components/Icons/Icons';

export default function DashboardLayout({ sidebarLinks, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <BookIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              26<span className="text-blue-400">Tech</span>
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {title}
            </p>
          </div>

          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
              {user?.avatar ? <img src={user.avatar} className="rounded-full w-full h-full object-cover"/> : user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-sm font-medium border border-slate-700 hover:border-red-500/30 rounded-lg transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT W/ SIDEBAR OFFSET ── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Đến trang chủ
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
