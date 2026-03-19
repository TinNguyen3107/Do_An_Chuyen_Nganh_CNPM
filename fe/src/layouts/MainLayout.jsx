import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-white font-bold">26<span className="text-blue-400">Tech</span></span>
            </div>
            <p className="text-slate-500 text-sm">© 2025 26Tech · Hệ thống quản lý khoá học trực tuyến</p>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Điều khoản</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Chính sách</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Hỗ trợ</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
