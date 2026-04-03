import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = {
    student: { label: 'Học viên', color: 'bg-blue-500/15 border-blue-500/30 text-blue-300', badge: '🎓' },
    instructor: { label: 'Giảng viên', color: 'bg-amber-500/15 border-amber-500/30 text-amber-300', badge: '🏫' },
    admin: { label: 'Admin', color: 'bg-purple-500/15 border-purple-500/30 text-purple-300', badge: '👑' },
};

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 15;

    const fetchUsers = () => {
        setLoading(true);
        const params = { page, limit };
        if (search) params.search = search;
        if (roleFilter) params.role = roleFilter;

        userAPI.getAll(params).then(res => {
            setUsers(res.data.data || res.data.users || []);
            setTotal(res.data.total || 0);
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, [page, roleFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!window.confirm(`Bạn có chắc chắn muốn đổi vai trò thành "${ROLES[newRole]?.label}"?`)) return;
        try {
            await userAPI.changeRole(userId, newRole);
            toast.success(`Đã đổi vai trò thành công`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi đổi vai trò');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await userAPI.toggleStatus(userId);
            toast.success('Cập nhật trạng thái thành công');
            fetchUsers();
        } catch (err) {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="animate-fade-in max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý Người dùng</h1>
                    <p className="text-slate-400 mt-1">{total} người dùng trong hệ thống</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all">Tìm</button>
                </form>

                <div className="flex gap-2">
                    {['', 'student', 'instructor', 'admin'].map(r => (
                        <button
                            key={r}
                            onClick={() => { setRoleFilter(r); setPage(1); }}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {r === '' ? 'Tất cả' : ROLES[r]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/50">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Người dùng</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vai trò</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày tham gia</th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-800" /><div className="h-4 bg-slate-800 rounded w-28" /></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-36" /></td>
                                        <td className="px-5 py-4"><div className="h-5 bg-slate-800 rounded w-20" /></td>
                                        <td className="px-5 py-4"><div className="h-5 bg-slate-800 rounded w-16" /></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                                        <td className="px-5 py-4"><div className="h-8 bg-slate-800 rounded w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-16 text-slate-500">Không tìm thấy người dùng nào</td></tr>
                            ) : (
                                users.map(user => {
                                    const roleInfo = ROLES[user.role] || ROLES.student;
                                    return (
                                        <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                        {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : user.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-semibold text-white">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-400">{user.email}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${roleInfo.color}`}>
                                                    {roleInfo.badge} {roleInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${user.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {user.isActive ? 'Hoạt động' : 'Bị khoá'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 justify-end">
                                                    {user.role !== 'admin' && (
                                                        <select
                                                            value={user.role}
                                                            onChange={e => handleChangeRole(user._id, e.target.value)}
                                                            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-slate-600 transition-all"
                                                        >
                                                            <option value="student">Học viên</option>
                                                            <option value="instructor">Giảng viên</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    )}
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${user.isActive ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'}`}
                                                        >
                                                            {user.isActive ? 'Khoá' : 'Mở khoá'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="border-t border-slate-800 px-5 py-4 flex items-center justify-between">
                        <p className="text-xs text-slate-500">Trang {page} / {totalPages} · {total} người dùng</p>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-all">← Trước</button>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-all">Tiếp →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
