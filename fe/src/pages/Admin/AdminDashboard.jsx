import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('26tech_user') || '{}');
        fetch(`${API_BASE}/stats/overview`, {
            headers: { Authorization: `Bearer ${user.token}` },
        })
            .then(r => r.json())
            .then(data => setStats(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const STAT_CARDS = stats ? [
        { title: 'Tổng Người Dùng', value: stats.totalUsers, icon: '👥', link: '/admin/users', color: 'from-indigo-500 to-blue-600', sub: `${stats.totalStudents} học viên` },
        { title: 'GV chờ phê duyệt', value: stats.pendingInstructors, icon: '📝', link: '/admin/instructors', color: 'from-amber-500 to-orange-600', sub: `${stats.totalInstructors} đã được duyệt`, alert: stats.pendingInstructors > 0 },
        { title: 'Tổng Khoá Học', value: stats.totalCourses, icon: '📚', link: '/admin/dashboard', color: 'from-emerald-500 to-teal-600', sub: `${stats.publishedCourses} đã xuất bản` },
        { title: 'Tổng Lượt Đăng Ký', value: stats.totalEnrollments, icon: '🎓', link: '/admin/users', color: 'from-purple-500 to-pink-600', sub: `trong ${stats.totalCategories} danh mục` },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* QUICK ACTIONS */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-5">⚡ Hành động nhanh</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { to: '/admin/instructors', icon: '✅', label: 'Duyệt giảng viên', desc: 'Xét duyệt hồ sơ giảng viên', color: 'hover:border-amber-500/30 hover:bg-amber-500/5' },
                            { to: '/admin/courses-review', icon: '📚', label: 'Duyệt khoá học', desc: 'Xét duyệt khoá học mới', color: 'hover:border-rose-500/30 hover:bg-rose-500/5' },
                            { to: '/admin/categories', icon: '📁', label: 'Quản lý danh mục', desc: 'Thêm, sửa, xoá danh mục', color: 'hover:border-blue-500/30 hover:bg-blue-500/5' },
                            { to: '/admin/users', icon: '👥', label: 'Quản lý người dùng', desc: 'Xem và phân quyền người dùng', color: 'hover:border-green-500/30 hover:bg-green-500/5' },
                            { to: '/admin/dashboard', icon: '📊', label: 'Báo cáo thống kê', desc: 'Xem báo cáo chi tiết', color: 'hover:border-purple-500/30 hover:bg-purple-500/5' },
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
                    <div className="space-y-4">
                        {stats && [
                            { label: 'Học viên', value: stats.totalStudents, icon: '🎓', color: 'text-blue-400' },
                            { label: 'GV đã duyệt', value: stats.totalInstructors, icon: '🏫', color: 'text-amber-400' },
                            { label: 'Khoá học', value: stats.totalCourses, icon: '📚', color: 'text-emerald-400' },
                            { label: 'Đã xuất bản', value: stats.publishedCourses, icon: '🌐', color: 'text-green-400' },
                            { label: 'Danh mục', value: stats.totalCategories, icon: '📁', color: 'text-purple-400' },
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

                    <div className="mt-5 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
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
