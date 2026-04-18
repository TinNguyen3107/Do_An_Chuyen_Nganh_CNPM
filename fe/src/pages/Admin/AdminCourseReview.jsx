import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCourseReviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCourseReview() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filterTab, setFilterTab] = useState('pending');
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('26tech_user') || '{}');
  const token = user.token;

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    fetchCourses();
  }, [page, filterTab, token, navigate]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { page, limit: pageSize };
      const response =
        filterTab === 'approved'
          ? await adminCourseReviewAPI.getApproved(params)
          : filterTab === 'rejected'
          ? await adminCourseReviewAPI.getRejected(params)
          : await adminCourseReviewAPI.getPending(params);
      setCourses(response.data.courses || []);
      setTotalPages(response.data.totalPages || 1);
    } catch {
      toast.error('Lỗi khi tải danh sách khoá học');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (course) => {
    try {
      setLoading(true);
      const response = await adminCourseReviewAPI.getByIdForReview(course._id);
      setSelectedCourse(response.data.data);
      setShowModal(true);
    } catch {
      toast.error('Lỗi khi tải chi tiết khoá học');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setRejectionReason('');
    setExpandedLessonId(null);
    setLessonDetail(null);
  };

  const handleExpandLesson = async (lesson) => {
    if (expandedLessonId === lesson._id) {
      setExpandedLessonId(null);
      setLessonDetail(null);
      return;
    }
    try {
      setLoadingLesson(true);
      const response = await adminCourseReviewAPI.getLessonDetail(lesson._id);
      setLessonDetail(response.data.data);
      setExpandedLessonId(lesson._id);
    } catch {
      toast.error('Lỗi khi tải chi tiết bài học');
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt khoá học này?')) return;
    try {
      setActionLoading(true);
      await adminCourseReviewAPI.approve(courseId);
      toast.success('Khoá học đã được duyệt thành công');
      closeModal();
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi duyệt khoá học');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async (courseId) => {
    if (!rejectionReason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    if (!window.confirm('Bạn có chắc muốn từ chối khoá học này?')) return;
    try {
      setActionLoading(true);
      await adminCourseReviewAPI.reject(courseId, rejectionReason);
      toast.success('Khoá học đã bị từ chối');
      closeModal();
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối khoá học');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      pending:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
      approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    };
    const label = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>
        {label[status] || status}
      </span>
    );
  };

  const levelLabel = (l) => ({ beginner: 'Người mới bắt đầu', intermediate: 'Trung cấp', advanced: 'Nâng cao', all: 'Tất cả cấp độ' }[l] || 'N/A');

  const totalLessons = (course) => course?.chapters?.reduce((a, ch) => a + (ch.lessons?.length || 0), 0) || 0;

  return (
    <div className="animate-fade-in max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Duyệt Khoá Học</h1>
        <p className="text-slate-400 text-sm">Kiểm tra và duyệt khoá học từ giảng viên</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilterTab(tab); setPage(1); }}
            className={`px-4 py-3 font-medium transition ${
              filterTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'pending' && '⏳ Chờ Duyệt'}
            {tab === 'approved' && '✅ Đã Duyệt'}
            {tab === 'rejected' && '❌ Bị Từ Chối'}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Đang tải...</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {filterTab === 'pending' && 'Không có khoá học chờ duyệt'}
            {filterTab === 'approved' && 'Không có khoá học đã duyệt'}
            {filterTab === 'rejected' && 'Không có khoá học bị từ chối'}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Tên Khoá Học</th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Giảng Viên</th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-800/30 transition group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition truncate max-w-xs">{course.title}</div>
                        <div className="text-xs text-slate-500">{course.category?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{course.instructor?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{statusBadge(course.reviewStatus)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetail(course)}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 rounded-lg transition-all text-sm"
                        >
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-800">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center transition-all ${
                      page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto max-w-4xl w-full shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-start z-10">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-lg font-bold text-white">{selectedCourse.title}</h2>
                  {statusBadge(selectedCourse.reviewStatus)}
                </div>
                <p className="text-sm text-slate-400">
                  <span>👤 Giảng viên: <span className="text-slate-300 font-medium">{selectedCourse.instructor?.name}</span></span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span>Danh mục: <span className="text-blue-400 font-medium">{selectedCourse.category?.name}</span></span>
                </p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition flex-shrink-0 mt-1">
                ✕
              </button>
            </div>

            {/* Body: 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">

              {/* Left: Thumbnail + Description */}
              <div className="p-6 space-y-5">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-800/50 aspect-video flex items-center justify-center relative">
                  {selectedCourse.thumbnail ? (
                    <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <span className="text-4xl">🎬</span>
                      <span className="text-xs">Chưa có ảnh bìa</span>
                    </div>
                  )}
                  {selectedCourse.promoVideoUrl && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      Video giới thiệu (Promo)
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Mô tả khoá học</h3>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedCourse.description || selectedCourse.shortDescription || 'Không có mô tả'}
                  </p>
                </div>

                {selectedCourse.reviewStatus === 'rejected' && selectedCourse.rejectionReason && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-400 uppercase mb-1">Lý do từ chối</p>
                    <p className="text-red-300 text-sm">{selectedCourse.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Right: Price + Stats + Actions + Curriculum */}
              <div className="p-6 space-y-5">

                {/* Price */}
                <p className="text-3xl font-extrabold text-blue-400">
                  {selectedCourse.isFree ? 'Miễn phí' : `${Number(selectedCourse.price || 0).toLocaleString('vi-VN')}đ`}
                </p>

                {/* Stats */}
                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-sm py-1">
                    <span className="text-slate-400">📚 Tổng số bài học</span>
                    <span className="text-white font-semibold">{totalLessons(selectedCourse)} bài</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1">
                    <span className="text-slate-400">📶 Trình độ</span>
                    <span className="text-white font-semibold">{levelLabel(selectedCourse.level)}</span>
                  </div>
                </div>

                {/* Actions (pending only) */}
                {selectedCourse.reviewStatus === 'pending' && (
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveCourse(selectedCourse._id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                      >
                        ✅ Phê duyệt
                      </button>
                      <button
                        onClick={() => handleRejectCourse(selectedCourse._id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-red-400 hover:text-red-300 font-semibold border border-red-500/40 hover:bg-red-500/10 rounded-xl transition disabled:opacity-50"
                      >
                        ✕ Từ chối
                      </button>
                    </div>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Lý do từ chối (bắt buộc khi từ chối)..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none text-sm"
                      rows="3"
                    />
                  </div>
                )}

                {/* Curriculum */}
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-base font-bold text-white mb-4">📖 Nội dung chương trình</h3>
                  {selectedCourse.chapters?.length > 0 ? (
                    <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
                      {selectedCourse.chapters.map((ch, idx) => (
                        <div key={ch._id}>
                          <p className="text-sm font-bold text-slate-300 mb-2 px-1">
                            Chương {idx + 1}: {ch.title}
                          </p>
                          <div className="space-y-2">
                            {ch.lessons?.map((lesson) => (
                              <div key={lesson._id}>
                                <button
                                  onClick={() => handleExpandLesson(lesson)}
                                  disabled={loadingLesson}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition text-left group"
                                >
                                  <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm flex-shrink-0 ${
                                    lesson.type === 'video' ? 'bg-blue-500/15 text-blue-400' :
                                    lesson.type === 'quiz'  ? 'bg-purple-500/15 text-purple-400' :
                                                              'bg-slate-700 text-slate-400'
                                  }`}>
                                    {lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '?' : '📄'}
                                  </span>
                                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition flex-1">
                                    {lesson.title}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {expandedLessonId === lesson._id ? '▲' : '▼'}
                                  </span>
                                </button>

                                {expandedLessonId === lesson._id && (
                                  <div className="ml-12 mt-2 mb-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
                                    {loadingLesson ? (
                                      <p className="text-slate-400 text-xs">Đang tải...</p>
                                    ) : lessonDetail ? (
                                      <>
                                        {lessonDetail.type === 'video' && lessonDetail.video_url && (
                                          <div className="aspect-video bg-slate-950 rounded overflow-hidden">
                                            {lessonDetail.video_url.includes('youtube') || lessonDetail.video_url.includes('youtu.be') ? (
                                              <iframe width="100%" height="100%" src={lessonDetail.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} title={lessonDetail.title} frameBorder="0" allowFullScreen className="w-full h-full" />
                                            ) : (
                                              <video src={lessonDetail.video_url} controls className="w-full h-full" />
                                            )}
                                          </div>
                                        )}
                                        {lessonDetail.type === 'text' && lessonDetail.text_content && (
                                          <div className="text-slate-300 text-xs max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">{lessonDetail.text_content}</div>
                                        )}
                                        {lessonDetail.type === 'quiz' && lessonDetail.questions?.length > 0 && (
                                          <div className="space-y-2">
                                            {lessonDetail.questions.map((q, qi) => (
                                              <div key={qi} className="text-xs">
                                                <p className="text-slate-200 font-medium mb-1">Q{qi + 1}: {q.question}</p>
                                                {q.options.map((opt, oi) => (
                                                  <p key={oi} className={`ml-2 ${oi === q.correctIndex ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                                                    {oi === q.correctIndex ? '✓' : '○'} {opt}
                                                  </p>
                                                ))}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {!lessonDetail.video_url && !lessonDetail.text_content && !(lessonDetail.questions?.length > 0) && (
                                          <p className="text-slate-500 text-xs italic">Chưa có nội dung</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-slate-500 text-xs">Không tải được nội dung</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic">Chưa có nội dung</p>
                  )}
                </div>

                {/* Close (non-pending) */}
                {selectedCourse.reviewStatus !== 'pending' && (
                  <button
                    onClick={closeModal}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition text-sm"
                  >
                    Đóng
                  </button>
                )}

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
