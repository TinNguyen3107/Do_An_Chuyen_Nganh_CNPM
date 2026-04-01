import { useState } from 'react';
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

const Field = ({ id, label, type = 'text', placeholder, value, onChange, error, showToggle, onToggle, showPass, icon }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
      <input
        id={id}
        type={showToggle ? (showPass ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-800/60 border ${error ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'} text-slate-100 placeholder-slate-500 rounded-xl ${icon ? 'pl-10' : 'pl-4'} ${showToggle ? 'pr-10' : 'pr-4'} py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
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

const ROLES = [
  { key: 'student', label: 'Học viên', desc: 'Tham gia & học các khoá học', emoji: '🎓', color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
  { key: 'instructor', label: 'Giảng viên', desc: 'Tạo & quản lý khoá học', emoji: '🏫', color: 'border-amber-500 bg-amber-500/10 text-amber-300' },
];

export default function RegisterForm({ onSwitch }) {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', expertise: '', bio: '' });
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const isInstructor = role === 'instructor';
  const set = (key) => (ev) => setForm(f => ({ ...f, [key]: ev.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ và tên.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ.';
    if (form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp.';
    if (isInstructor && !form.expertise.trim()) e.expertise = 'Vui lòng nhập chuyên môn.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('role', role);
      if (isInstructor) {
        formData.append('expertise', form.expertise);
        formData.append('biography', form.bio);
        if (cvFile) formData.append('cvFile', cvFile);
      }

      await authAPI.register(formData);
      setSuccess(true);
      toast.success('Đăng ký thành công!');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setErrors(e => ({ ...e, cv: 'Chỉ chấp nhận PDF, DOC, DOCX.' })); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors(e => ({ ...e, cv: 'File tối đa 5MB.' })); return; }
    setErrors(e => { const { cv, ...r } = e; return r; });
    setCvFile(file);
  };

  if (success) return (
    <div className="text-center py-6 px-2">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isInstructor ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
        <svg className={`w-8 h-8 ${isInstructor ? 'text-amber-400' : 'text-green-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-1">Đăng ký thành công!</h3>
      <p className="text-slate-400 text-sm mb-1">Tài khoản được tạo cho:</p>
      <p className={`font-medium text-sm mb-4 ${isInstructor ? 'text-amber-400' : 'text-blue-400'}`}>{form.email}</p>

      {isInstructor && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-left">
          <p className="text-amber-300 text-xs font-semibold mb-1">📋 Lưu ý cho Giảng viên</p>
          <p className="text-slate-400 text-xs">Tài khoản cần Admin xét duyệt trước khi tạo khoá học. Thường mất 1–2 ngày làm việc.</p>
        </div>
      )}

      <button
        id="goto-login-btn"
        onClick={onSwitch}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
      >
        Đến trang đăng nhập
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* ROLE SELECTOR */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Bạn muốn đăng ký với vai trò:</p>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => {
            const active = role === r.key;
            return (
              <button
                key={r.key}
                type="button"
                id={`role-${r.key}-btn`}
                onClick={() => { setRole(r.key); setErrors({}); }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center ${active ? r.color + ' ring-2 ring-current/30' : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
                <span className="text-2xl">{r.emoji}</span>
                <div>
                  <p className={`text-sm font-bold ${active ? '' : 'text-slate-400'}`}>{r.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <span>⚠</span>{errors.general}
        </div>
      )}

      <Field id="register-name" label="Họ và tên" placeholder="Nguyễn Văn A" value={form.name} onChange={set('name')} error={errors.name} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
      <Field id="register-email" label="Email" type="email" placeholder="example@email.com" value={form.email} onChange={set('email')} error={errors.email} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>} />
      <Field id="register-password" label="Mật khẩu" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={set('password')} error={errors.password} showToggle onToggle={() => setShowPass(s => !s)} showPass={showPass} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
      <Field id="register-confirm" label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={set('confirm')} error={errors.confirm} showToggle onToggle={() => setShowConfirm(s => !s)} showPass={showConfirm} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />

      {/* INSTRUCTOR EXTRA FIELDS */}
      {isInstructor && (
        <div className="mb-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-wider">🏫 Thông tin Giảng viên</p>

          <div>
            <label htmlFor="register-expertise" className="block text-sm font-medium text-slate-300 mb-1.5">
              Chuyên môn giảng dạy <span className="text-red-400">*</span>
            </label>
            <input
              id="register-expertise"
              type="text"
              value={form.expertise}
              onChange={set('expertise')}
              placeholder="VD: Lập trình Web, Thiết kế UI/UX..."
              className={`w-full bg-slate-800/60 border ${errors.expertise ? 'border-red-500' : 'border-amber-500/30 focus:border-amber-400'} text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-200`}
            />
            {errors.expertise && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.expertise}</p>}
          </div>

          <div>
            <label htmlFor="register-bio" className="block text-sm font-medium text-slate-300 mb-1.5">
              Giới thiệu bản thân <span className="text-slate-500 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              id="register-bio"
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="Mô tả kinh nghiệm và năng lực của bạn..."
              className="w-full bg-slate-800/60 border border-amber-500/30 focus:border-amber-400 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-200 resize-none"
            />
          </div>

          {/* CV UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Upload CV / Hồ sơ <span className="text-slate-500 font-normal">(tùy chọn)</span>
            </label>
            {!cvFile ? (
              <div
                onDragOver={(ev) => { ev.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(ev) => { ev.preventDefault(); setDragOver(false); handleFileChange(ev.dataTransfer.files[0]); }}
                onClick={() => document.getElementById('cv-file-input').click()}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 ${dragOver ? 'border-amber-400 bg-amber-500/10' : 'border-slate-700 bg-slate-800/30 hover:border-amber-500/50'}`}
              >
                <input id="cv-file-input" type="file" accept=".pdf,.doc,.docx" onChange={(ev) => handleFileChange(ev.target.files[0])} className="hidden" />
                <svg className={`w-7 h-7 mx-auto mb-2 ${dragOver ? 'text-amber-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-slate-400">{dragOver ? 'Thả file vào đây' : 'Kéo thả hoặc nhấn để chọn'}</p>
                <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX · Tối đa 5MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-amber-500/30 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{cvFile.name}</p>
                  <p className="text-xs text-slate-500">{(cvFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button type="button" onClick={() => setCvFile(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            {errors.cv && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.cv}</p>}
          </div>

          <div className="flex items-start gap-2 bg-amber-500/[0.08] rounded-lg p-2.5">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-amber-300/80 text-xs leading-relaxed">Tài khoản Giảng viên cần Admin xét duyệt trước khi kích hoạt. 1–2 ngày làm việc.</p>
          </div>
        </div>
      )}

      <button
        id="register-submit-btn"
        type="submit"
        disabled={loading}
        className={`w-full disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg ${isInstructor ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang xử lý...
          </>
        ) : isInstructor ? 'Đăng ký làm Giảng viên' : 'Tạo tài khoản Học viên'}
      </button>

      <p className="text-center text-xs text-slate-500 mt-4">
        Đã có tài khoản?{' '}
        <button id="switch-to-login" type="button" onClick={onSwitch} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Đăng nhập ngay
        </button>
      </p>
    </form>
  );
}
