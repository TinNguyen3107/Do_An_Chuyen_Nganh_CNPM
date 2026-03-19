import { useState, useEffect, useRef } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GENDER_OPTIONS = [
  { value: '', label: 'Chưa chọn' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bio: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load profile on mount
  useEffect(() => {
    authAPI.getProfile()
      .then(res => {
        const data = res.data.data;
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || '',
          address: data.address || '',
          bio: data.bio || '',
        });
        setAvatarPreview(data.avatar || '');
      })
      .catch(() => setErrorMsg('Không thể tải thông tin hồ sơ'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      await authAPI.uploadAvatar(fd);
      await refreshUser();
      setAvatarFile(null);
      setSuccessMsg('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    // Upload avatar first if new file selected
    if (avatarFile) {
      try {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await authAPI.uploadAvatar(fd);
        setAvatarFile(null);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Lỗi khi tải ảnh lên');
        setSaving(false);
        return;
      }
    }

    try {
      await authAPI.updateProfile(form);
      await refreshUser();
      setSuccessMsg('Cập nhật thông tin thành công!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || '?';

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-white mb-8">Hồ sơ cá nhân</h1>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-pulse space-y-5">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-slate-700" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-700 rounded w-1/4" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hồ sơ cá nhân</h1>
        <p className="text-slate-400 mt-1">Quản lý và cập nhật thông tin cá nhân của bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── AVATAR SECTION ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Ảnh đại diện</h2>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden cursor-pointer ring-2 ring-slate-700 hover:ring-blue-500 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview
                  ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
                  : initials
                }
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">{user?.name}</p>
              <p className="text-slate-400 text-sm mb-3">JPG, PNG, WEBP tối đa 3 MB</p>
              {avatarFile ? (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-all">
                    {uploadingAvatar ? 'Đang tải...' : 'Lưu ảnh'}
                  </button>
                  <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatar || ''); }}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all">
                    Huỷ
                  </button>
                  <span className="text-xs text-slate-400">{avatarFile.name}</span>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all">
                  Thay đổi ảnh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── BASIC INFO ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Họ và tên <span className="text-red-400">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Nhập họ và tên"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email <span className="ml-2 text-xs text-slate-500 font-normal">(không thể thay đổi)</span>
              </label>
              <input type="email" value={user?.email || ''} readOnly
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Số điện thoại</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Ngày sinh</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-white text-sm outline-none transition-all [color-scheme:dark]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Giới tính</label>
              <div className="flex gap-3">
                {GENDER_OPTIONS.slice(1).map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-all select-none ${form.gender === opt.value ? 'border-blue-500 bg-blue-600/15 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'}`}>
                    <input type="radio" name="gender" value={opt.value} checked={form.gender === opt.value} onChange={handleChange} className="hidden" />
                    {opt.value === 'male' ? '👨' : opt.value === 'female' ? '👩' : '🧑'} {opt.label}
                  </label>
                ))}
                {form.gender && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, gender: '' }))}
                    className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    Xoá lựa chọn
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── ADDITIONAL INFO ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Thông tin thêm</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Địa chỉ</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ của bạn"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Giới thiệu bản thân <span className="ml-2 text-xs text-slate-500 font-normal">{form.bio.length}/300</span>
              </label>
              <textarea name="bio" value={form.bio} onChange={handleChange} maxLength={300} rows={4}
                placeholder="Kể một chút về bản thân bạn..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        {successMsg && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {errorMsg}
          </div>
        )}

        {/* ── SAVE BUTTON ── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold rounded-xl transition-all">
            Huỷ thay đổi
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25">
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang lưu...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
