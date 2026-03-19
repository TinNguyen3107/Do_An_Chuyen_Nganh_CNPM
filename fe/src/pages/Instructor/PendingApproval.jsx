import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { InfoIcon, InstructorIcon } from '../../components/Icons/Icons';

export default function PendingApproval() {
  const { user } = useAuth();
  const status = user?.instructorStatus;

  return (
    <div className="flex flex-col items-center flex-1 justify-center py-20 px-6 mt-16 max-w-lg mx-auto animate-fade-in text-center">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 
        ${status === 'rejected' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
        <InstructorIcon className={`w-12 h-12 ${status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`} />
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">
        {status === 'rejected' ? 'Hồ sơ chưa đạt yêu cầu' : 'Hồ sơ đang chờ duyệt'}
      </h1>

      <div className={`p-5 rounded-2xl border mb-8 flex gap-4 text-left shadow-lg
        ${status === 'rejected' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
        <InfoIcon className="flex-shrink-0 mt-0.5" />
        {status === 'rejected' ? (
          <div>
            <p className="text-sm text-red-300 font-semibold mb-1">Rất tiếc, hồ sơ giảng viên của bạn đã bị từ chối.</p>
            <p className="text-xs text-red-400/80 leading-relaxed">Vui lòng cập nhật đầy đủ thông tin chuyên môn, lịch sử giảng dạy và đính kèm CV chi tiết hơn. Bạn có thể gửi lại hồ sơ bất cứ lúc nào qua mục cài đặt cá nhân.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-amber-300 font-semibold mb-1">Tài khoản của bạn đang được duyệt</p>
            <p className="text-xs text-amber-400/80 leading-relaxed">Admin đang xem xét hồ sơ năng lực của bạn. Quá trình này thường mất 1-2 ngày làm việc. Bạn sẽ được cấp quyền tạo khoá học ngay khi được duyệt.</p>
          </div>
        )}
      </div>

      <Link
        to="/"
        className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700"
      >
        Quay lại trang chủ
      </Link>
    </div>
  );
}
