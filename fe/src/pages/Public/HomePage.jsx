import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      {/* Hiệu ứng nền mờ ảo cho xịn */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl">
        {/* Icon hoặc minh họa */}
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <span className="text-4xl animate-bounce">🏗️</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Giao diện <span className="text-blue-500">Trang Chủ</span>
        </h1>
        
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 mb-8">
          <p className="text-xl text-slate-300 font-medium mb-4">
            Đang được thành viên khác phát triển...
          </p>
          <p className="text-slate-500 leading-relaxed">
            Hệ thống đang hoàn thiện các tính năng hiển thị khóa học và danh mục. 
            Vui lòng quay lại sau khi Sprint này kết thúc!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/auth" 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Quay lại Đăng nhập
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all"
          >
            Tải lại trang
          </button>
        </div>
      </div>

      {/* Trang trí chân trang cho bớt trống */}
      <div className="mt-20 flex gap-8 opacity-20 filter grayscale">
        <span className="text-sm font-bold text-white italic">26Tech Ecosystem</span>
        <span className="text-sm font-bold text-white italic">Sprint 1 - 2026</span>
      </div>
    </div>
  );
}