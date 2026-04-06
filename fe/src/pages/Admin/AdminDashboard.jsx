import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, paymentAPI } from '../../services/api';

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [payStats, setPayStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsAPI.getOverview(),
      paymentAPI.getStats(),
    ])
      .then(([overRes, payRes]) => {
        setStats(overRes.data.data);
        setPayStats(payRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    {
      title: 'Tổng Người Dùng', value: stats.totalUsers, icon: '👥',
      link: '/admin/users', color: 'from-indigo-500 to-blue-600',
      sub: `${stats.totalStudents} học viên`,
    },
    {
      title: 'GV chờ phê duyệt', value: stats.pendingInstructors, icon: '📝',
      link: '/admin/instructors', color: 'from-amber-500 to-orange-600',
      sub: `${stats.totalInstructors} đã được duyệt`, alert: stats.pendingInstructors > 0,
    },
    {
      title: 'Tổng Khoá Học', value: stats.totalCourses, icon: '📚',
      link: '/admin/dashboard', color: 'from-emerald-500 to-teal-600',
      sub: `${stats.publishedCourses} đã xuất bản`,
    },
    {
      title: 'Tổng Lượt Đăng Ký', value: stats.totalEnrollments, icon: '🎓',
      link: '/admin/users', color: 'from-purple-500 to-pink-600',
      sub: `trong ${stats.totalCategories} danh mục`,
    },
  ] : [];

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Tổng quan Hệ thống</h1>
        <p className="text-slate-400 text-sm">Quản lý toàn bộ hoạt động của nền tảng 26Tech</p>
      </div>

      {/* STAT CARDS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="w-12 h-12 bg-slate-800 rounded-xl mb-4" />
              <div className="h-8 bg-slate-800 rounded w-16 mb-2" />
              <div className="h-4 bg-slate-800 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STAT_CARDS.map(card => (
            <Link key={card.title} to={card.link} className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 block">
              {card.alert && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${card.color} mb-4 shadow-lg`}>
                {card.icon}
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{card.title}</p>
                <p className="text-4xl font-extrabold text-white mb-1">{card.value}</p>
                <p className="text-xs text-slate-500">{card.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* REVENUE SECTION */}
      {!loading && stats && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-base shadow-lg">💰</span>
            Doanh thu & Phân chia tài chính
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Revenue */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-lg shadow-emerald-900/30">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10 select-none">💳</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Tổng doanh thu</p>
              <p className="text-3xl font-extrabold text-white leading-none mb-1">
                {fmt(stats.totalRevenue)}
              </p>
              <p className="text-xs text-white/50 mt-1">
                {payStats?.success || 0} giao dịch thành công
              </p>
            </div>

            {/* Platform Fee (Admin share) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-blue-900/30">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10 select-none">🏦</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Platform nhận (30%)</p>
              <p className="text-3xl font-extrabold text-white leading-none mb-1">
                {fmt(stats.totalPlatformFee)}
              </p>
              <p className="text-xs text-white/50 mt-1">
                Lợi nhuận sau khi trừ HH giảng viên
              </p>
            </div>

            {/* Commission paid to instructors */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl p-6 shadow-lg shadow-purple-900/30">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10 select-none">🏫</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Hoa hồng giảng viên (70%)</p>
              <p className="text-3xl font-extrabold text-white leading-none mb-1">
                {fmt(stats.totalCommission)}
              </p>
              <p className="text-xs text-white/50 mt-1">
                Tích luỹ vào ví — chờ rút tiền
              </p>
            </div>
          </div>

          {/* Revenue bar chart */}
          {stats.totalRevenue > 0 && (
            <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">Phân bổ doanh thu</p>
                <p className="text-xs text-slate-500">Tổng: {fmt(stats.totalRevenue)}</p>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                  style={{ width: `${((stats.totalCommission / stats.totalRevenue) * 100).toFixed(1)}%` }}
                  title={`Hoa hồng GV: ${fmt(stats.totalCommission)}`}
                />
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                  style={{ width: `${((stats.totalPlatformFee / stats.totalRevenue) * 100).toFixed(1)}%` }}
                  title={`Platform: ${fmt(stats.totalPlatformFee)}`}
                />
              </div>
              <div className="flex items-center gap-6 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                  <span className="text-slate-400">GV: <span className="text-white font-bold">{((stats.totalCommission / stats.totalRevenue) * 100).toFixed(0)}%</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  <span className="text-slate-400">Platform: <span className="text-white font-bold">{((stats.totalPlatformFee / stats.totalRevenue) * 100).toFixed(0)}%</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QUICK ACTIONS */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">⚡ Hành động nhanh</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/instructors', icon: '✅', label: 'Duyệt giảng viên', desc: 'Xét duyệt hồ sơ giảng viên', color: 'hover:border-amber-500/30 hover:bg-amber-500/5' },
              { to: '/admin/payouts', icon: '💳', label: 'Chi trả giảng viên', desc: 'Duyệt yêu cầu rút tiền', color: 'hover:border-emerald-500/30 hover:bg-emerald-500/5' },
              { to: '/admin/users', icon: '👥', label: 'Quản lý người dùng', desc: 'Xem và phân quyền người dùng', color: 'hover:border-green-500/30 hover:bg-green-500/5' },
              { to: '/admin/categories', icon: '📁', label: 'Quản lý danh mục', desc: 'Thêm, sửa, xoá danh mục', color: 'hover:border-blue-500/30 hover:bg-blue-500/5' },
            ].map(action => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl transition-all ${action.color}`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">{action.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SYSTEM INFO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">📋 Thông tin hệ thống</h2>
          <div className="space-y-3">
            {stats && [
              { label: 'Học viên',     value: stats.totalStudents,    icon: '🎓', color: 'text-blue-400' },
              { label: 'GV đã duyệt',  value: stats.totalInstructors, icon: '🏫', color: 'text-amber-400' },
              { label: 'Khoá học',     value: stats.totalCourses,     icon: '📚', color: 'text-emerald-400' },
              { label: 'Đã xuất bản', value: stats.publishedCourses,  icon: '🌐', color: 'text-green-400' },
              { label: 'Danh mục',    value: stats.totalCategories,   icon: '📁', color: 'text-purple-400' },
              { label: 'Lượt đăng ký', value: stats.totalEnrollments, icon: '✅', color: 'text-indigo-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span>{item.icon}</span>
                  {item.label}
                </div>
                <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
            {!stats && <div className="text-slate-500 text-sm">Đang tải...</div>}
          </div>

          {/* Payment stats summary */}
          {payStats && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Thanh toán</p>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">✅ Thành công</span>
                <span className="font-bold text-emerald-400">{payStats.success}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">⏳ Đang chờ</span>
                <span className="font-bold text-amber-400">{payStats.pending}</span>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-green-400 font-semibold">Hệ thống hoạt động bình thường</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">26Tech LMS v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
